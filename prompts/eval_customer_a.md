# 客户 A 验收步骤（阶段 3）

对照样例：`content/samples/customer_a_ideal_output.md`  
输入：`content/samples/customer_a_notes.md` + `content/capabilities/our_product_example_vision.md`

## 填入 user 消息的推荐值

- scene: `vision`
- customer_one_liner: 华东汽配冲压件厂，约 800 人，希望把外观检从人眼抽检改成在线视觉，减少流出客诉
- meeting_goal: `solution`
- known_context: 质量经理王工推动；设备部李工担心节拍和安装空间；采购会比价；竞品提到「星瞳视觉」在谈；预算口径未公开
- competitors: 星瞳视觉（在谈）；客户现状为人工抽检
- our_product_brief: 示例文件「可粘贴区」全文
- notes: 客户 A「纪要原文」全文

## 硬性不合格（出现任一项即 fail）

来自理想样例验收清单：

1. 出现具体检出率、报价数字、节拍 ms 等纪要未给数值  
2. 缺少 As-Is 或「需要的产品」或「异同」任一整节  
3. 贬低星瞳且无证据（如「星瞳一定更差」）  
4. 建议向客户演示本工具  
5. 把本期 MES 写成必须交付  

## 结构性合格（建议打勾）

- [ ] 文首有草稿声明  
- [ ] 七段标题齐全且顺序正确  
- [ ] 画像分栏含事实/假设/缺口  
- [ ] As-Is 写清人工抽检 + 星瞳在谈  
- [ ] 痛点覆盖：流出客诉、换型、安装/节拍、留图/PLC、POC  
- [ ] 需求对齐 VisionLine 能力；MES 为 non_goal 或本期不做  
- [ ] 异同含「相对人工」与「对星瞳同条件试样」逻辑  
- [ ] Discovery 有优先 3 问，且含样件标准、节拍/工位、星瞳对比维度  
- [ ] 讲解提纲不指向本工具  
- [ ] 下一步具体可执行  

## 试跑记录

| 轮次 | 日期 | 模型 | 硬性不合格项 | 结构缺口 | 对提示词的修改 |
|------|------|------|--------------|----------|----------------|
| 1 | 2026-09-19 | 按 system 纪律手写模拟（见 `runs/customer_a_round1.md`） | 无 | 无 | 暂不改 |
| 2 | 2026-09-19 | deepseek-v4.1-flash（百炼兼容 live） | 抽检未见编造检出率/贬低星瞳/演示本工具；MES 未写成必须 | 七段齐全（见 `content/samples/customer_a_live_output.md`，约 93s） | 暂不改 |
| 3 |  |  |  |  |  |