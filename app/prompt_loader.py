from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROMPTS = ROOT / "prompts"

SCENE_CONTEXT_FILES = {
    "vision": "vision_context.md",
    "ict": "ict_context.md",
    "chip": "chip_context.md",
}


def _read(name: str) -> str:
    path = PROMPTS / name
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
    return "\n".join(lines).strip()


def load_system_prompt() -> str:
    return _read("system.md")


def load_scene_context(scene: str) -> str | None:
    key = (scene or "vision").strip().lower()
    filename = SCENE_CONTEXT_FILES.get(key)
    if not filename:
        return None
    path = PROMPTS / filename
    if not path.is_file():
        return None
    return _read(filename)


def build_user_message(
    *,
    scene: str,
    customer_one_liner: str,
    meeting_goal: str,
    known_context: str,
    competitors: str,
    our_product_brief: str,
    notes: str,
    profile_context: str = "",
) -> str:
    template = _read("user_template.md")
    marker = "请根据以下输入"
    if marker in template:
        template = template[template.index(marker) :]

    known = known_context.strip() or "（无）"
    if profile_context.strip():
        known = profile_context.strip() + "\n\n【本场补充已知信息】\n" + known

    return (
        template.replace("{{scene}}", scene.strip())
        .replace("{{customer_one_liner}}", customer_one_liner.strip())
        .replace("{{meeting_goal}}", meeting_goal.strip())
        .replace("{{known_context}}", known)
        .replace("{{competitors}}", competitors.strip() or "（无）")
        .replace("{{our_product_brief}}", our_product_brief.strip() or "（未提供，建议对齐处写待补充）")
        .replace("{{notes}}", notes.strip())
    )


def build_messages(payload: dict) -> list[dict[str, str]]:
    system = load_system_prompt()
    scene = (payload.get("scene") or "vision").strip().lower()
    context = load_scene_context(scene)
    if context:
        system = system + "\n\n---\n\n" + context

    if payload.get("profile_context"):
        system = (
            system
            + "\n\n---\n\n"
            + "若输入含【客户档案】：累计已确认事实视为跨拜访 fact；"
            + "开放缺口优先变成 Discovery；本场纪要中的新信息与档案冲突时，以本场 stated 为准并在缺口中标出冲突。"
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


def load_dry_run_output() -> str:
    path = PROMPTS / "runs" / "customer_a_round1.md"
    text = path.read_text(encoding="utf-8")
    for marker in ("以下为草稿", "## 1. 客户画像"):
        if marker in text:
            return text[text.index(marker) :].strip()
    return text.strip()
