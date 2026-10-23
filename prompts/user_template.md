# 用户消息模板

将下方占位符替换为实际内容。不要删除字段标签，便于模型解析。

---

请根据以下输入，输出七段销售工程师备战草稿。

### 输入

- scene: `{{scene}}`
- customer_one_liner: `{{customer_one_liner}}`
- meeting_goal: `{{meeting_goal}}`（discovery | solution | pilot）
- known_context: `{{known_context}}`
- competitors: `{{competitors}}`
- our_product_brief:
```text
{{our_product_brief}}
```
- notes（会议纪要/原文）:
```text
{{notes}}
```

### 要求提醒

1. 严格遵循系统提示词的七段结构与文首声明。  
2. 先分析客户当前在做什么，再写需要的产品，再写我方与竞品/现状异同。  
3. 数字与竞品贬低：无输入依据则待确认 / unverified。  
4. 讲解与 Demo 建议只指向公司产品侧。

请开始输出。
