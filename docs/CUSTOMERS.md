# 客户名录与多访档案（销售工程师备战台）

## 目的

把你准备过的客户做成**名录**：名称、一句话、联系人、推进阶段、备战备注、累计事实/缺口、拜访记录。  
会前从名录选用客户，只贴本场新纪要即可继续备战。

## 数据位置

`data/customers/*.json`（仅本机，已 gitignore）

## 名录字段

| 字段 | 说明 |
|------|------|
| name | 客户名称 |
| one_liner | 客户一句话 |
| contact | 关键联系人 / 对接人 |
| stage | 推进阶段：lead / discovery / solution / pilot / won / lost / hold |
| owner_note | 你自己的备战备注（提醒、待办） |
| scene_default | 默认行业场景 |
| competitors / our_product_brief | 可复用到生成 |
| confirmed_facts | 跨拜访累计事实 |
| open_gaps | 仍待验证的缺口 |
| visits[] | 拜访列表 |

## 界面用法

1. 右侧 **客户名录**：搜索、点选「选用」、删除  
2. 左侧 **新建客户**：写入名录（可填阶段 / 联系人 / 备注）  
3. 生成后 **合并进档案**：把本场核实的事实/缺口写回名录  
4. **生成历史** 标签页：单次草稿归档（与名录分开）

## 推荐流程

1. 新建客户 → 进入名录  
2. 第 1 次拜访：名录选用 → 贴纪要 → 生成 → 合并事实/缺口  
3. 之后各访：同一客户选用 → 只贴新纪要 → 生成 → 再合并  
4. 随推进改阶段：线索 → 摸底 → 方案 → 试点  

## API

- `GET/POST /api/customers`
- `GET/PATCH/DELETE /api/customers/{id}`
- `POST /api/customers/{id}/merge`
- `POST /api/generate` 支持 `customer_id`、`record_visit`

## 隔离说明

- 客户与客户之间靠不同 JSON 文件隔离  
- 单次生成靠档案摘要显式注入，不靠聊天记忆串访  
- 合并需你确认后写入，避免模型幻觉直接污染名录  
