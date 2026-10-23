from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parent.parent
CUSTOMERS_DIR = ROOT / "data" / "customers"


def _ensure_dir() -> None:
    CUSTOMERS_DIR.mkdir(parents=True, exist_ok=True)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_id(raw: str) -> str:
    return Path(raw).name


def _slug(name: str) -> str:
    base = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", name.strip(), flags=re.UNICODE)
    base = re.sub(r"-+", "-", base).strip("-") or "customer"
    return base[:40]


def _path(customer_id: str) -> Path:
    return CUSTOMERS_DIR / f"{_safe_id(customer_id)}.json"


def _new_customer(
    *,
    name: str,
    one_liner: str = "",
    scene_default: str = "vision",
    competitors: str = "",
    our_product_brief: str = "",
    contact: str = "",
    stage: str = "lead",
    owner_note: str = "",
) -> dict:
    cid = datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + _slug(name) + "-" + uuid4().hex[:6]
    return {
        "id": cid,
        "name": name.strip(),
        "one_liner": one_liner.strip(),
        "scene_default": scene_default,
        "competitors": competitors,
        "our_product_brief": our_product_brief,
        "contact": contact.strip(),
        "stage": stage.strip() or "lead",
        "owner_note": owner_note.strip(),
        "confirmed_facts": [],
        "open_gaps": [],
        "visit_count": 0,
        "visits": [],
        "created_at": _now(),
        "updated_at": _now(),
    }


def save_customer(customer: dict) -> dict:
    _ensure_dir()
    customer = dict(customer)
    customer["updated_at"] = _now()
    path = _path(customer["id"])
    path.write_text(json.dumps(customer, ensure_ascii=False, indent=2), encoding="utf-8")
    return customer


def create_customer(
    *,
    name: str,
    one_liner: str = "",
    scene_default: str = "vision",
    competitors: str = "",
    our_product_brief: str = "",
    contact: str = "",
    stage: str = "lead",
    owner_note: str = "",
) -> dict:
    if not name.strip():
        raise ValueError("客户名称不能为空")
    customer = _new_customer(
        name=name,
        one_liner=one_liner,
        scene_default=scene_default,
        competitors=competitors,
        our_product_brief=our_product_brief,
        contact=contact,
        stage=stage,
        owner_note=owner_note,
    )
    return save_customer(customer)


def get_customer(customer_id: str) -> dict | None:
    _ensure_dir()
    path = _path(customer_id)
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def list_customers(limit: int = 50) -> list[dict]:
    _ensure_dir()
    files = sorted(CUSTOMERS_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    items: list[dict] = []
    for path in files[:limit]:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        facts = data.get("confirmed_facts") or []
        gaps = data.get("open_gaps") or []
        items.append(
            {
                "id": data.get("id", path.stem),
                "name": data.get("name", ""),
                "one_liner": data.get("one_liner", ""),
                "scene_default": data.get("scene_default", "vision"),
                "contact": data.get("contact", ""),
                "stage": data.get("stage", "lead"),
                "owner_note": data.get("owner_note", ""),
                "visit_count": data.get("visit_count", len(data.get("visits") or [])),
                "fact_count": len(facts) if isinstance(facts, list) else 0,
                "gap_count": len(gaps) if isinstance(gaps, list) else 0,
                "updated_at": data.get("updated_at", ""),
                "created_at": data.get("created_at", ""),
            }
        )
    return items


def delete_customer(customer_id: str) -> bool:
    _ensure_dir()
    path = _path(customer_id)
    if not path.is_file():
        return False
    path.unlink()
    return True


def update_customer(customer_id: str, patch: dict) -> dict | None:
    customer = get_customer(customer_id)
    if not customer:
        return None
    # 兼容旧档案缺字段
    customer.setdefault("contact", "")
    customer.setdefault("stage", "lead")
    customer.setdefault("owner_note", "")
    allowed = {
        "name",
        "one_liner",
        "scene_default",
        "competitors",
        "our_product_brief",
        "confirmed_facts",
        "open_gaps",
        "contact",
        "stage",
        "owner_note",
    }
    for key, value in patch.items():
        if key in allowed:
            customer[key] = value
    if "confirmed_facts" in patch and isinstance(patch["confirmed_facts"], list):
        customer["confirmed_facts"] = _dedupe_str_list(patch["confirmed_facts"])
    if "open_gaps" in patch and isinstance(patch["open_gaps"], list):
        customer["open_gaps"] = _dedupe_str_list(patch["open_gaps"])
    if "stage" in patch:
        customer["stage"] = str(patch["stage"] or "lead").strip() or "lead"
    return save_customer(customer)


def _dedupe_str_list(items: list) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for item in items:
        text = str(item).strip()
        if not text or text in seen:
            continue
        seen.add(text)
        out.append(text)
    return out


def merge_into_customer(
    customer_id: str,
    *,
    add_facts: list[str] | None = None,
    add_gaps: list[str] | None = None,
    remove_gaps: list[str] | None = None,
) -> dict | None:
    customer = get_customer(customer_id)
    if not customer:
        return None
    facts = list(customer.get("confirmed_facts") or [])
    gaps = list(customer.get("open_gaps") or [])
    facts = _dedupe_str_list(facts + list(add_facts or []))
    remove_set = {g.strip() for g in (remove_gaps or []) if str(g).strip()}
    gaps = [g for g in gaps if g not in remove_set]
    gaps = _dedupe_str_list(gaps + list(add_gaps or []))
    customer["confirmed_facts"] = facts
    customer["open_gaps"] = gaps
    return save_customer(customer)


def add_visit(
    customer_id: str,
    *,
    meeting_goal: str,
    scene: str,
    history_id: str | None,
    notes_excerpt: str,
    mode: str,
) -> dict | None:
    customer = get_customer(customer_id)
    if not customer:
        return None
    visit = {
        "id": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid4().hex[:6],
        "created_at": _now(),
        "meeting_goal": meeting_goal,
        "scene": scene,
        "history_id": history_id,
        "notes_excerpt": (notes_excerpt or "")[:240],
        "mode": mode,
        "visit_no": int(customer.get("visit_count") or 0) + 1,
    }
    visits = list(customer.get("visits") or [])
    visits.append(visit)
    customer["visits"] = visits
    customer["visit_count"] = len(visits)
    return save_customer(customer)


def build_profile_context(customer: dict) -> str:
    """注入生成用的累计档案摘要。"""
    visit_count = int(customer.get("visit_count") or 0)
    next_no = visit_count + 1
    facts = customer.get("confirmed_facts") or []
    gaps = customer.get("open_gaps") or []
    lines = [
        f"【客户档案】名称：{customer.get('name', '')}",
        f"档案一句话：{customer.get('one_liner', '') or '（无）'}",
        f"推进阶段：{customer.get('stage', 'lead') or 'lead'}",
        f"关键联系人：{customer.get('contact', '') or '（未填）'}",
        f"本场为第 {next_no} 次拜访（档案内已记录 {visit_count} 次）",
        "以下为跨拜访累计信息：已确认事实可直接当作 fact；开放缺口优先写入 Discovery；本场纪要中的新信息单独标注。",
    ]
    note = (customer.get("owner_note") or "").strip()
    if note:
        lines.append(f"【SE 备战备注】{note}")
    if facts:
        lines.append("【累计已确认事实】")
        lines.extend(f"- {f}" for f in facts)
    else:
        lines.append("【累计已确认事实】（暂无）")
    if gaps:
        lines.append("【累计开放缺口 / 待验证】")
        lines.extend(f"- {g}" for g in gaps)
    else:
        lines.append("【累计开放缺口 / 待验证】（暂无）")
    recent = (customer.get("visits") or [])[-3:]
    if recent:
        lines.append("【近几次拜访】")
        for v in recent:
            lines.append(
                f"- #{v.get('visit_no')} {v.get('meeting_goal')} / {v.get('scene')} / {v.get('created_at', '')[:10]}：{v.get('notes_excerpt', '')}"
            )
    return "\n".join(lines)
