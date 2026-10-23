# 进度日志（销售工程师备战台）

## 2026-10-23

- 接入开源 LangGraph 多智能体编排：`app/agents/`
- 四个专业智能体并行：客户画像 / 现状与需求 / 竞品对比 / 讲解与风险，再汇总七段草稿
- 配置项 `USE_MULTI_AGENT`（默认 true）；健康检查返回智能体列表
- 演示模式仍走样例，不调多智能体

## 2026-09-24

- 客户档案 + 多访：`app/customers.py`、`/api/customers*`、生成注入档案摘要、前端新建/选择/合并
- 说明见 `docs/CUSTOMERS.md`

## 2026-09-23

- 前端界面优化：工作台布局、状态灯、加载态、历史标签与时间格式、字体与青绿视觉方向
- 深信服售前模拟 live 样例：`content/samples/sangfor_sim_live_output.md`


### 已完成

- `content/scenes/scene_ict.md` 完整场景包
- `content/scenes/scene_chip.md` 轻量场景包（强调 FAE 待确认）
- `prompts/ict_context.md`、`prompts/chip_context.md`
- `app/prompt_loader.py` 按 scene 自动拼接上下文
- `app/history.py` + `/api/history`：本地 JSON 归档
- 前端：三场景文案、客户 B 一键填入、历史列表回看
- 阶段 1–6 全部 complete

### 使用提醒

- 重启 `python -m app.run` 后生效  
- 历史文件在 `data/history/`（已 gitignore json）  
- 手改/纯手写计时仍待你填 `docs/TIMING.md`

## 2026-09-19（阶段 1–5）

- 定位、样例、提示词、网页、live 生成与面试口径
