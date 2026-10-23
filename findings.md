# 发现与结论（Sales Engineer Desk）

## 产品结论

- 工具定位是 **销售工程师会前备战台**，不是客户侧 Demo，也不是官方选型器。
- 核心分析三件套：
  1. 客户当前在做什么（As-Is）
  2. 需要的产品/能力（并对齐我方要点）
  3. 我方与竞品（或现状手段）异同
- 输出七段草稿，使用者手改后讲解公司产品；支持客户名录、多访档案与导出。

## 行业场景包（同一 SE 流程，不同语境）

| 赛道 | 典型销售对象 | 场景包 |
|------|--------------|--------|
| 工业 / 视觉工控 | 检测、传感、产线方案销售 | `scene_vision` |
| ICT / 企软 | 安全、远程接入、企业软件销售 | `scene_ict` |
| 芯片 / FAE | 器件与技术支持型销售 | `scene_chip`（轻量） |

流程与字段对销售工程师通用；场景包只换行业话术与需求类型。

## 文档权威源

| 文件 | 用途 |
|------|------|
| `docs/PURPOSE.md` | 作用、目的、边界 |
| `docs/FIELDS.md` | 字段与七段结构、硬约束 |
| `docs/INTERVIEW.md` | 对外讲述口径 |
| `content/scenes/` | 各行业场景包 |
| `content/capabilities/our_product_template.md` | 我方要点输入模板 |
| `prompts/system.md` | 生成主提示词 |

## 提示词验收时关注的失败模式

| 现象 | 原因假设 | 处理方向 |
|------|----------|----------|
| 编造检出率/价格 | 模型忽略约束 | `system.md` 已禁止；若真实 LLM 仍犯，追加「数值仅可来自 notes 原文」 |
| 跳过 As-Is 直接推荐 | 结构未强制 | 七段顺序写死 + vision_context 强调先 As-Is |
| 贬低竞品无依据 | 异同卡未要求证据 | 强制 unverified / 待确认；禁「一定更差」 |
| 把本工具写成给客户演示 | 边界未强调 | 文首声明 + 讲解段禁写本工具 |
| 把 MES 写成必须 | 未尊重 non_goal | 样例与验收清单单列 |

## 待用户确认

- ~~Phase 1 实现形态（Web vs CLI）~~ → 默认 Web
- ~~示例我方产品用通用占位还是某公司公开产品线~~ → 已用 VisionLine 占位

## 阶段 2 样例资产

| 文件 | 用途 |
|------|------|
| `content/capabilities/our_product_example_vision.md` | `our_product_brief` 示例 |
| `content/samples/customer_a_notes.md` | 输入 |
| `content/samples/customer_a_ideal_output.md` | 提示词验收标准（含不合格清单） |

## 阶段 3 提示词资产

| 文件 | 用途 |
|------|------|
| `prompts/system.md` | 系统提示词 |
| `prompts/vision_context.md` | vision 精简上下文 |
| `prompts/user_template.md` | 用户消息模板 |
| `prompts/run_customer_a.md` | 客户 A 可直接粘贴试跑 |
| `prompts/eval_customer_a.md` | 验收清单与试跑表 |
| `prompts/runs/customer_a_round1.md` | Round 1 模拟输出（结构自检通过） |
