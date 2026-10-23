# 提示词使用说明（阶段 3）

## 文件

| 文件 | 用途 |
|------|------|
| [system.md](system.md) | 系统提示词（角色、硬约束、七段结构） |
| [vision_context.md](vision_context.md) | vision 场景精简上下文 |
| [ict_context.md](ict_context.md) | ict 场景精简上下文 |
| [chip_context.md](chip_context.md) | chip 场景精简上下文（轻量） |
| [user_template.md](user_template.md) | 用户消息模板 |
| [eval_customer_a.md](eval_customer_a.md) | 用客户 A 验收的步骤与清单 |
| [run_customer_a.md](run_customer_a.md) | 客户 A 一键粘贴试跑 |

## Phase 0 手动跑法

1. 打开任意对话模型。  
2. 将 `system.md` 全文设为 System。  
3. 按场景追加 `vision_context.md` / `ict_context.md` / `chip_context.md`。  
4. 按 `user_template.md` 填入输入。  
5. 对照样例与验收清单。  

阶段 4+ Web 会按 `scene` 自动拼接对应上下文，并将结果写入 `data/history/`。
