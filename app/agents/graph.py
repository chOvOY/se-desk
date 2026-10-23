from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from app.agents.nodes import (
    asis_needs_node,
    assemble_node,
    briefing_node,
    competitive_node,
    profile_node,
)
from app.agents.state import PrepState

_GRAPH = None


def build_graph():
    g = StateGraph(PrepState)
    g.add_node("profile_agent", profile_node)
    g.add_node("asis_needs_agent", asis_needs_node)
    g.add_node("competitive_agent", competitive_node)
    g.add_node("briefing_agent", briefing_node)
    g.add_node("assemble", assemble_node)

    # 四个专业智能体并行，再汇总
    g.add_edge(START, "profile_agent")
    g.add_edge(START, "asis_needs_agent")
    g.add_edge(START, "competitive_agent")
    g.add_edge(START, "briefing_agent")
    g.add_edge("profile_agent", "assemble")
    g.add_edge("asis_needs_agent", "assemble")
    g.add_edge("competitive_agent", "assemble")
    g.add_edge("briefing_agent", "assemble")
    g.add_edge("assemble", END)
    return g.compile()


def get_graph():
    global _GRAPH
    if _GRAPH is None:
        _GRAPH = build_graph()
    return _GRAPH


async def run_presales_agents(payload: dict) -> str:
    """运行开源 LangGraph 多智能体流水线，返回汇总后的七段 Markdown。

    四个专业节点并行；单节点超时/失败会降级占位，assemble 仍会拼出完整结构，
    保证同一张图能跑到 END（详见 nodes._run_agent_resilient）。
    """
    graph = get_graph()
    result = await graph.ainvoke({"payload": payload, "agent_warnings": []})
    text = (result.get("markdown") or "").strip()
    if not text:
        raise RuntimeError("多智能体未产出有效草稿")
    return text
