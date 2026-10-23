from __future__ import annotations

import asyncio
import logging

from app.agents.state import PrepState
from app.config import Settings, get_settings
from app.llm import chat_completion
from app.prompt_loader import build_user_message, load_scene_context, load_system_prompt

logger = logging.getLogger(__name__)

DISCLAIMER = (
    "> 以下为草稿，需结合公司官方资料与合规要求核实后再用于客户讲解；"
    "禁止在客户现场演示本工具；竞品对比不得使用未经核实的贬低性表述。"
)

AGENT_SPECS: dict[str, dict[str, str]] = {
    "profile": {
        "name": "客户画像智能体",
        "state_key": "profile_md",
        "focus": (
            "你只负责输出「## 1. 客户画像（事实 / 假设 / 缺口）」这一段 Markdown。"
            "必须分栏列出事实、假设（含待验证）、缺口（写清影响）与干系人线索。"
            "关键结论标注证据强度：stated / implied / assumed / from_our_brief / unverified。"
            "不要输出其他段落标题。"
        ),
    },
    "asis_needs": {
        "name": "现状与需求智能体",
        "state_key": "asis_needs_md",
        "focus": (
            "你只负责输出两段 Markdown，且标题必须为：\n"
            "## 2. 客户当前在做什么（As-Is）\n"
            "## 3. 痛点与需要的产品\n"
            "先写清客户现状手段与不满，再写痛点卡、需求清单与 Must/Should/Could/Non-goal。"
            "不要编造输入中未给出的具体数字。不要输出第 1、4、5、6、7 段。"
        ),
    },
    "competitive": {
        "name": "竞品对比智能体",
        "state_key": "competitive_md",
        "focus": (
            "你只负责输出「## 4. 我方与其他产品的异同」这一段 Markdown。"
            "按维度写相同点、差异点、可强调点、需谨慎/待核实点；无依据不贬低竞品。"
            "结尾给一句话备战结论。不要输出其他段落。"
        ),
    },
    "briefing": {
        "name": "讲解与风险智能体",
        "state_key": "briefing_md",
        "focus": (
            "你只负责输出三段 Markdown，且标题必须为：\n"
            "## 5. Discovery 问题清单\n"
            "## 6. 讲解提纲\n"
            "## 7. 风险 / 待确认 / 下一步\n"
            "先给优先验证的 3 个问题，再给完整提问清单；讲解提纲按痛点→能力→证据/Demo→下一步；"
            "风险段分三小节。Demo 只指向公司产品。不要输出第 1–4 段。"
        ),
    },
}

# 单节点失败/超时时仍写出固定标题，保证 assemble 能拼完整七段结构
_FALLBACK_MD: dict[str, str] = {
    "profile": """## 1. 客户画像（事实 / 假设 / 缺口）

> 【本段自动降级】生成失败或超时，请根据纪要手工补全。

### 事实
- 待确认

### 假设（待验证）
- 待确认

### 缺口
- 待确认

### 干系人线索
- 待确认
""",
    "asis_needs": """## 2. 客户当前在做什么（As-Is）

> 【本段自动降级】生成失败或超时，请根据纪要手工补全。

| 字段 | 内容 |
|------|------|
| 现状一句话 | 待确认 |
| 现状手段 | 待确认 |
| 关键步骤 | 待确认 |
| 谁在做 | 待确认 |
| 当前尚可之处 | 待确认 |
| 当前失败/不满点 | 待确认 |
| 证据强度 | unverified |

## 3. 痛点与需要的产品

> 【本段自动降级】生成失败或超时，请根据纪要手工补全。

### 3.1 痛点卡
- 待确认

### 3.2 需求清单（需要对齐我方）
- 待确认

### 3.3 优先级汇总
- Must / Should / Could / Non-goal：待确认
""",
    "competitive": """## 4. 我方与其他产品的异同

> 【本段自动降级】生成失败或超时，请根据纪要手工补全。

| 维度 | 相同点 | 差异点 | 可讲要点 | 待核实 |
|------|--------|--------|----------|--------|
| 待补充 | 待确认 | 待确认 | 待确认 | 待确认 |

**备战结论：** 本段未生成成功，上场前请用官方资料手工对照。
""",
    "briefing": """## 5. Discovery 问题清单

> 【本段自动降级】生成失败或超时，请根据纪要手工补全。

### 优先验证（3 个）
1. 待确认
2. 待确认
3. 待确认

### 完整提问清单
- 待确认

## 6. 讲解提纲

> 【本段自动降级】生成失败或超时，请根据纪要手工补全。

| 环节 | 内容 |
|------|------|
| 痛点 | 待确认 |
| 对应能力 | 待确认 |
| 证据 / Demo | 待确认（仅公司产品） |
| 下一步 | 待确认 |

## 7. 风险 / 待确认 / 下一步

> 【本段自动降级】生成失败或超时，请根据纪要手工补全。

### 风险
- 待确认

### 待确认
- 待确认

### 下一步
- 待确认
""",
}


def _base_system(scene: str, profile_context: str = "") -> str:
    system = load_system_prompt()
    context = load_scene_context(scene)
    if context:
        system = system + "\n\n---\n\n" + context
    if profile_context.strip():
        system = (
            system
            + "\n\n---\n\n"
            + "若输入含【客户档案】：累计已确认事实视为跨拜访 fact；"
            + "开放缺口优先变成 Discovery；本场纪要中的新信息与档案冲突时，以本场 stated 为准并在缺口中标出冲突。"
        )
    return system


def _agent_messages(payload: dict, agent_key: str) -> list[dict[str, str]]:
    spec = AGENT_SPECS[agent_key]
    scene = (payload.get("scene") or "vision").strip().lower()
    system = _base_system(scene, payload.get("profile_context") or "")
    system = (
        system
        + "\n\n---\n\n"
        + f"【当前角色：{spec['name']}】\n"
        + spec["focus"]
        + "\n不要输出文首声明；声明由系统总装。"
    )
    user = build_user_message(
        scene=scene,
        customer_one_liner=payload["customer_one_liner"],
        meeting_goal=payload["meeting_goal"],
        known_context=payload.get("known_context") or "",
        competitors=payload.get("competitors") or "",
        our_product_brief=payload.get("our_product_brief") or "",
        notes=payload["notes"],
        profile_context=payload.get("profile_context") or "",
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def _fallback_md(agent_key: str, reason: str) -> str:
    body = _FALLBACK_MD[agent_key].rstrip()
    return f"{body}\n\n<!-- degrade: {reason[:200]} -->\n"


async def _run_agent(payload: dict, agent_key: str, settings: Settings) -> str:
    messages = _agent_messages(payload, agent_key)
    return await chat_completion(
        settings,
        messages,
        timeout=float(settings.agent_timeout_seconds),
    )


async def _run_agent_resilient(
    payload: dict,
    agent_key: str,
    settings: Settings,
) -> tuple[str, list[str]]:
    """超时/异常时降级占位，不抛错，保证图可汇合。"""
    name = AGENT_SPECS[agent_key]["name"]
    timeout = float(settings.agent_timeout_seconds)
    attempts = max(1, int(settings.agent_max_retries) + 1)
    last_err: BaseException | None = None

    for i in range(attempts):
        try:
            text = await asyncio.wait_for(
                _run_agent(payload, agent_key, settings),
                timeout=timeout,
            )
            text = (text or "").strip()
            if not text:
                raise RuntimeError("模型返回空内容")
            return text, []
        except asyncio.TimeoutError as exc:
            last_err = exc
            logger.warning("%s 第 %s/%s 次超时（%.0fs）", name, i + 1, attempts, timeout)
        except Exception as exc:  # noqa: BLE001 — 单节点不得拖垮整图
            last_err = exc
            logger.warning("%s 第 %s/%s 次失败: %s", name, i + 1, attempts, exc)

    reason = f"{type(last_err).__name__}: {last_err}" if last_err else "unknown"
    warn = f"{name} 已降级占位（{reason}）"
    logger.error(warn)
    return _fallback_md(agent_key, reason), [warn]


async def _agent_node(state: PrepState, agent_key: str) -> dict:
    settings = get_settings()
    text, warnings = await _run_agent_resilient(state["payload"], agent_key, settings)
    state_key = AGENT_SPECS[agent_key]["state_key"]
    return {state_key: text, "agent_warnings": warnings}


async def profile_node(state: PrepState) -> dict:
    return await _agent_node(state, "profile")


async def asis_needs_node(state: PrepState) -> dict:
    return await _agent_node(state, "asis_needs")


async def competitive_node(state: PrepState) -> dict:
    return await _agent_node(state, "competitive")


async def briefing_node(state: PrepState) -> dict:
    return await _agent_node(state, "briefing")


def assemble_node(state: PrepState) -> dict:
    warnings = state.get("agent_warnings") or []
    head = [DISCLAIMER, ""]
    if warnings:
        head.append("> **部分智能体已降级：** " + "；".join(warnings))
        head.append("")

    parts = [
        *head,
        state.get("profile_md") or _fallback_md("profile", "missing"),
        "",
        state.get("asis_needs_md") or _fallback_md("asis_needs", "missing"),
        "",
        state.get("competitive_md") or _fallback_md("competitive", "missing"),
        "",
        state.get("briefing_md") or _fallback_md("briefing", "missing"),
    ]
    markdown = "\n".join(parts).strip() + "\n"
    return {"markdown": markdown}
