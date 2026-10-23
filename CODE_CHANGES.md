## [修改日期: 2026-10-23 14:52]

### 修改文件: app/agents/nodes.py, app/agents/state.py, app/agents/graph.py, app/config.py, app/llm.py, .env.example, docs/AGENTS.md

**修改意图**: 单智能体超时/失败时降级占位，保证 LangGraph 同一张图仍能汇合跑完并输出完整七段结构。

**变更内容**:
```
+ AGENT_TIMEOUT_SECONDS / AGENT_MAX_RETRIES 配置
+ _run_agent_resilient：wait_for + 重试 + 固定标题占位
+ PrepState.agent_warnings 用 Annotated reducer 合并并行告警
+ assemble 文首提示部分降级；缺段时再兜底占位
+ chat_completion 支持按智能体超时传入 httpx timeout
```
---
