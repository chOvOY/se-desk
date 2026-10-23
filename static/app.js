const form = document.getElementById("form");
const output = document.getElementById("output");
const previewEl = document.getElementById("preview");
const errorEl = document.getElementById("error");
const modeEl = document.getElementById("mode");
const toastEl = document.getElementById("toast");
const viewTabs = document.getElementById("view-tabs");
const copyBtn = document.getElementById("copy");
const downloadMdBtn = document.getElementById("download-md");
const downloadHtmlBtn = document.getElementById("download-html");
const downloadPdfBtn = document.getElementById("download-pdf");
const submitBtn = document.getElementById("submit");
const healthEl = document.getElementById("health");
const historyList = document.getElementById("history-list");
const btnLabel = submitBtn.querySelector(".btn-label");
const btnSpinner = submitBtn.querySelector(".btn-spinner");
const customerSelect = document.getElementById("customer_select");
const customerMeta = document.getElementById("customer-meta");
const customerDetails = document.getElementById("customer-details");
const profileFacts = document.getElementById("profile_facts");
const profileGaps = document.getElementById("profile_gaps");
const profileContact = document.getElementById("profile_contact");
const profileStage = document.getElementById("profile_stage");
const profileNote = document.getElementById("profile_note");
const visitList = document.getElementById("visit-list");
const mergeBox = document.getElementById("merge-box");
const mergeStatus = document.getElementById("merge-status");
const directoryList = document.getElementById("directory-list");
const directorySearch = document.getElementById("directory-search");
const directoryCount = document.getElementById("directory-count");
const viewWorkbench = document.getElementById("view-workbench");
const viewDirectory = document.getElementById("view-directory");
const viewHistory = document.getElementById("view-history");
const breadcrumbCurrent = document.getElementById("breadcrumb-current");
const statCustomers = document.getElementById("stat-customers");
const statActive = document.getElementById("stat-active");
const statHistory = document.getElementById("stat-history");
const statScene = document.getElementById("stat-scene");
const sceneSelect = document.getElementById("scene");

const VIEW_LABELS = {
  workbench: "备战工作台",
  directory: "客户名录",
  history: "生成历史",
};

let activeAppView = "workbench";
let historyCount = 0;

let activeHistoryId = null;
let currentCustomer = null;
let currentMarkdown = "";
let currentView = "preview";
let toastTimer = null;
let directoryCache = [];
let directoryQuery = "";

const SAMPLE_A = {
  scene: "vision",
  meeting_goal: "solution",
  customer_one_liner:
    "华东汽配冲压件厂，约 800 人，希望把外观检从人眼抽检改成在线视觉，减少流出客诉",
  known_context:
    "质量经理王工推动；设备部李工担心节拍和安装空间；采购会比价；竞品提到「星瞳视觉」在谈；预算口径未公开",
  competitors: "星瞳视觉（在谈）；客户现状为人工抽检",
  our_product_brief: `【产品/方案名称】
VisionLine 外观在线检测方案（演练占位）

【一句话定位】
面向离散制造产线的外观缺陷在线检测：支持试样验证、配方换型、结果存图与常见 PLC/上位对接；具体检出指标以试样报告为准。

【主要能力点】
1. 外观缺陷在线检测（N-detect）
2. 误检阈值与复核（N-false）
3. 多品种配方/换型（N-changeover）
4. 节拍匹配选型支持（N-takt）
5. 存图与结果输出（N-trace）
6. PLC/IO 与上位对接（N-integrate）
7. 试样/POC（N-poc）
8. 调试培训与交付边界（N-support / N-cost）

禁止未核实就说具体检出率或比某竞品一定更准/更便宜。`,
  notes: `时间：2026-09-10 线上+车间短访
参会：质量王工、设备李工；我方销售工程师（演练）

王工：我们主要做汽车冲压钣金件，客户是整车厂，最近有两起外观缺陷流出，整车厂很不满意。现在是人工目视抽检，夜班更不稳定。想上在线视觉，至少把划伤、凹坑、边缘缺料这几类看住。

李工：产线大概每件几秒级节拍（具体数字他要回去查），工位很挤，灯也乱。之前看过星瞳视觉的方案，他们说能做，也愿意试样，但我们还没送样。星瞳报价还没正式出，只是感觉「整包有点贵」，具体多少不清楚。

王工：换型也不少，一天可能换两三个品种，调参要是太麻烦，产线工人搞不定。我们还希望不合格能留图，方便跟整车厂扯皮时有依据。最好能跟现有 PLC 给个 OK/NG 信号，至于 MES 这次不一定上。

采购（会后微信补充）：会货比三家，主要看效果、交期和总价；服务响应也要问清楚。

待办（客户侧）：整理 3～5 种典型不良样件；确认节拍与工位尺寸；约试样时间。

我方备忘：不要口头承诺检出率；先推试样成功标准；问清星瞳已承诺内容和对比维度。`,
};

const SAMPLE_B = {
  scene: "ict",
  meeting_goal: "discovery",
  customer_one_liner:
    "某制造集团 IT，约 2000 人，希望收敛分支安全与远程接入，减少VPN漏洞暴露",
  known_context:
    "信息安全负责人周工推动；分支工厂网络杂；已有传统 VPN；预算年度内；听说过零信任",
  competitors: "某头部安全厂商方案在短名单；现状为传统 VPN",
  our_product_brief: "（投 ICT 公司时替换为该公司公开产品线要点）",
  notes: `周工：分支十几个工厂，远程运维主要靠 VPN，账号共用情况不少，审计对不上。今年想做收敛，不一定上全套零信任品牌名，但要先摸清：谁在用、访问什么、怎么控权。

网络同事：出口带宽和专线成本也在看，别只谈安全不谈体验。采购会比两家，看试点能不能 1～2 个分支先跑。

待确认：现有 VPN 品牌、并发、是否有 MDM、等保要求级别、试点工厂名单。`,
};

function fillSample(sample) {
  for (const [key, value] of Object.entries(sample)) {
    const el = form.elements.namedItem(key);
    if (el) el.value = value;
  }
}

function linesToList(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function listToLines(list) {
  return (list || []).join("\n");
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sceneLabel(scene) {
  const map = { vision: "工业", ict: "ICT", chip: "芯片" };
  return map[scene] || scene || "—";
}

function stageLabel(stage) {
  const map = {
    lead: "线索",
    discovery: "摸底中",
    solution: "方案中",
    pilot: "试点中",
    won: "已成单",
    lost: "未成单",
    hold: "暂缓",
  };
  return map[stage] || stage || "线索";
}

function escapeAttr(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function setBusy(busy) {
  submitBtn.disabled = busy;
  btnSpinner.hidden = !busy;
  btnLabel.textContent = busy ? "生成中…" : "生成 SE 草稿";
  output.classList.toggle("is-loading", busy);
}

function setMode(text) {
  if (!text) {
    modeEl.hidden = true;
    modeEl.textContent = "";
    return;
  }
  modeEl.hidden = false;
  modeEl.textContent = text;
}

function showToast(message, type = "ok", ms = 3500) {
  if (!toastEl) return;
  toastEl.hidden = false;
  toastEl.className = `toast ${type}`;
  toastEl.textContent = message;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, ms);
}

function setMergeStatus(message, type = "ok") {
  if (!mergeStatus) return;
  if (!message) {
    mergeStatus.hidden = true;
    mergeStatus.textContent = "";
    return;
  }
  mergeStatus.hidden = false;
  mergeStatus.className = `merge-status ${type}`;
  mergeStatus.textContent = message;
}

function renderMarkdown(md) {
  if (typeof marked === "undefined") {
    return `<pre>${escapeHtml(md)}</pre>`;
  }
  marked.setOptions({ gfm: true, breaks: true });
  return marked.parse(md || "");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setView(view) {
  currentView = view;
  const hasContent = Boolean(currentMarkdown) && !output.classList.contains("is-empty");
  viewTabs.hidden = !hasContent;
  if (!hasContent) {
    previewEl.hidden = true;
    output.hidden = false;
    return;
  }
  previewEl.hidden = view !== "preview";
  output.hidden = view !== "source";
  viewTabs.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.view === view);
  });
}

function setDownloadEnabled(enabled) {
  copyBtn.disabled = !enabled;
  downloadMdBtn.disabled = !enabled;
  downloadHtmlBtn.disabled = !enabled;
  downloadPdfBtn.disabled = !enabled;
}

function setOutput(text, { empty = false } = {}) {
  currentMarkdown = empty ? "" : text || "";
  output.textContent = text;
  output.classList.toggle("is-empty", empty);
  if (!empty && currentMarkdown) {
    previewEl.innerHTML = renderMarkdown(currentMarkdown);
    setView("preview");
    setDownloadEnabled(true);
  } else {
    previewEl.innerHTML = "";
    previewEl.hidden = true;
    output.hidden = false;
    viewTabs.hidden = true;
    setDownloadEnabled(false);
  }
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildPreviewHtml(md, title) {
  const body = renderMarkdown(md);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif; max-width: 860px; margin: 32px auto; padding: 0 20px 48px; color: #15201b; line-height: 1.65; }
  h1,h2,h3 { line-height: 1.3; }
  h2 { border-bottom: 1px solid #cfdad3; padding-bottom: 0.25em; }
  blockquote { border-left: 3px solid #0f5c45; background: #e3f0ea; margin: 1em 0; padding: 0.6em 1em; color: #5a6a62; }
  table { border-collapse: collapse; width: 100%; font-size: 0.92rem; margin: 1em 0; }
  th, td { border: 1px solid #cfdad3; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f3f6f4; }
  code { background: #eef3f0; padding: 0.1em 0.35em; border-radius: 4px; }
  pre { background: #121916; color: #e8efe9; padding: 12px; border-radius: 8px; overflow: auto; }
  pre code { background: transparent; color: inherit; padding: 0; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function safeFilename(base) {
  return String(base || "se-desk-draft")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .slice(0, 60);
}

function buildPdfElement(md, title) {
  const wrap = document.createElement("div");
  wrap.className = "pdf-export-root";
  wrap.innerHTML = `
    <h1 class="pdf-title">${escapeHtml(title)}</h1>
    <div class="pdf-body">${renderMarkdown(md)}</div>
  `;
  Object.assign(wrap.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "794px",
    padding: "28px 36px 40px",
    background: "#ffffff",
    color: "#15201b",
    fontFamily: '"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif',
    fontSize: "14px",
    lineHeight: "1.65",
    boxSizing: "border-box",
    opacity: "0",
    pointerEvents: "none",
    zIndex: "-1",
  });
  document.body.appendChild(wrap);
  return wrap;
}

async function downloadPdf(md, title, filename) {
  if (typeof html2pdf === "undefined") {
    throw new Error("PDF 库未加载，请刷新页面后重试");
  }
  const el = buildPdfElement(md, title);
  try {
    await html2pdf()
      .set({
        margin: [10, 10, 12, 10],
        filename,
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(el)
      .save();
  } finally {
    el.remove();
  }
}

function renderCustomerPanel(customer) {
  currentCustomer = customer;
  if (!customer) {
    customerMeta.hidden = true;
    customerDetails.hidden = true;
    mergeBox.hidden = true;
    highlightDirectory(null);
    updateStats();
    return;
  }
  customerMeta.hidden = false;
  const stage = customer.stage || "lead";
  const contact = customer.contact ? ` · ${customer.contact}` : "";
  customerMeta.textContent = `${customer.name}${contact} · ${stageLabel(stage)} · 已拜访 ${customer.visit_count || 0} 次 · 下次 #${(customer.visit_count || 0) + 1}`;
  customerDetails.hidden = false;
  if (profileContact) profileContact.value = customer.contact || "";
  if (profileStage) profileStage.value = stage;
  if (profileNote) profileNote.value = customer.owner_note || "";
  profileFacts.value = listToLines(customer.confirmed_facts);
  profileGaps.value = listToLines(customer.open_gaps);
  const visits = customer.visits || [];
  if (!visits.length) {
    visitList.innerHTML = `<div class="visit-item">尚无拜访记录</div>`;
  } else {
    visitList.innerHTML = visits
      .slice()
      .reverse()
      .map(
        (v) => `<div class="visit-item">#${v.visit_no} · ${v.meeting_goal} · ${sceneLabel(v.scene)} · ${formatTime(v.created_at)}<br />${v.notes_excerpt || ""}</div>`
      )
      .join("");
  }
  mergeBox.hidden = false;
  highlightDirectory(customer.id);
  updateStats();
}

function highlightDirectory(id) {
  if (!directoryList) return;
  directoryList.querySelectorAll(".directory-item").forEach((el) => {
    el.classList.toggle("is-active", Boolean(id) && el.dataset.id === id);
  });
}

function renderDirectoryList(items) {
  directoryCache = items || [];
  const q = directoryQuery.trim().toLowerCase();
  const filtered = !q
    ? directoryCache
    : directoryCache.filter((item) => {
        const blob = [item.name, item.one_liner, item.contact, item.owner_note, item.stage]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
  if (directoryCount) {
    directoryCount.textContent = q
      ? `显示 ${filtered.length} / 共 ${directoryCache.length} 家`
      : `共 ${directoryCache.length} 家客户`;
  }
  updateStats();
  if (!filtered.length) {
    directoryList.innerHTML = `<li class="empty">${directoryCache.length ? "无匹配客户" : "名录为空<br />在工作台或本页「新建客户」加入"}</li>`;
    return;
  }
  directoryList.innerHTML = "";
  for (const item of filtered) {
    const li = document.createElement("li");
    li.className = "directory-item" + (currentCustomer && currentCustomer.id === item.id ? " is-active" : "");
    li.dataset.id = item.id;
    const note = item.owner_note
      ? `<div class="dir-note">${escapeHtml(item.owner_note).slice(0, 120)}</div>`
      : "";
    const contact = item.contact ? `联系人 ${escapeHtml(item.contact)} · ` : "";
    li.innerHTML = `
      <div class="dir-top">
        <div class="dir-name">${escapeHtml(item.name)}</div>
        <div class="dir-actions">
          <button type="button" class="dir-use" data-id="${escapeAttr(item.id)}" title="用于本场备战">选用</button>
          <button type="button" class="danger dir-del" data-id="${escapeAttr(item.id)}" title="从名录删除">删</button>
        </div>
      </div>
      <div class="dir-meta">
        <span class="stage-tag ${escapeAttr(item.stage || "lead")}">${stageLabel(item.stage)}</span>
        <span class="tag">${sceneLabel(item.scene_default)}</span>
        <span class="tag">${item.visit_count || 0} 访</span>
        <span class="tag">事实 ${item.fact_count || 0}</span>
        <span class="tag">缺口 ${item.gap_count || 0}</span>
      </div>
      <div class="dir-line">${contact}${escapeHtml(item.one_liner || "暂无一句话")} · ${formatTime(item.updated_at)}</div>
      ${note}`;
    li.addEventListener("click", (ev) => {
      if (ev.target.closest(".dir-actions")) return;
      selectCustomerForPrep(item.id);
    });
    li.querySelector(".dir-use").addEventListener("click", (ev) => {
      ev.stopPropagation();
      selectCustomerForPrep(item.id);
    });
    li.querySelector(".dir-del").addEventListener("click", (ev) => {
      ev.stopPropagation();
      deleteCustomerFromDirectory(item.id, item.name);
    });
    directoryList.appendChild(li);
  }
}

async function selectCustomerForPrep(id) {
  errorEl.hidden = true;
  try {
    customerSelect.value = id;
    await loadCustomer(id);
    if (currentCustomer) {
      if (currentCustomer.one_liner) {
        form.elements.namedItem("customer_one_liner").value = currentCustomer.one_liner;
      }
      if (currentCustomer.scene_default) {
        form.elements.namedItem("scene").value = currentCustomer.scene_default;
      }
      if (currentCustomer.competitors) {
        form.elements.namedItem("competitors").value = currentCustomer.competitors;
      }
      if (currentCustomer.our_product_brief) {
        form.elements.namedItem("our_product_brief").value = currentCustomer.our_product_brief;
      }
      showToast(`已选用：${currentCustomer.name}`, "ok", 2200);
      setMode(`名录 · ${currentCustomer.name}`);
      setAppView("workbench");
    }
  } catch (err) {
    showToast(String(err.message || err), "err");
  }
}

async function deleteCustomerFromDirectory(id, name) {
  if (!window.confirm(`确定从名录删除「${name}」？\n本地档案将删除，生成历史仍保留。`)) return;
  try {
    const res = await fetch(`/api/customers/${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || res.statusText);
    if (currentCustomer && currentCustomer.id === id) {
      customerSelect.value = "";
      renderCustomerPanel(null);
    }
    await refreshCustomers();
    showToast(`已从名录删除：${name}`, "ok");
  } catch (err) {
    showToast(`删除失败：${err.message || err}`, "err");
  }
}

function updateStats() {
  if (statCustomers) {
    statCustomers.textContent = String(directoryCache.length);
  }
  if (statActive) {
    statActive.textContent = currentCustomer ? currentCustomer.name : "未关联";
  }
  if (statHistory) {
    statHistory.textContent = String(historyCount);
  }
  if (statScene && sceneSelect) {
    statScene.textContent = sceneLabel(sceneSelect.value);
  }
}

function setAppView(view) {
  activeAppView = view || "workbench";
  document.querySelectorAll(".sidebar-nav .nav-item").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.view === activeAppView);
  });
  if (viewWorkbench) viewWorkbench.hidden = activeAppView !== "workbench";
  if (viewDirectory) viewDirectory.hidden = activeAppView !== "directory";
  if (viewHistory) viewHistory.hidden = activeAppView !== "history";
  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = VIEW_LABELS[activeAppView] || VIEW_LABELS.workbench;
  }
}

function setSideTab(side) {
  if (side === "directory") setAppView("directory");
  else if (side === "history") setAppView("history");
  else setAppView("workbench");
}

async function refreshCustomers(selectId) {
  const res = await fetch("/api/customers?limit=100");
  const data = await res.json();
  const items = data.items || [];
  const current = selectId || customerSelect.value;
  customerSelect.innerHTML = `<option value="">不关联档案（单次拜访）</option>`;
  for (const item of items) {
    const opt = document.createElement("option");
    opt.value = item.id;
    const stage = stageLabel(item.stage);
    opt.textContent = `${item.name}（${stage} · ${item.visit_count || 0} 访）`;
    customerSelect.appendChild(opt);
  }
  if (current) customerSelect.value = current;
  renderDirectoryList(items);
}

async function loadCustomer(id) {
  if (!id) {
    renderCustomerPanel(null);
    return;
  }
  const res = await fetch(`/api/customers/${encodeURIComponent(id)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || res.statusText);
  renderCustomerPanel(data);
  if (data.one_liner) form.elements.namedItem("customer_one_liner").value = data.one_liner;
  if (data.scene_default) form.elements.namedItem("scene").value = data.scene_default;
  if (data.competitors && !form.elements.namedItem("competitors").value) {
    form.elements.namedItem("competitors").value = data.competitors;
  }
  if (data.our_product_brief && !form.elements.namedItem("our_product_brief").value) {
    form.elements.namedItem("our_product_brief").value = data.our_product_brief;
  }
}

async function refreshHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    const textEl = healthEl.querySelector(".health-text");
    if (data.has_api_key) {
      healthEl.dataset.state = "ok";
      textEl.textContent = `${data.model} · 已就绪`;
    } else {
      healthEl.dataset.state = "warn";
      textEl.textContent = `${data.model} · 未配置密钥（可用演示）`;
    }
    if (data.dry_run_default) {
      document.getElementById("dry_run").checked = true;
    }
  } catch {
    healthEl.dataset.state = "error";
    healthEl.querySelector(".health-text").textContent = "服务未连通";
  }
}

async function refreshHistory() {
  historyList.innerHTML = `<li class="empty">加载中…</li>`;
  try {
    const res = await fetch("/api/history?limit=30");
    const data = await res.json();
    const items = data.items || [];
    historyCount = items.length;
    updateStats();
    if (!items.length) {
      historyList.innerHTML = `<li class="empty">暂无记录<br />生成后会自动出现在这里</li>`;
      return;
    }
    historyList.innerHTML = "";
    for (const item of items) {
      const li = document.createElement("li");
      li.className = "history-item" + (item.id === activeHistoryId ? " is-active" : "");
      li.dataset.id = item.id;
      const modeClass = item.mode === "live" ? "live" : "dry_run";
      li.innerHTML = `
        <div class="meta">
          <span class="tag">${sceneLabel(item.scene)}</span>
          <span class="tag ${modeClass}">${item.mode || "—"}</span>
          <span>${formatTime(item.created_at)}</span>
        </div>
        <div class="title">${item.customer_one_liner || item.id}</div>`;
      li.addEventListener("click", () => loadHistory(item.id));
      historyList.appendChild(li);
    }
  } catch {
    historyCount = 0;
    updateStats();
    historyList.innerHTML = `<li class="empty">历史加载失败</li>`;
  }
}

async function loadHistory(id) {
  errorEl.hidden = true;
  try {
    const res = await fetch(`/api/history/${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || res.statusText);
    activeHistoryId = id;
    setOutput(data.markdown || "", { empty: !data.markdown });
    setMode(`历史 · ${data.mode || ""}`);
    if (data.scene) form.elements.namedItem("scene").value = data.scene;
    if (data.customer_one_liner) {
      form.elements.namedItem("customer_one_liner").value = data.customer_one_liner;
    }
    if (data.meeting_goal) form.elements.namedItem("meeting_goal").value = data.meeting_goal;
    if (data.customer_id) {
      customerSelect.value = data.customer_id;
      await loadCustomer(data.customer_id);
    }
    refreshHistory();
    setAppView("workbench");
    output.scrollTop = 0;
    previewEl.scrollTop = 0;
  } catch (err) {
    errorEl.hidden = false;
    errorEl.textContent = String(err.message || err);
  }
}

document.getElementById("load-sample-a").addEventListener("click", () => {
  fillSample(SAMPLE_A);
  document.getElementById("dry_run").checked = true;
});

document.getElementById("load-sample-b").addEventListener("click", () => {
  fillSample(SAMPLE_B);
  document.getElementById("dry_run").checked = false;
});

document.getElementById("refresh-history").addEventListener("click", refreshHistory);
document.getElementById("btn-refresh-customers").addEventListener("click", () => refreshCustomers());
document.getElementById("refresh-directory").addEventListener("click", () => refreshCustomers());

document.querySelectorAll(".sidebar-nav .nav-item").forEach((btn) => {
  btn.addEventListener("click", () => setAppView(btn.dataset.view));
});

const btnNewCustomerDir = document.getElementById("btn-new-customer-dir");
if (btnNewCustomerDir) {
  btnNewCustomerDir.addEventListener("click", () => {
    setAppView("workbench");
    document.getElementById("btn-new-customer").click();
  });
}

if (sceneSelect) {
  sceneSelect.addEventListener("change", updateStats);
}

directorySearch.addEventListener("input", () => {
  directoryQuery = directorySearch.value || "";
  renderDirectoryList(directoryCache);
});

customerSelect.addEventListener("change", async () => {
  errorEl.hidden = true;
  try {
    await loadCustomer(customerSelect.value);
  } catch (err) {
    errorEl.hidden = false;
    errorEl.textContent = String(err.message || err);
  }
});

document.getElementById("btn-new-customer").addEventListener("click", () => {
  const box = document.getElementById("new-customer-form");
  box.hidden = false;
  const nameInput = document.getElementById("new_customer_name");
  document.getElementById("new_customer_name").value = "";
  document.getElementById("new_customer_one_liner").value =
    form.elements.namedItem("customer_one_liner").value || "";
  document.getElementById("new_customer_contact").value = "";
  document.getElementById("new_customer_stage").value = "lead";
  document.getElementById("new_customer_note").value = "";
  nameInput.focus();
  setAppView("directory");
});

document.getElementById("btn-cancel-create").addEventListener("click", () => {
  document.getElementById("new-customer-form").hidden = true;
});

document.getElementById("btn-create-customer").addEventListener("click", async () => {
  const createErr = document.getElementById("create-customer-error");
  createErr.hidden = true;
  errorEl.hidden = true;
  const name = document.getElementById("new_customer_name").value.trim();
  const oneLiner = document.getElementById("new_customer_one_liner").value.trim();
  const contact = document.getElementById("new_customer_contact").value.trim();
  const stage = document.getElementById("new_customer_stage").value;
  const ownerNote = document.getElementById("new_customer_note").value.trim();
  if (!name) {
    createErr.hidden = false;
    createErr.textContent = "请填写客户名称";
    return;
  }
  try {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        one_liner: oneLiner,
        contact,
        stage,
        owner_note: ownerNote,
        scene_default: form.elements.namedItem("scene").value,
        competitors: form.elements.namedItem("competitors").value || "",
        our_product_brief: form.elements.namedItem("our_product_brief").value || "",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || res.statusText);
    document.getElementById("new-customer-form").hidden = true;
    await refreshCustomers(data.id);
    customerSelect.value = data.id;
    await loadCustomer(data.id);
    if (oneLiner) form.elements.namedItem("customer_one_liner").value = oneLiner;
    setMode("已加入名录");
    showToast(`已加入名录：${data.name}`, "ok");
    setSideTab("directory");
  } catch (err) {
    createErr.hidden = false;
    createErr.textContent = String(err.message || err);
  }
});

document.getElementById("btn-save-profile").addEventListener("click", async () => {
  if (!currentCustomer) return;
  errorEl.hidden = true;
  try {
    const res = await fetch(`/api/customers/${encodeURIComponent(currentCustomer.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirmed_facts: linesToList(profileFacts.value),
        open_gaps: linesToList(profileGaps.value),
        contact: profileContact ? profileContact.value.trim() : "",
        stage: profileStage ? profileStage.value : "lead",
        owner_note: profileNote ? profileNote.value.trim() : "",
        one_liner: form.elements.namedItem("customer_one_liner").value,
        scene_default: form.elements.namedItem("scene").value,
        competitors: form.elements.namedItem("competitors").value,
        our_product_brief: form.elements.namedItem("our_product_brief").value,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || res.statusText);
    renderCustomerPanel(data);
    await refreshCustomers(data.id);
    setMode("档案已保存");
    showToast("名录档案已保存", "ok");
  } catch (err) {
    errorEl.hidden = false;
    errorEl.textContent = String(err.message || err);
  }
});

document.getElementById("btn-merge").addEventListener("click", async () => {
  if (!currentCustomer) {
    setMergeStatus("请先选择或新建客户档案", "err");
    showToast("请先选择或新建客户档案", "err");
    return;
  }
  errorEl.hidden = true;
  const addFacts = linesToList(document.getElementById("merge_facts").value);
  const addGaps = linesToList(document.getElementById("merge_gaps").value);
  const removeGaps = linesToList(document.getElementById("merge_remove_gaps").value);
  if (!addFacts.length && !addGaps.length && !removeGaps.length) {
    setMergeStatus("没有可合并内容：请至少填写事实、缺口或关闭缺口中的一项", "err");
    showToast("没有可合并内容", "err");
    return;
  }

  const btn = document.getElementById("btn-merge");
  const label = btn.querySelector(".merge-label");
  btn.disabled = true;
  label.textContent = "合并中…";
  try {
    const res = await fetch(`/api/customers/${encodeURIComponent(currentCustomer.id)}/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        add_facts: addFacts,
        add_gaps: addGaps,
        remove_gaps: removeGaps,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || res.statusText);
    renderCustomerPanel(data);
    document.getElementById("merge_facts").value = "";
    document.getElementById("merge_gaps").value = "";
    document.getElementById("merge_remove_gaps").value = "";
    const msg = `合并成功：+事实 ${addFacts.length} · +缺口 ${addGaps.length} · 关闭缺口 ${removeGaps.length}。当前共 ${data.confirmed_facts.length} 条事实、${data.open_gaps.length} 条缺口。`;
    setMergeStatus(msg, "ok");
    showToast(msg, "ok", 5000);
    setMode("已合并进档案");
    customerDetails.open = true;
    profileFacts.classList.add("flash");
    profileGaps.classList.add("flash");
    setTimeout(() => {
      profileFacts.classList.remove("flash");
      profileGaps.classList.remove("flash");
    }, 1300);
    await refreshCustomers(currentCustomer.id);
  } catch (err) {
    const msg = String(err.message || err);
    setMergeStatus(`合并失败：${msg}`, "err");
    showToast(`合并失败：${msg}`, "err", 5000);
    errorEl.hidden = false;
    errorEl.textContent = msg;
  } finally {
    btn.disabled = false;
    label.textContent = "合并进档案";
  }
});

viewTabs.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setView(tab.dataset.view));
});

copyBtn.addEventListener("click", async () => {
  const text = currentMarkdown || output.textContent || "";
  await navigator.clipboard.writeText(text);
  const prev = copyBtn.textContent;
  copyBtn.textContent = "已复制";
  showToast("已复制 Markdown 到剪贴板", "ok", 2000);
  setTimeout(() => {
    copyBtn.textContent = prev;
  }, 1200);
});

downloadMdBtn.addEventListener("click", () => {
  if (!currentMarkdown) return;
  const name = safeFilename(form.elements.namedItem("customer_one_liner").value || currentCustomer?.name || "se-desk-draft");
  downloadBlob(`${name}.md`, currentMarkdown, "text/markdown;charset=utf-8");
  showToast("已开始下载 Markdown 源文件", "ok", 2500);
});

downloadHtmlBtn.addEventListener("click", () => {
  if (!currentMarkdown) return;
  const title = form.elements.namedItem("customer_one_liner").value || currentCustomer?.name || "销售工程师备战草稿";
  const name = safeFilename(title);
  const html = buildPreviewHtml(currentMarkdown, title);
  downloadBlob(`${name}-预览.html`, html, "text/html;charset=utf-8");
  showToast("已开始下载预览 HTML（可用浏览器打开查看排版）", "ok", 3500);
});

downloadPdfBtn.addEventListener("click", async () => {
  if (!currentMarkdown) return;
  const title = form.elements.namedItem("customer_one_liner").value || currentCustomer?.name || "销售工程师备战草稿";
  const name = safeFilename(title);
  const prev = downloadPdfBtn.textContent;
  downloadPdfBtn.disabled = true;
  downloadPdfBtn.textContent = "生成 PDF…";
  try {
    await downloadPdf(currentMarkdown, title, `${name}.pdf`);
    showToast("已开始下载 PDF（预览排版）", "ok", 3500);
  } catch (err) {
    showToast(`PDF 下载失败：${err.message || err}`, "err", 5000);
  } finally {
    downloadPdfBtn.disabled = false;
    downloadPdfBtn.textContent = prev;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.hidden = true;
  setMode("");
  setBusy(true);
  setOutput("正在生成 SE 草稿，通常需要约 1～2 分钟…", { empty: true });

  const fd = new FormData(form);
  const body = {
    scene: fd.get("scene"),
    meeting_goal: fd.get("meeting_goal"),
    customer_one_liner: fd.get("customer_one_liner"),
    known_context: fd.get("known_context") || "",
    competitors: fd.get("competitors") || "",
    our_product_brief: fd.get("our_product_brief") || "",
    notes: fd.get("notes"),
    dry_run: document.getElementById("dry_run").checked,
    save_history: document.getElementById("save_history").checked,
    customer_id: customerSelect.value || null,
    record_visit: document.getElementById("record_visit").checked,
  };

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || res.statusText);
    }
    setOutput(data.markdown, { empty: false });
    activeHistoryId = data.history_id || null;
    const hist = data.history_id ? " · 已归档" : "";
    const visit = data.visit_no ? ` · 拜访#${data.visit_no}` : "";
    setMode((data.mode === "dry_run" ? "演示样例" : "live") + hist + visit);
    showToast("生成完成，可切换预览 / 下载", "ok");
    output.scrollTop = 0;
    previewEl.scrollTop = 0;
    refreshHistory();
    if (data.customer_id) {
      await refreshCustomers(data.customer_id);
      customerSelect.value = data.customer_id;
      await loadCustomer(data.customer_id);
    }
  } catch (err) {
    setOutput("生成失败。", { empty: true });
    errorEl.hidden = false;
    errorEl.textContent = String(err.message || err);
    showToast(`生成失败：${err.message || err}`, "err");
  } finally {
    setBusy(false);
  }
});

setAppView("workbench");
refreshHealth();
refreshHistory();
refreshCustomers().catch(() => {});
