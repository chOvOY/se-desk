from __future__ import annotations

import httpx

from app.config import Settings


async def chat_completion(
    settings: Settings,
    messages: list[dict[str, str]],
    timeout: float | None = None,
) -> str:
    if not settings.llm_api_key:
        raise RuntimeError(
            "未配置 LLM_API_KEY。请复制 .env.example 为 .env 并填写，或请求时使用 dry_run=true。"
        )

    url = settings.llm_base_url.rstrip("/") + "/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.llm_api_key}",
        "Content-Type": "application/json",
    }
    body = {
        "model": settings.llm_model,
        "messages": messages,
        "temperature": 0.3,
    }

    http_timeout = float(timeout) if timeout is not None else 120.0
    async with httpx.AsyncClient(timeout=http_timeout) as client:
        resp = await client.post(url, headers=headers, json=body)
        if resp.status_code >= 400:
            raise RuntimeError(f"LLM 请求失败 {resp.status_code}: {resp.text[:800]}")
        data = resp.json()

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(f"LLM 返回格式异常: {data!r}") from exc
