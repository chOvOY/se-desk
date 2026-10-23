from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parent.parent
HISTORY_DIR = ROOT / "data" / "history"


def _ensure_dir() -> None:
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)


def save_record(
    *,
    scene: str,
    customer_one_liner: str,
    meeting_goal: str,
    markdown: str,
    mode: str,
    customer_id: str | None = None,
) -> dict:
    _ensure_dir()
    record_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid4().hex[:8]
    record = {
        "id": record_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "scene": scene,
        "customer_one_liner": customer_one_liner,
        "meeting_goal": meeting_goal,
        "mode": mode,
        "markdown": markdown,
        "customer_id": customer_id,
    }
    path = HISTORY_DIR / f"{record_id}.json"
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    return {
        "id": record_id,
        "created_at": record["created_at"],
        "scene": scene,
        "customer_one_liner": customer_one_liner,
        "mode": mode,
        "customer_id": customer_id,
    }


def list_records(limit: int = 30) -> list[dict]:
    _ensure_dir()
    files = sorted(HISTORY_DIR.glob("*.json"), reverse=True)
    items: list[dict] = []
    for path in files[:limit]:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        items.append(
            {
                "id": data.get("id", path.stem),
                "created_at": data.get("created_at", ""),
                "scene": data.get("scene", ""),
                "customer_one_liner": data.get("customer_one_liner", ""),
                "meeting_goal": data.get("meeting_goal", ""),
                "mode": data.get("mode", ""),
            }
        )
    return items


def get_record(record_id: str) -> dict | None:
    _ensure_dir()
    # prevent path traversal
    safe = Path(record_id).name
    path = HISTORY_DIR / f"{safe}.json"
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
