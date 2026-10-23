# 任务计划：销售工程师备战台（Sales Engineer Desk）

## 目标

在本仓库内交付可用的销售工程师会前备战流程与最小可演示工具：输入客户纪要 + 我方产品要点 + 竞品信息 → 输出七段草稿（含 As-Is、需要的产品、我方与竞品异同），供手改后讲解**公司产品**。

## 当前阶段

全部计划阶段 1–6 已完成。后续为使用与求职材料打磨（手改计时等）。

---

## 各阶段

### 阶段 1：定位与字段约定

- [x] 明确作用与目的（`docs/PURPOSE.md`）
- [x] 固定输入/痛点/As-Is/需求/异同/七段输出（`docs/FIELDS.md`）
- [x] 深耕场景包 `scene_vision`（含对比维度）
- [x] 我方产品要点模板（`content/capabilities/our_product_template.md`）
- [x] README 与目录骨架
- **状态：** complete

### 阶段 2：内容资产与样例（Phase 0 无代码验证）

- [x] 填写一份示例「我方产品要点」（公开口径占位，非真实司密）
- [x] 编写模拟客户 A 纪要（工厂外观检测，含现状 + 竞品线索）
- [x] 手写「理想七段输出」样例（作为提示词验收标准）
- [x] 样例索引 `content/samples/README.md`
- [x] （可选）浅写 `scene_ict` — 阶段 6 已升级为完整版
- **状态：** complete

### 阶段 3：生成提示词（Phase 0 可跑）

- [x] 编写主提示词：强制七段结构 + 硬约束（`prompts/system.md`）
- [x] vision 精简上下文 + 用户模板 + 客户 A 一键试跑稿
- [x] Round 1 按纪律模拟输出并对照验收清单（通过）
- [x] Round 2：live API（deepseek-v4.1-flash）生成并保存
- [x] 失败模式记入 `findings.md`
- **状态：** complete

### 阶段 4：最小可演示界面（Phase 1）

- [x] 选定实现形态：FastAPI + 静态页
- [x] 表单：场景、客户一句话、本场目标、纪要、我方要点、竞品
- [x] 调用模型生成七段 Markdown + 复制导出（复用 `prompts/`）
- [x] dry_run 演示模式（无密钥可跑客户 A 样例）
- [x] README 补充本地启动说明
- **状态：** complete

### 阶段 5：实测与求职材料

- [x] live 生成计时（93.2s）并保存 `customer_a_live_output.md`
- [x] 计时表 `docs/TIMING.md`（手改/纯手写待本人补测）
- [x] 面试/简历口径 `docs/INTERVIEW.md`
- [x] 浅样例客户 B（ICT）`customer_b_ict_notes.md`
- **状态：** complete（本人秒表两项待补）

### 阶段 6：扩展

- [x] `scene_ict` 完整版 + `prompts/ict_context.md`
- [x] `scene_chip` 轻量版 + `prompts/chip_context.md`
- [x] 按 scene 自动加载上下文（`prompt_loader`）
- [x] 历史记录 / 多案例归档（`data/history/` + API + 前端列表）
- **状态：** complete

---

## 关键问题

1. ~~Phase 1 用简单网页还是先 CLI/脚本？~~ → 默认简单网页（阶段 4）
2. ~~示例「我方产品」用通用视觉方案占位，还是按某一目标公司公开产品线写？~~ → 已用 VisionLine 通用占位

## 已做决策

| 决策 | 理由 |
|------|------|
| 个人自用草稿，不面向客户演示 | 入职后讲公司产品 |
| 七段输出含 As-Is / 需要的产品 / 异同 | 匹配销售工程师真实备战动作 |
| 先 vision 深耕，ICT/芯片后置 | 与课题及优先投递公司对齐 |
| 异同分析禁止未核实贬低与编造指标 | 合规与可信 |
| 全部工作仅在 `presales-prep/` | 用户明确要求 |
| 阶段 2 示例产品用 VisionLine 虚构占位 | 避免虚构真实厂商规格；入职后替换 |
| `scene_ict` 浅骨架推迟到阶段 6 | 阶段 2 聚焦可验收样例 |

## 遇到的错误

| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| （暂无） | — | — |

## 备注

- 状态流转：`pending` → `in_progress` → `complete`
- 每完成一小步更新 `progress.md`
- 决策与发现写入 `findings.md`
- 权威口径以 `docs/PURPOSE.md`、`docs/FIELDS.md` 为准
