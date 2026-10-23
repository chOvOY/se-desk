from __future__ import annotations

import operator
from typing import Annotated, Any, TypedDict


class PrepState(TypedDict, total=False):
    """会前备战多智能体共享状态。"""

    payload: dict[str, Any]
    profile_md: str
    asis_needs_md: str
    competitive_md: str
    briefing_md: str
    # 并行节点各自 append；assemble 汇总提示
    agent_warnings: Annotated[list[str], operator.add]
    markdown: str
