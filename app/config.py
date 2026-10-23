from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    llm_api_key: str = ""
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"
    dry_run: bool = False
    # 默认走开源 LangGraph 多智能体；设 false 可回退单次大模型生成
    use_multi_agent: bool = True
    # 单个智能体调用超时（秒）；超时则该节点降级占位，不阻塞整图汇合过久
    agent_timeout_seconds: float = 90.0
    # 单节点失败后额外重试次数（0=只试 1 次）
    agent_max_retries: int = 1
    host: str = "127.0.0.1"
    port: int = 8765


@lru_cache
def get_settings() -> Settings:
    return Settings()
