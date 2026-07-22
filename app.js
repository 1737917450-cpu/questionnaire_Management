const CONFIG = window.QUESTIONNAIRE_CONFIG || {};
const STORAGE_KEY = "ai_fund_questionnaire_progress_v1";

const groups = [
  {
    id: "group_1",
    title: "第一组",
    prompt: "请阅读本组三份匿名研究方案，并分别完成评分与组内排名。",
    proposals: [
      { id: "A1-1", file: "proposal_database/group_1/A1-1.pdf" },
      { id: "A1-2", file: "proposal_database/group_1/A1-2.pdf" },
      { id: "A1-3", file: "proposal_database/group_1/A1-3.pdf" }
    ]
  },
  {
    id: "group_2",
    title: "第二组",
    prompt: "请阅读本组三份匿名研究方案，并分别完成评分与组内排名。",
    proposals: [
      { id: "A2-1", file: "proposal_database/group_2/A2-1.pdf" },
      { id: "A2-2", file: "proposal_database/group_2/A2-2.pdf" },
      { id: "A2-3", file: "proposal_database/group_2/A2-3.pdf" }
    ]
  },
  {
    id: "group_3",
    title: "第三组",
    prompt: "请阅读本组三份匿名研究方案，并分别完成评分与组内排名。",
    proposals: [
      { id: "A3-1", file: "proposal_database/group_3/A3-1.pdf" },
      { id: "A3-2", file: "proposal_database/group_3/A3-2.pdf" },
      { id: "A3-3", file: "proposal_database/group_3/A3-3.pdf" }
    ]
  },
  {
    id: "group_4",
    title: "第四组",
    prompt: "请阅读本组三份匿名研究方案，并分别完成评分与组内排名。",
    proposals: [
      { id: "A4-1", file: "proposal_database/group_4/A4-1.pdf" },
      { id: "A4-2", file: "proposal_database/group_4/A4-2.pdf" },
      { id: "A4-3", file: "proposal_database/group_4/A4-3.pdf" }
    ]
  }
];

const dimensions = [
  { key: "novelty", label: "新颖性", description: "是否提出原创性假设或独特视角，而非对现有文献的平庸总结。" },
  { key: "appeal", label: "吸引力", description: "作为基金评审人，这个创意是否能够引起浓厚兴趣。" },
  { key: "feasibility", label: "可行性", description: "技术路线和验证计划是否科学合理，并具备现实可操作性。" },
  { key: "effectiveness", label: "有效性", description: "方法是否直击问题核心，并能产生实质性科学结论。" },
  { key: "interdisciplinarity", label: "学科融合性", description: "是否有效融合不同学科知识、理论或方法，产生协同价值。" }
];

const fundingRecommendationItems = [
  {
    key: "fundingRecommendation",
    label: "资助建议",
    description: "您是否建议资助这份提案。",
    type: "funding"
  }
];

const evaluationItems = [
  { key: "criteriaClarity", label: "Q1", text: "评价标准是明确的。" },
  { key: "dimensionSimilarity", label: "Q2", text: "评分维度和我平时评审基金的维度差不多。" },
  { key: "experimentReasonableness", label: "Q3", text: "实验设置的问题是合理的。" },
  { key: "workloadReasonableness", label: "Q4", text: "工作量是合理的。" },
  { key: "proposalCountFit", label: "Q5", text: "需要评估的基金proposal的数量是合适的。" },
  { key: "reviewSimilarity", label: "Q6", text: "这次评估与我参与过的基金评审经历很相似。" },
  { key: "realReviewReflection", label: "Q7", text: "这次评估能很好的反映出真实基金评审过程。" }
];

const evaluationGroups = [
  { title: "A. 问卷理解", items: evaluationItems.slice(0, 3) },
  { title: "B. 工作量", items: evaluationItems.slice(3, 5) },
  { title: "C. 真实感", items: evaluationItems.slice(5, 7) }
];

const app = document.querySelector("#app");

let state = loadState();

function createInitialState() {
  return {
    participantId: window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    startedAt: new Date().toISOString(),
    currentGroupIndex: 0,
    basicInfo: {},
    responses: {},
    finalEvaluation: {},
    completed: false,
    submittedAt: null,
    remoteSubmissionAttempted: false
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : createInitialState();
  } catch {
    return createInitialState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  if (state.completed) {
    renderThanks();
    return;
  }
  if (!state.basicInfo || !state.basicInfo.name || !state.basicInfo.title) {
    renderIntro();
    return;
  }
  if (state.currentGroupIndex >= groups.length) {
    renderFinalEvaluation();
    return;
  }
  renderGroup(groups[state.currentGroupIndex]);
}

function renderIntro() {
  app.innerHTML = `
    <main class="intro-page">
      <section class="intro-hero">
        <p class="eyebrow">专家评估问卷</p>
        <h1>关于“AI辅助科学基金申请”系统的专家评估调研</h1>
        <div class="intro-copy">
          <p>尊敬的老师：您好！我们正在进行一项关于大模型多智能体系统辅助科学基金申请的研究，旨在探索人工智能是否能够基于前沿科学话题，自主生成具有高度创新性的前沿科学研究方案。我们诚挚邀请参与本次调研！</p>
          <p>我们选取了国家自然科学基金（NSFC）指南中的前沿科学问题作为输入，利用不同的AI系统架构（包括单体大模型和多智能体系统）生成了若干份基金申请研究方案。</p>
          <p>您将收到 4 组针对不同选题的研究方案。每组包含 3 份由不同AI系统生成的匿名方案，PDF 文件中的“系统输入”为科学话题，“系统输出”为根据该话题生成的方案。我们希望通过您的专业视角，客观评估这些方案的科学价值。</p>
          <p>为保障浏览体验，请您使用电脑端浏览器打开。再次感谢您的时间！</p>
        </div>
      </section>

      <form id="basic-form" class="intro-form" novalidate>
        <div class="section-heading">
          <p class="eyebrow">第一部分</p>
          <h2>基本信息</h2>
        </div>
        <div class="field-grid">
          ${basicField("name", "姓名", "请输入您的姓名")}
          ${basicField("title", "职称", "例如：教授 / 副教授 / 研究员")}
          ${basicField("researchDirection", "研究方向", "请输入您的主要研究方向")}
          ${basicField("yearsSincePhd", "取得博士学位至今时间（年）", "例如：8", "number", "0")}
          ${basicField("nsfcCount", "主持国家自然科学基金项目数量", "例如：2", "number", "0")}
          <label class="field">
            <span>是否有国家自然科学基金项目评审经验</span>
            <select name="hasNsfcReviewExperience" required>
              <option value="">请选择</option>
              <option value="是">是</option>
              <option value="否">否</option>
            </select>
          </label>
          ${basicField("completionTimeHours", "完成评估所需时间（小时）", "请输入预计完成评估所需时间", "number", "0", "0.1")}
        </div>
        <div class="consent-box">
          <strong>评分说明</strong>
          <p>第二部分采用 1-7 分制，1 分为非常不同意，7 分为极为同意。每组还需为三份方案给出不重复的组内排名，1 为最高，3 为最低。</p>
        </div>
        <p id="basic-message" class="form-message" role="status"></p>
        <button class="primary-action" type="submit">进入第二部分</button>
      </form>
    </main>
  `;

  document.querySelector("#basic-form").addEventListener("submit", event => {
    event.preventDefault();
    if (!validateFormCompletion(event.currentTarget, "请完整填写基本信息后再进入第二部分。", "basic-message")) return;
    const formData = new FormData(event.currentTarget);
    state.basicInfo = Object.fromEntries(formData.entries());
    state.startedAt = state.startedAt || new Date().toISOString();
    saveState();
    render();
  });
  restoreBasicInfoValues();
}

function basicField(name, label, placeholder, type = "text", min = "", step = "", required = true) {
  const minAttr = min !== "" ? ` min="${min}"` : "";
  const stepAttr = step !== "" ? ` step="${step}"` : "";
  const requiredAttr = required ? " required" : "";
  return `
    <label class="field">
      <span>${label}</span>
      <input name="${name}" type="${type}" placeholder="${placeholder}"${minAttr}${stepAttr}${requiredAttr}>
    </label>
  `;
}

function restoreBasicInfoValues() {
  if (!state.basicInfo) return;
  Object.entries(state.basicInfo).forEach(([key, value]) => {
    const input = document.querySelector(`[name="${key}"]`);
    if (input) input.value = value;
  });
}

function renderGroup(group) {
  const progressPercent = Math.round(((state.currentGroupIndex + 1) / groups.length) * 100);
  app.innerHTML = `
    <main class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">第二部分 · 阅读与评分</p>
          <h1>${group.title}</h1>
        </div>
        <div class="progress-block" aria-label="问卷进度">
          <span>${state.currentGroupIndex + 1} / ${groups.length}</span>
          <div class="progress-track"><div style="width:${progressPercent}%"></div></div>
        </div>
      </header>

      <section class="reader-grid" aria-label="${group.title}方案阅读区">
        ${group.proposals.map(proposal => `
          <article class="pdf-panel">
            <header>
              <span>${proposal.id}</span>
              <a href="${proposal.file}" target="_blank" rel="noopener">新窗口打开</a>
            </header>
            <div class="mobile-pdf-fallback">
              <strong>${proposal.id}</strong>
              <p>手机浏览器可能无法直接嵌入显示 PDF。请点击下方按钮在新窗口打开，阅读后返回本页评分。</p>
              <a class="pdf-open-button" href="${proposal.file}" target="_blank" rel="noopener">打开 PDF</a>
            </div>
            <iframe title="${proposal.id} PDF" src="${proposal.file}#view=FitH"></iframe>
          </article>
        `).join("")}
      </section>

      <form id="rating-form" class="rating-dock" novalidate>
        <div class="dock-header">
          <div>
            <p class="eyebrow">${group.prompt}</p>
            <h2>评分表</h2>
          </div>
          <div class="header-actions">
            <button class="secondary-action" type="button" id="back-step">返回上一页</button>
            <button class="secondary-action" type="button" id="save-progress">保存进度</button>
          </div>
        </div>

        <div class="scale-banner">
          <strong>统一评分标准</strong>
          <span>1 分为非常不同意，7 分为极为同意；组内排名填写 1、2、3，且三份方案的排名不能重复。</span>
        </div>

        <section class="rating-layout" aria-label="评分表">
          <section class="score-section">
            <div class="score-section-title">
              <h3>核心创新维度与组内排名</h3>
              <p>每一列上方为该指标定义，下方对应三份方案的评分框。</p>
            </div>
            ${scoreMatrix(group, [
              ...dimensions,
              { key: "rank", label: "组内排名", description: "请在本组三份方案中给出 1、2、3 名，1 为最高，3 为最低。", type: "rank" }
            ], "core-matrix")}
          </section>

          <section class="score-section">
            <div class="score-section-title">
              <h3>补充问题一：资助建议</h3>
              <p>请对每份提案给出是否建议资助的判断。</p>
            </div>
            ${scoreMatrix(group, fundingRecommendationItems, "recommendation-matrix")}
          </section>
        </section>

        <div class="dock-actions">
          <p id="form-message" role="status"></p>
          <button class="primary-action" type="submit">${state.currentGroupIndex === groups.length - 1 ? "提交本组并回答最终补充问题" : "提交本组并进入下一组"}</button>
        </div>
      </form>
    </main>
  `;

  document.querySelector("#rating-form").addEventListener("submit", handleGroupSubmit);
  document.querySelector("#back-step").addEventListener("click", () => {
    persistCurrentGroup(group);
    goBackFromGroup();
  });
  document.querySelector("#save-progress").addEventListener("click", () => {
    persistCurrentGroup(group);
    setMessage("当前评分已保存在本机浏览器中。");
  });
  restoreGroupValues(group);
}

function scoreMatrix(group, items, className) {
  return `
    <div class="score-matrix ${className}" style="--score-columns: ${items.length}">
      <div class="matrix-corner">编号</div>
      ${items.map(item => `
        <div class="matrix-head">
          <strong>${item.label}</strong>
          <span>${item.description || item.text}</span>
        </div>
      `).join("")}
      ${group.proposals.map(proposal => `
        <div class="matrix-proposal">${proposal.id}</div>
        ${items.map(item => `
          <div class="matrix-cell">
            <span class="cell-label">${item.label}</span>
            ${item.type === "rank"
              ? rankSelect(`${group.id}.${proposal.id}.${item.key}`)
              : item.type === "funding"
                ? fundingRecommendationSelect(`${group.id}.${proposal.id}.${item.key}`)
              : scoreSelect(`${group.id}.${proposal.id}.${item.key}`)}
          </div>
        `).join("")}
      `).join("")}
    </div>
  `;
}

function finalEvaluationMatrix(items) {
  return `
    <div class="score-matrix evaluation-matrix" style="--score-columns: ${items.length}">
      <div class="matrix-corner">评价对象</div>
      ${items.map(item => `
        <div class="matrix-head">
          <strong>${item.label}</strong>
          <span>${item.text}</span>
        </div>
      `).join("")}
      <div class="matrix-proposal">全部评估</div>
      ${items.map(item => `
        <div class="matrix-cell">
          <span class="cell-label">${item.label}</span>
          ${scoreSelect(`finalEvaluation.${item.key}`)}
        </div>
      `).join("")}
    </div>
  `;
}

function scoreSelect(name) {
  return `
    <select name="${name}" required aria-label="${name}">
      <option value=""></option>
      ${[1, 2, 3, 4, 5, 6, 7].map(value => `<option value="${value}">${value}</option>`).join("")}
    </select>
  `;
}

function rankSelect(name) {
  return `
    <select name="${name}" required aria-label="${name}">
      <option value=""></option>
      ${[1, 2, 3].map(value => `<option value="${value}">${value}</option>`).join("")}
    </select>
  `;
}

function fundingRecommendationSelect(name) {
  return `
    <select name="${name}" required aria-label="${name}">
      <option value=""></option>
      <option value="A 建议">A 建议</option>
      <option value="B 一般（Borderline）">B 一般（Borderline）</option>
      <option value="C 不建议">C 不建议</option>
    </select>
  `;
}

function renderFinalEvaluation() {
  app.innerHTML = `
    <main class="final-evaluation-page">
      <form id="final-evaluation-form" class="rating-dock final-evaluation-form" novalidate>
        <div class="dock-header">
          <div>
            <p class="eyebrow">最终补充问题</p>
            <h2>整体评估体验</h2>
          </div>
          <button class="secondary-action" type="button" id="back-step">返回上一页</button>
        </div>

        <div class="scale-banner">
          <strong>七点量表</strong>
          <span>以下题目只需在看完全部 12 份提案后回答一次。1 分为非常不同意，7 分为极为同意。</span>
        </div>

        <section class="rating-layout" aria-label="最终补充问题">
          ${evaluationGroups.map(evaluationGroup => `
            <section class="score-section">
              <div class="score-section-title">
                <h3>${evaluationGroup.title}</h3>
                <p>请根据本次完整评估体验进行回答。</p>
              </div>
              ${finalEvaluationMatrix(evaluationGroup.items)}
            </section>
          `).join("")}
        </section>

        <div class="dock-actions">
          <p id="form-message" role="status"></p>
          <button class="primary-action" type="submit">提交全部问卷</button>
        </div>
      </form>
    </main>
  `;

  document.querySelector("#final-evaluation-form").addEventListener("submit", handleFinalEvaluationSubmit);
  document.querySelector("#back-step").addEventListener("click", () => {
    persistFinalEvaluation(document.querySelector("#final-evaluation-form"));
    state.currentGroupIndex = groups.length - 1;
    saveState();
    render();
  });
  restoreFinalEvaluationValues();
}

function handleFinalEvaluationSubmit(event) {
  event.preventDefault();
  if (!validateFormCompletion(event.currentTarget, "请完成全部最终补充问题后再提交。")) return;
  persistFinalEvaluation(event.currentTarget);

  state.completed = true;
  state.submittedAt = new Date().toISOString();
  saveState();
  submitPayload();
  render();
}

function persistFinalEvaluation(form) {
  const formData = new FormData(form);
  const values = {};
  evaluationItems.forEach(item => {
    values[item.key] = formData.get(`finalEvaluation.${item.key}`);
  });
  state.finalEvaluation = values;
  saveState();
}

function restoreFinalEvaluationValues() {
  if (!state.finalEvaluation) return;
  Object.entries(state.finalEvaluation).forEach(([key, value]) => {
    const input = document.querySelector(`[name="finalEvaluation.${key}"]`);
    if (input) input.value = value;
  });
}

function handleGroupSubmit(event) {
  event.preventDefault();
  const group = groups[state.currentGroupIndex];
  if (!validateFormCompletion(event.currentTarget, "请完成本组所有评分和排名后再提交。")) return;
  persistCurrentGroup(group);

  const ranks = group.proposals.map(proposal => state.responses[group.id][proposal.id].rank);
  if (new Set(ranks).size !== group.proposals.length) {
    setMessage("请为本组三份方案设置不重复的组内排名。");
    return;
  }

  if (state.currentGroupIndex < groups.length - 1) {
    state.currentGroupIndex += 1;
    saveState();
    render();
    return;
  }

  state.currentGroupIndex = groups.length;
  saveState();
  render();
}

function goBackFromGroup() {
  if (state.currentGroupIndex <= 0) {
    renderIntro();
    return;
  }
  state.currentGroupIndex -= 1;
  saveState();
  render();
}

function persistCurrentGroup(group) {
  const form = document.querySelector("#rating-form");
  const formData = new FormData(form);
  state.responses[group.id] = state.responses[group.id] || {};

  group.proposals.forEach(proposal => {
    const values = {};
    [...dimensions, { key: "rank" }, ...fundingRecommendationItems].forEach(item => {
      values[item.key] = formData.get(`${group.id}.${proposal.id}.${item.key}`);
    });
    state.responses[group.id][proposal.id] = values;
  });
  saveState();
}

function restoreGroupValues(group) {
  const groupValues = state.responses[group.id];
  if (!groupValues) return;
  Object.entries(groupValues).forEach(([proposalId, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      const input = document.querySelector(`[name="${group.id}.${proposalId}.${key}"]`);
      if (input) input.value = value;
    });
  });
}

function setMessage(text) {
  const message = document.querySelector("#form-message");
  if (message) message.textContent = text;
}

function setElementMessage(id, text) {
  const message = document.querySelector(`#${id}`);
  if (message) message.textContent = text;
}

function validateFormCompletion(form, message, messageId = "form-message") {
  clearInvalidFields(form);
  const fields = Array.from(form.querySelectorAll("input, select, textarea"))
    .filter(field => !field.disabled && field.type !== "hidden");
  const missingFields = fields.filter(field => !String(field.value || "").trim());

  if (missingFields.length === 0) {
    setElementMessage(messageId, "");
    return true;
  }

  missingFields.forEach(field => field.classList.add("is-invalid"));
  setElementMessage(messageId, message);
  missingFields[0].focus();
  return false;
}

function clearInvalidFields(form) {
  form.querySelectorAll(".is-invalid").forEach(field => field.classList.remove("is-invalid"));
}

async function submitPayload() {
  const endpoint = (CONFIG.submissionEndpoint || "").trim();
  if (!endpoint) return;
  state.remoteSubmissionAttempted = true;
  saveState();

  try {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(buildPayload())
    });
  } catch (error) {
    console.warn("Remote submission failed.", error);
  }
}

function buildPayload() {
  return {
    studyId: CONFIG.studyId || "ai_science_fund_proposal_evaluation",
    participantId: state.participantId,
    startedAt: state.startedAt,
    submittedAt: state.submittedAt,
    elapsedMinutes: Math.round((new Date(state.submittedAt).getTime() - new Date(state.startedAt).getTime()) / 60000),
    basicInfo: state.basicInfo,
    responses: state.responses,
    finalEvaluation: state.finalEvaluation || {}
  };
}

function renderThanks() {
  const hasEndpoint = Boolean((CONFIG.submissionEndpoint || "").trim());
  app.innerHTML = `
    <main class="thanks-page">
      <section class="thanks-card">
        <p class="eyebrow">问卷已完成</p>
        <h1>非常感谢您的专业评估</h1>
        <p>您的评分已经保存在当前浏览器中${hasEndpoint ? "，并已尝试提交至研究数据端点" : ""}。为避免网络或权限问题导致遗漏，建议下载一份结果备份。</p>
        <div class="download-actions">
          <button class="primary-action" id="download-json">下载 JSON</button>
          <button class="secondary-action" id="download-csv">下载 CSV</button>
          <button class="text-action" id="restart">重新开始</button>
        </div>
      </section>
    </main>
  `;

  document.querySelector("#download-json").addEventListener("click", downloadJson);
  document.querySelector("#download-csv").addEventListener("click", downloadCsv);
  document.querySelector("#restart").addEventListener("click", () => {
    if (confirm("确定要清空当前浏览器中的问卷进度并重新开始吗？")) {
      localStorage.removeItem(STORAGE_KEY);
      state = createInitialState();
      render();
    }
  });
}

function downloadJson() {
  downloadFile(`questionnaire_${state.participantId}.json`, JSON.stringify(buildPayload(), null, 2), "application/json");
}

function downloadCsv() {
  const rows = [
    [
      "参与者ID", "开始时间", "提交时间", "姓名", "职称", "研究方向", "取得博士学位至今时间（年）",
      "主持国家自然科学基金项目数量", "是否有国家自然科学基金项目评审经验", "完成评估所需时间（小时）",
      "组别", "方案编号", ...dimensions.map(item => item.label), "组内排名",
      "资助建议", ...evaluationItems.map(item => `${item.label}.${item.text}`)
    ]
  ];

  groups.forEach(group => {
    group.proposals.forEach(proposal => {
      const values = state.responses[group.id]?.[proposal.id] || {};
      const evaluationValues = state.finalEvaluation || {};
      rows.push([
        state.participantId,
        state.startedAt,
        state.submittedAt,
        state.basicInfo.name,
        state.basicInfo.title,
        state.basicInfo.researchDirection,
        state.basicInfo.yearsSincePhd,
        state.basicInfo.nsfcCount,
        state.basicInfo.hasNsfcReviewExperience,
        state.basicInfo.completionTimeHours,
        group.id,
        proposal.id,
        ...dimensions.map(item => values[item.key] || ""),
        values.rank || "",
        values.fundingRecommendation || "",
        ...evaluationItems.map(item => evaluationValues[item.key] || "")
      ]);
    });
  });

  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}`;
  downloadFile(`questionnaire_${state.participantId}.csv`, csv, "text/csv;charset=utf-8");
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

render();
