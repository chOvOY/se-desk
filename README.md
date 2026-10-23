# 销售工程师备战台（Sales Engineer Desk）

面向 **销售工程师（SE）/ ToB 技术销售** 的会前准备工具：把客户纪要整理成可手改的结构化草稿，用于下一场拜访与方案讲解准备。  
（内部备战用，不是给客户现场演示的产品。）

**核心能力：** 看清客户现状（As-Is）→ 对齐需要的产品/能力 → 梳理我方与竞品异同 → 产出提问清单与讲解提纲。  
**工作方式：** 输出是草稿；结合公司官方资料与合规要求核实后，再向客户讲解、演示**公司产品**。

完整说明见 [docs/PURPOSE.md](docs/PURPOSE.md)。

## 定位（摘要）

| 适合谁 | 销售工程师、技术销售、解决方案顾问，以及需要反复拜访同一客户的人 |
|--------|------------------------------------------------------------------|
| 解决什么 | 会前材料散、对比无结构、多访信息难累计、容易漏问或乱承诺 |
| 怎么用 | 选场景包 → 填纪要与我方要点 → 生成草稿 → 手改 → 上场讲公司方案 |
| 不做什么 | 不替代 CRM；不自动报价/选型；不做未核实的竞品打击；不当客户 Demo |

## 适用场景（可切换）

同一套流程，按行业切换「场景包」：

| 场景包 | 典型销售对象 |
|--------|----------------|
| 工业 / 视觉工控 | 检测、传感、产线工控类方案销售 |
| 企软 / 云安 ICT | 安全、远程接入、企业软件类销售 |
| 芯片 / FAE（轻量） | 器件与技术支持型销售 |

也可只把场景包当作行业话术模板；字段结构对各类 ToB 销售工程师通用。

## 本地启动

在本目录 `presales-prep/` 下执行（文件夹名为历史路径，产品名以本文为准）：

```bash
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python -m app.run
```

浏览器打开：http://127.0.0.1:8765

- **无密钥演示：** 勾选「演示模式」或在 `.env` 设 `DRY_RUN=true`，点样例再生成。  
- **真实生成：** 在 `.env` 填写 `LLM_API_KEY`、`LLM_BASE_URL`（OpenAI 兼容）、`LLM_MODEL`，取消演示模式。  
- **多智能体（默认）：** 基于开源 LangGraph，四个专业智能体并行生成后汇总；详见 [docs/AGENTS.md](docs/AGENTS.md)。设 `USE_MULTI_AGENT=false` 可回退单次生成。

## 目录

```
presales-prep/
  app/               # FastAPI：读 prompts、调 LLM、客户名录 API
  static/            # 前端工作台
  content/           # 场景包、产品要点模板、样例
  prompts/           # 系统提示词与试跑
  docs/              # 定位、字段、名录、讲述口径
```

## 输出结构（七段）

1. 客户画像（事实 / 假设 / 缺口）
2. 客户当前在做什么（As-Is）
3. 痛点与需要的产品
4. 我方与其他产品的异同
5. Discovery 问题清单
6. 讲解提纲
7. 风险 / 待确认 / 下一步

另支持：**客户名录与多访档案**、Markdown / 预览 HTML / PDF 导出。

## 文档索引

| 路径 | 说明 |
|------|------|
| [docs/PURPOSE.md](docs/PURPOSE.md) | 作用、目的、边界与成功标准 |
| [docs/CUSTOMERS.md](docs/CUSTOMERS.md) | 客户名录与多访用法 |
| [docs/FIELDS.md](docs/FIELDS.md) | 输入与七段输出字段约定 |
| [docs/INTERVIEW.md](docs/INTERVIEW.md) | 对外讲述 / 简历口径 |
| [docs/AGENTS.md](docs/AGENTS.md) | 多智能体职责与开关 |
| [docs/TIMING.md](docs/TIMING.md) | 生成耗时实测 |
| [content/scenes/](content/scenes/) | 各行业场景包 |
| [content/capabilities/](content/capabilities/) | 我方产品要点模板与示例 |
| [content/samples/](content/samples/) | 模拟客户样例 |
| [prompts/](prompts/) | 系统提示词与验收 |
| [task_plan.md](task_plan.md) | 分阶段任务计划 |
| [findings.md](findings.md) | 结论与待确认项 |
| [progress.md](progress.md) | 进度日志 |

## License

[MIT](LICENSE)
