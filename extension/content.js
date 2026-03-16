console.log("AI Answer Score extension loaded.");

const processedBlocks = new WeakSet();
const answerState = new WeakMap();
const answerMutationTime = new WeakMap();
const scoringInFlight = new WeakSet();

function ensureInlineStyles() {
  if (document.getElementById("aas-inline-styles")) return;

  const style = document.createElement("style");
  style.id = "aas-inline-styles";
  style.textContent = `
    .aas-inline-container{
      display:inline-flex;
      align-items:center;
      gap:8px;
      margin-top:10px;
      flex-wrap:wrap;
    }

    .aas-inline-separator{
      color:#94a3b8;
      font-size:13px;
    }

    .aas-inline-score-button{
      display:inline-flex;
      flex-direction:column;
      align-items:flex-start;
      gap:3px;
      border:1px solid #e2e8f0;
      background:#ffffff;
      color:#111827;
      font-size:13px;
      font-weight:600;
      cursor:pointer;
      padding:10px 12px;
      border-radius:14px;
      line-height:1.2;
      box-shadow:0 4px 18px rgba(15, 23, 42, 0.06);
      min-width:210px;
    }

    .aas-inline-score-button:hover{
      background:#f8fafc;
    }

    .aas-inline-score-button:disabled{
      cursor:default;
      opacity:1;
    }

    .aas-badge-header{
      font-size:11px;
      font-weight:700;
      letter-spacing:.06em;
      text-transform:uppercase;
      color:#4f46e5;
    }

    .aas-score{
      font-size:20px;
      font-weight:800;
      line-height:1.1;
    }

    .aas-label{
      font-size:12px;
      color:#64748b;
      font-weight:700;
    }

    .aas-risk-line{
      font-size:12px;
      color:#b45309;
      line-height:1.3;
      font-weight:600;
    }

    .aas-cta{
      font-size:12px;
      color:#4f46e5;
      font-weight:800;
      line-height:1.3;
      margin-top:2px;
    }

    .aas-inline-score-button:hover .aas-cta{
      text-decoration:underline;
    }

    .aas-score-high{
      color:#16a34a;
    }

    .aas-score-good{
      color:#4f46e5;
    }

    .aas-score-medium{
      color:#f59e0b;
    }

    .aas-score-low{
      color:#ef4444;
    }

    #aas-panel{
      position:fixed;
      top:0;
      right:0;
      width:400px;
      max-width:100%;
      height:100vh;
      z-index:999999;
      background:
        radial-gradient(circle at top left, rgba(99, 102, 241, 0.14), transparent 28%),
        linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      border-left:1px solid rgba(148, 163, 184, 0.25);
      box-shadow:-24px 0 60px rgba(15, 23, 42, 0.14);
      overflow-y:auto;
      font-family:system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .aas-panel-shell{
      padding:22px 18px 28px;
    }

    .aas-panel-topbar{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
    }

    .aas-panel-brand{
      display:flex;
      align-items:center;
      gap:12px;
    }

    .aas-panel-mark{
      width:36px;
      height:36px;
      border-radius:12px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:16px;
      font-weight:700;
      color:#4f46e5;
      background:linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.08));
      border:1px solid rgba(99, 102, 241, 0.18);
    }

    .aas-panel-brandtext{
      display:flex;
      flex-direction:column;
      gap:2px;
    }

    .aas-panel-eyebrow{
      font-size:11px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:0.08em;
      color:#64748b;
    }

    .aas-panel-title{
      font-size:20px;
      font-weight:800;
      color:#0f172a;
      line-height:1.1;
    }

    .aas-close-button{
      width:34px;
      height:34px;
      border:1px solid rgba(148, 163, 184, 0.22);
      border-radius:10px;
      background:rgba(255, 255, 255, 0.75);
      color:#475569;
      font-size:22px;
      line-height:1;
      cursor:pointer;
    }

    .aas-close-button:hover{
      background:#ffffff;
    }

    .aas-panel-hero{
      margin-top:18px;
      padding:18px;
      border-radius:20px;
      background:rgba(255, 255, 255, 0.74);
      border:1px solid rgba(148, 163, 184, 0.16);
      box-shadow:0 14px 34px rgba(15, 23, 42, 0.06);
    }

    .aas-panel-score-row{
      display:flex;
      align-items:flex-end;
      gap:12px;
    }

    .aas-panel-score{
      font-size:48px;
      font-weight:800;
      line-height:0.9;
      letter-spacing:-0.03em;
    }

    .aas-panel-score-meta{
      display:flex;
      flex-direction:column;
      gap:4px;
    }

    .aas-panel-score-scale{
      font-size:14px;
      font-weight:700;
      color:#64748b;
    }

    .aas-panel-subtitle{
      font-size:13px;
      font-weight:600;
    }

    .aas-panel-risk-chip{
      margin-top:14px;
      display:inline-flex;
      align-items:center;
      padding:7px 10px;
      border-radius:999px;
      background:rgba(245, 158, 11, 0.12);
      color:#b45309;
      font-size:12px;
      font-weight:700;
    }

    .aas-panel-section{
      margin-top:20px;
    }

    .aas-panel-section-label{
      margin-bottom:8px;
      font-size:11px;
      font-weight:800;
      text-transform:uppercase;
      letter-spacing:0.08em;
      color:#64748b;
    }

    .aas-panel-card{
      padding:14px 14px 15px;
      border-radius:18px;
      background:rgba(255, 255, 255, 0.82);
      border:1px solid rgba(148, 163, 184, 0.14);
      box-shadow:0 10px 28px rgba(15, 23, 42, 0.04);
    }

    .aas-panel-card p{
      margin:0;
      color:#0f172a;
      font-size:14px;
      line-height:1.6;
    }

    .aas-panel-list{
      margin:0;
      padding-left:18px;
    }

    .aas-panel-list li{
      color:#0f172a;
      font-size:14px;
      line-height:1.6;
    }

    .aas-prompt-card{
      padding:0;
      overflow:hidden;
    }

    .aas-better-prompt{
      background:linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
      border:1px solid rgba(148, 163, 184, 0.12);
      padding:14px;
      border-radius:18px;
      font-size:14px;
      line-height:1.6;
      color:#0f172a;
      white-space:pre-wrap;
    }

    .aas-panel-actions{
      display:flex;
      flex-direction:column;
      gap:10px;
      margin-top:12px;
    }

    .aas-button{
      width:100%;
      border:none;
      border-radius:14px;
      padding:12px 14px;
      cursor:pointer;
      font-size:14px;
      font-weight:700;
      transition:transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
    }

    .aas-button:hover{
      transform:translateY(-1px);
    }

    .aas-button-primary{
      background:linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color:#ffffff;
      box-shadow:0 10px 24px rgba(79, 70, 229, 0.25);
    }

    .aas-button-secondary{
      background:rgba(79, 70, 229, 0.08);
      color:#4338ca;
      border:1px solid rgba(79, 70, 229, 0.14);
    }

    .aas-button-tertiary{
      background:#ffffff;
      color:#334155;
      border:1px solid rgba(148, 163, 184, 0.22);
    }
  `;
  document.head.appendChild(style);
}

function findConversationBlocks() {
  const roleBlocks = document.querySelectorAll(
    '[data-message-author-role="user"], [data-message-author-role="assistant"]'
  );

  if (roleBlocks && roleBlocks.length > 0) {
    return Array.from(roleBlocks);
  }

  const articleBlocks = document.querySelectorAll(
    'article[data-testid="conversation-turn"]'
  );

  return Array.from(articleBlocks);
}

function getTextFromElement(el) {
  if (!el) return "";
  return (el.innerText || "").trim();
}

function getLatestTurn() {
  const blocks = findConversationBlocks();
  if (blocks.length < 2) return null;

  const answerBlock = blocks[blocks.length - 1];
  const questionBlock = blocks[blocks.length - 2];

  const question = getTextFromElement(questionBlock)
    .replace(/^You said:\s*/i, "")
    .trim();

  const answer = getTextFromElement(answerBlock)
    .replace(/^ChatGPT said:\s*/i, "")
    .trim();

  if (!question || !answer) return null;

  return {
    question,
    answer,
    answerElement: answerBlock
  };
}

function scoreToLabel(score) {
  if (score >= 9) return "Highly reliable";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Moderately reliable";
  if (score >= 3) return "Use caution";
  return "Low reliability";
}

function scoreToColor(score) {
  if (score >= 9) return "aas-score-high";
  if (score >= 7) return "aas-score-good";
  if (score >= 5) return "aas-score-medium";
  return "aas-score-low";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

function cleanAnswerForExport(answer) {
  if (!answer) return "";

  return answer
    .replace(/\|\s*✦ AI Answer Score[\s\S]*$/i, "")
    .replace(/Analyze reasoning →[\s\S]*$/i, "")
    .trim();
}

function insertPromptIntoChatGPT(promptText) {
  const selectors = [
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]',
    "textarea"
  ];

  let input = null;

  for (const selector of selectors) {
    const candidate = document.querySelector(selector);
    if (candidate) {
      input = candidate;
      break;
    }
  }

  if (!input) {
    throw new Error("Could not find the ChatGPT input box.");
  }

  input.focus();

  if (input.tagName === "TEXTAREA") {
    input.value = promptText;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  input.innerHTML = "";
  input.textContent = promptText;
  input.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: promptText
    })
  );
}

function createBadge(targetElement, score, label, resultData, isLoading, question, answer) {
  if (!targetElement) return;

  ensureInlineStyles();

  let container = targetElement.querySelector(".aas-inline-container");

  if (!container) {
    container = document.createElement("div");
    container.className = "aas-inline-container";
    targetElement.appendChild(container);
  }

  if (isLoading || score === null || typeof score === "undefined") {
    container.innerHTML = `
      <span class="aas-inline-separator">|</span>
      <button class="aas-inline-score-button" type="button" disabled>
        <div class="aas-badge-header">✦ AI Answer Score</div>
        <div class="aas-score">Analyzing...</div>
        <div class="aas-label">Trust badge</div>
        <div class="aas-cta">Analyze reasoning →</div>
      </button>
    `;
    return;
  }

  const numericScore = score === "?" ? null : Number(score);
  const scoreClass =
    score === "?" || Number.isNaN(numericScore)
      ? "aas-score-low"
      : scoreToColor(numericScore);

  const primaryRisk =
    resultData?.top_risk_hint || "Potential reasoning gaps detected.";

  const scoreText =
    score === "?"
      ? "Unavailable"
      : `${escapeHtml(String(score))} / 10`;

  container.innerHTML = `
    <span class="aas-inline-separator">|</span>
    <button class="aas-inline-score-button" type="button">
      <div class="aas-badge-header">✦ AI Answer Score</div>
      <div class="aas-score ${scoreClass}">${scoreText}</div>
      <div class="aas-label">${escapeHtml(label || "Unavailable")}</div>
      <div class="aas-risk-line">Primary Risk: ${escapeHtml(primaryRisk)}</div>
      <div class="aas-cta">Analyze reasoning →</div>
    </button>
  `;

  const button = container.querySelector(".aas-inline-score-button");
  if (button) {
    button.addEventListener("click", function () {
      openPanel(score, label, resultData, question, answer);
    });
  }
}

function openPanel(score, label, result, question, answer) {
  const existing = document.getElementById("aas-panel");
  if (existing) {
    existing.remove();
  }

  const summary =
    result && result.summary
      ? result.summary
      : "No verdict available.";

  const topRiskHint =
    result && result.top_risk_hint
      ? result.top_risk_hint
      : "Missing context";

  const deepReasoningPrompt =
    result && result.deep_reasoning_prompt
      ? result.deep_reasoning_prompt
      : "Provide a stronger answer with clearer assumptions, stronger reasoning, and a more structured response.";

  const panel = document.createElement("div");
  panel.id = "aas-panel";

  const subtitleClass =
    score === "?" ? "aas-score-low" : scoreToColor(Number(score));

  const subtitleText =
    score === "?"
      ? "Score unavailable"
      : `${escapeHtml(String(score))} / 10 · ${escapeHtml(label || "Unavailable")}`;

  panel.innerHTML = `
    <div class="aas-panel-shell">
      <div class="aas-panel-topbar">
        <div class="aas-panel-brand">
          <div class="aas-panel-mark">✦</div>
          <div class="aas-panel-brandtext">
            <div class="aas-panel-eyebrow">AI trust layer</div>
            <div class="aas-panel-title">AI Answer Score</div>
          </div>
        </div>
        <button id="aas-close" class="aas-close-button" type="button">×</button>
      </div>

      <div class="aas-panel-hero">
        <div class="aas-panel-score-row">
          <div class="aas-panel-score ${subtitleClass}">
            ${score === "?" ? "—" : escapeHtml(String(score))}
          </div>
          <div class="aas-panel-score-meta">
            <div class="aas-panel-score-scale">/10</div>
            <div class="aas-panel-subtitle ${subtitleClass}">
              ${subtitleText}
            </div>
          </div>
        </div>

        <div class="aas-panel-risk-chip">
          ${escapeHtml(topRiskHint)}
        </div>
      </div>

      <div class="aas-panel-section">
        <div class="aas-panel-section-label">Verdict</div>
        <div class="aas-panel-card">
          <p>${escapeHtml(summary)}</p>
        </div>
      </div>

      <div class="aas-panel-section">
        <div class="aas-panel-section-label">Improve the Answer</div>
        <div class="aas-panel-card aas-prompt-card">
          <div class="aas-better-prompt">${escapeHtml(deepReasoningPrompt)}</div>
        </div>

        <div class="aas-panel-actions">
          <button id="aas-use-deep-reasoning" class="aas-button aas-button-primary" type="button">
            Use in ChatGPT
          </button>
          <button id="aas-copy-deep-reasoning" class="aas-button aas-button-tertiary" type="button">
            Copy Prompt
          </button>
          <button id="aas-open-full-analysis" class="aas-button aas-button-secondary" type="button">
            Open full audit
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  const closeButton = panel.querySelector("#aas-close");
  if (closeButton) {
    closeButton.addEventListener("click", function () {
      panel.remove();
    });
  }

  const copyDeepReasoningButton = panel.querySelector("#aas-copy-deep-reasoning");
  if (copyDeepReasoningButton) {
    copyDeepReasoningButton.addEventListener("click", function () {
      navigator.clipboard.writeText(deepReasoningPrompt);
      copyDeepReasoningButton.textContent = "Copied!";
    });
  }

  const useDeepReasoningButton = panel.querySelector("#aas-use-deep-reasoning");
  if (useDeepReasoningButton) {
    useDeepReasoningButton.addEventListener("click", function () {
      try {
        insertPromptIntoChatGPT(deepReasoningPrompt);
        useDeepReasoningButton.textContent = "Inserted";
      } catch (error) {
        console.error("Prompt insert error:", error);
        useDeepReasoningButton.textContent = "Could not insert";
      }
    });
  }

  const fullAnalysisButton = panel.querySelector("#aas-open-full-analysis");
  if (fullAnalysisButton) {
    fullAnalysisButton.addEventListener("click", function () {
      const params = new URLSearchParams({
        question: question || "",
        answer: cleanAnswerForExport(answer || "")
      });

      window.open(
        `https://www.aianswerscore.com/analyze/deep?${params.toString()}`,
        "_blank"
      );
    });
  }
}

function requestScore(question, answer) {
  return new Promise(function (resolve, reject) {
    const timeoutId = setTimeout(function () {
      reject(new Error("Timed out waiting for background response"));
    }, 90000);

    chrome.runtime.sendMessage(
      {
        type: "ANALYZE_ANSWER",
        question: question,
        answer: answer
      },
      function (response) {
        clearTimeout(timeoutId);

        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!response) {
          reject(new Error("No response from background script"));
          return;
        }

        if (!response.ok) {
          reject(new Error(response.error || "Unknown API error"));
          return;
        }

        resolve(response.data);
      }
    );
  });
}

function shouldSkipScoring(answer) {
  return (
    !answer ||
    answer.length < 120 ||
    answer.includes("Searching the web") ||
    answer.includes("Thought for") ||
    answer.includes("Reasoned for")
  );
}

function chatGPTIsStillGenerating() {
  const buttons = Array.from(document.querySelectorAll("button"));
  return buttons.some(function (b) {
    const text = (b.innerText || "").trim().toLowerCase();
    return (
      text.includes("stop generating") ||
      text === "stop" ||
      text.includes("cancel")
    );
  });
}

function isStableEnough(answerElement, answer) {
  if (shouldSkipScoring(answer)) {
    return false;
  }

  if (chatGPTIsStillGenerating()) {
    return false;
  }

  const now = Date.now();
  const state = answerState.get(answerElement);

  if (!state) {
    answerState.set(answerElement, {
      firstSeenAt: now
    });
    return false;
  }

  const lastMutationAt = answerMutationTime.get(answerElement);
  if (!lastMutationAt) {
    return false;
  }

  const quietForMs = now - lastMutationAt;
  const seenForMs = now - state.firstSeenAt;

  return seenForMs >= 6000 && quietForMs >= 3500;
}

async function processLatestConversationTurn() {
  const data = getLatestTurn();
  if (!data) return;

  const question = data.question;
  const answer = data.answer;
  const answerElement = data.answerElement;

  if (
    answer &&
    answer.length > 10 &&
    !answerElement.querySelector(".aas-inline-container")
  ) {
    createBadge(answerElement, null, null, null, true, question, answer);
  }

  if (!isStableEnough(answerElement, answer)) {
    return;
  }

  if (processedBlocks.has(answerElement)) return;
if (scoringInFlight.has(answerElement)) return;

scoringInFlight.add(answerElement);

try {
  const result = await requestScore(question, answer);
  processedBlocks.add(answerElement);

    const score =
      result && typeof result.reliability_score !== "undefined"
        ? result.reliability_score
        : "?";

    const label =
      result && result.label
        ? result.label
        : score === "?"
          ? "Unavailable"
          : scoreToLabel(score);

    createBadge(
      answerElement,
      score,
      label,
      result,
      false,
      question,
      answer
    );
  } catch (error) {
    console.error("AI Answer Score error:", error);

    createBadge(
      answerElement,
      "?",
      "Scoring failed",
      {
        summary: "The extension could not reach the scoring API.",
        top_risk_hint: "Try again in a moment.",
        deep_reasoning_prompt:
          "Provide a stronger answer with clearer assumptions, stronger reasoning, and a more structured response."
      },
      false,
      question,
      answer
    );
  } finally {
  scoringInFlight.delete(answerElement);
  }
}

let processingScheduled = false;

function scheduleProcessing() {
  if (processingScheduled) return;
  processingScheduled = true;

  setTimeout(function () {
    processingScheduled = false;
    processLatestConversationTurn().catch(function (error) {
      console.error("AI Answer Score processing error:", error);
    });
  }, 250);
}

function startObserver() {
  const observer = new MutationObserver(function () {
    const latest = getLatestTurn();
    if (latest && latest.answerElement) {
      const now = Date.now();

      if (!answerState.has(latest.answerElement)) {
        answerState.set(latest.answerElement, {
          firstSeenAt: now
        });
      }

      answerMutationTime.set(latest.answerElement, now);
    }

    scheduleProcessing();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  const latest = getLatestTurn();
  if (latest && latest.answerElement) {
    const now = Date.now();

    if (!answerState.has(latest.answerElement)) {
      answerState.set(latest.answerElement, {
        firstSeenAt: now
      });
    }

    answerMutationTime.set(latest.answerElement, now);
  }

  scheduleProcessing();
}

ensureInlineStyles();
startObserver();
setInterval(scheduleProcessing, 2000);
