from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.agents import run_presales_agents
from app.config import ROOT, get_settings
from app.customers import (
    add_visit,
    build_profile_context,
    create_customer,
    delete_customer,
    get_customer,
    list_customers,
    merge_into_customer,
    update_customer,
)
from app.history import get_record, list_records, save_record
from app.llm import chat_completion
from app.prompt_loader import build_messages, load_dry_run_output

app = FastAPI(title="销售工程师备战台", version="0.5.0")
static_dir = ROOT / "static"
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


class GenerateRequest(BaseModel):
    scene: str = Field(default="vision", description="vision | ict | chip")
    customer_one_liner: str = Field(min_length=1)
    meeting_goal: str = Field(default="discovery", description="discovery | solution | pilot")
    known_context: str = ""
    competitors: str = ""
    our_product_brief: str = ""
    notes: str = Field(min_length=1)
    dry_run: bool | None = None
    save_history: bool = True
    customer_id: str | None = None
    record_visit: bool = True


class GenerateResponse(BaseModel):
    markdown: str
    mode: str
    history_id: str | None = None
    customer_id: str | None = None
    visit_no: int | None = None


class CustomerCreate(BaseModel):
    name: str = Field(min_length=1)
    one_liner: str = ""
    scene_default: str = "vision"
    competitors: str = ""
    our_product_brief: str = ""
    contact: str = ""
    stage: str = "lead"
    owner_note: str = ""


class CustomerUpdate(BaseModel):
    name: str | None = None
    one_liner: str | None = None
    scene_default: str | None = None
    competitors: str | None = None
    our_product_brief: str | None = None
    confirmed_facts: list[str] | None = None
    open_gaps: list[str] | None = None
    contact: str | None = None
    stage: str | None = None
    owner_note: str | None = None


class CustomerMerge(BaseModel):
    add_facts: list[str] = Field(default_factory=list)
    add_gaps: list[str] = Field(default_factory=list)
    remove_gaps: list[str] = Field(default_factory=list)


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(static_dir / "index.html")


@app.get("/api/health")
async def health() -> dict:
    settings = get_settings()
    return {
        "ok": True,
        "dry_run_default": settings.dry_run,
        "model": settings.llm_model,
        "has_api_key": bool(settings.llm_api_key),
        "use_multi_agent": settings.use_multi_agent,
        "agents": [
            "客户画像智能体",
            "现状与需求智能体",
            "竞品对比智能体",
            "讲解与风险智能体",
        ],
        "scenes": ["vision", "ict", "chip"],
    }


@app.get("/api/history")
async def history_list(limit: int = 30) -> dict:
    return {"items": list_records(limit=min(max(limit, 1), 100))}


@app.get("/api/history/{record_id}")
async def history_detail(record_id: str) -> dict:
    record = get_record(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")
    return record


@app.get("/api/customers")
async def customers_list(limit: int = 50) -> dict:
    return {"items": list_customers(limit=min(max(limit, 1), 100))}


@app.post("/api/customers")
async def customers_create(body: CustomerCreate) -> dict:
    try:
        return create_customer(
            name=body.name,
            one_liner=body.one_liner,
            scene_default=body.scene_default,
            competitors=body.competitors,
            our_product_brief=body.our_product_brief,
            contact=body.contact,
            stage=body.stage,
            owner_note=body.owner_note,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/customers/{customer_id}")
async def customers_detail(customer_id: str) -> dict:
    customer = get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="客户不存在")
    customer.setdefault("contact", "")
    customer.setdefault("stage", "lead")
    customer.setdefault("owner_note", "")
    return customer


@app.patch("/api/customers/{customer_id}")
async def customers_patch(customer_id: str, body: CustomerUpdate) -> dict:
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    customer = update_customer(customer_id, patch)
    if not customer:
        raise HTTPException(status_code=404, detail="客户不存在")
    return customer


@app.delete("/api/customers/{customer_id}")
async def customers_delete(customer_id: str) -> dict:
    if not delete_customer(customer_id):
        raise HTTPException(status_code=404, detail="客户不存在")
    return {"ok": True, "id": customer_id}


@app.post("/api/customers/{customer_id}/merge")
async def customers_merge(customer_id: str, body: CustomerMerge) -> dict:
    customer = merge_into_customer(
        customer_id,
        add_facts=body.add_facts,
        add_gaps=body.add_gaps,
        remove_gaps=body.remove_gaps,
    )
    if not customer:
        raise HTTPException(status_code=404, detail="客户不存在")
    return customer


@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest) -> GenerateResponse:
    settings = get_settings()
    use_dry = settings.dry_run if req.dry_run is None else req.dry_run

    payload = req.model_dump()
    profile = None
    visit_no = None
    if req.customer_id:
        profile = get_customer(req.customer_id)
        if not profile:
            raise HTTPException(status_code=404, detail="客户档案不存在")
        payload["profile_context"] = build_profile_context(profile)
        if not payload.get("competitors") and profile.get("competitors"):
            payload["competitors"] = profile["competitors"]
        if not payload.get("our_product_brief") and profile.get("our_product_brief"):
            payload["our_product_brief"] = profile["our_product_brief"]
        visit_no = int(profile.get("visit_count") or 0) + 1

    if use_dry:
        text = load_dry_run_output()
        mode = "dry_run"
    else:
        try:
            if settings.use_multi_agent:
                text = await run_presales_agents(payload)
                mode = "multi_agent"
            else:
                messages = build_messages(payload)
                text = await chat_completion(settings, messages)
                mode = "live"
        except RuntimeError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=502, detail=f"生成失败: {exc}") from exc

    history_id = None
    if req.save_history:
        meta = save_record(
            scene=req.scene,
            customer_one_liner=req.customer_one_liner,
            meeting_goal=req.meeting_goal,
            markdown=text,
            mode=mode,
            customer_id=req.customer_id,
        )
        history_id = meta["id"]

    if req.customer_id and req.record_visit and profile is not None:
        updated = add_visit(
            req.customer_id,
            meeting_goal=req.meeting_goal,
            scene=req.scene,
            history_id=history_id,
            notes_excerpt=req.notes,
            mode=mode,
        )
        if updated:
            visit_no = updated.get("visit_count")

    return GenerateResponse(
        markdown=text,
        mode=mode,
        history_id=history_id,
        customer_id=req.customer_id,
        visit_no=visit_no,
    )
