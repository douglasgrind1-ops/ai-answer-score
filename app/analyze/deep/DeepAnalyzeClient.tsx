"use client";

import { useEffect, useMemo, useState } from "react";

type StressItem = {
  text: string;
  impact?: string;
};

type ClaimReview = {
  claim: string;
  concern: string;
  severity?: string;
};

type LiteResponse = {
  reliability_score?: number;
  label?: string;
  summary?: string;
  top_risk_hint?: string;
  deep_reasoning_prompt?: string;
  error?: string;
};

type FullAnalysisResponse = {
  reconstruction?: {
    main_conclusion?: string;
    supporting_claims?: string[];
    assumptions?: string[];
    uncertain_or_context_dependent_claims?: string[];
  };
  stress_test?: {
    reliability_score?: number;
    summary?: string;
    reliability_explanation?: string;
    alternative_perspective?: string;
    weakest_assumptions?: StressItem[];
    missing_risks?: StressItem[];
    reasoning_gaps?: StressItem[];
    failure_scenarios?: StressItem[];
    claim_reviews?: ClaimReview[];
  };
  error?: string;
};

function scoreLabel(score: number) {
  if (score >= 9) return "Highly reliable";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Moderately reliable";
  if (score >= 3) return "Use caution";
  return "Low reliability";
}

function scoreColor(score: number) {
  if (score >= 9) return "text-green-600";
  if (score >= 7) return "text-indigo-600";
  if (score >= 5) return "text-amber-500";
  return "text-red-500";
}

function truncateText(text: string, maxLength: number) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

function SectionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {eyebrow}
      </div>
      <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items?: StressItem[] }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm leading-7 text-slate-600">
        No major issues were surfaced in this section.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={`${item.text}-${index}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div className="text-sm leading-7 text-slate-900">{item.text}</div>
          {item.impact ? (
            <div className="mt-2 inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              {item.impact} impact
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function StringList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm leading-7 text-slate-600">
        No additional information was returned in this section.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function ClaimReviewList({ items }: { items?: ClaimReview[] }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm leading-7 text-slate-600">
        No claim-level review was returned.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={`${item.claim}-${index}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
        >
          <div className="text-sm font-semibold text-slate-900">
            {item.claim}
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {item.concern}
          </p>
          {item.severity ? (
            <div className="mt-3 inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              {item.severity} severity
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function buildDeepReasoningPrompt(
  question: string,
  lite: LiteResponse | null,
  full: FullAnalysisResponse | null
) {
  if (lite?.deep_reasoning_prompt?.trim()) {
    return lite.deep_reasoning_prompt.trim();
  }

  const stress = full?.stress_test;

  const assumption =
    stress?.weakest_assumptions?.[0]?.text || "unclear assumptions";
  const risk =
    stress?.missing_risks?.[0]?.text || "missing risks or constraints";
  const gap =
    stress?.reasoning_gaps?.[0]?.text || "insufficient reasoning depth";

  return `Provide a stronger answer to this question:

${question}

Improve the answer by addressing:
- ${assumption}
- ${risk}
- ${gap}

Requirements:
• clarify assumptions
• address missing risks
• strengthen reasoning
• give a clear, structured answer`;
}

export default function DeepAnalyzeClient({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [lite, setLite] = useState<LiteResponse | null>(null);
  const [full, setFull] = useState<FullAnalysisResponse | null>(null);
  const [liteLoading, setLiteLoading] = useState(Boolean(question && answer));
  const [fullLoading, setFullLoading] = useState(Boolean(question && answer));
  const [liteError, setLiteError] = useState<string | null>(null);
  const [fullError, setFullError] = useState<string | null>(null);

  useEffect(() => {
    if (!question || !answer) {
      setLiteLoading(false);
      setFullLoading(false);
      return;
    }

    let cancelled = false;

    async function runLite() {
      try {
        setLiteLoading(true);
        setLiteError(null);

        const res = await fetch("/api/analyze-lite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question, answer }),
        });

        const data = (await res.json()) as LiteResponse;
        if (cancelled) return;

        if (!res.ok) {
          setLiteError(data?.error || "Failed to run initial analysis.");
          setLite(null);
          return;
        }

        setLite(data);
      } catch (err) {
        if (cancelled) return;
        setLiteError(err instanceof Error ? err.message : "Unknown error.");
        setLite(null);
      } finally {
        if (!cancelled) setLiteLoading(false);
      }
    }

    async function runFull() {
      try {
        setFullLoading(true);
        setFullError(null);

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question, answer }),
        });

        const data = (await res.json()) as FullAnalysisResponse;
        if (cancelled) return;

        if (!res.ok) {
          setFullError(data?.error || "Failed to run deep analysis.");
          setFull(null);
          return;
        }

        setFull(data);
      } catch (err) {
        if (cancelled) return;
        setFullError(err instanceof Error ? err.message : "Unknown error.");
        setFull(null);
      } finally {
        if (!cancelled) setFullLoading(false);
      }
    }

    runLite();
    runFull();

    return () => {
      cancelled = true;
    };
  }, [question, answer]);

  const stress = full?.stress_test;
  const reconstruction = full?.reconstruction;

  const score =
    typeof lite?.reliability_score === "number"
      ? lite.reliability_score
      : typeof stress?.reliability_score === "number"
        ? stress.reliability_score
        : null;

  const label =
    score !== null
      ? lite?.label || scoreLabel(score)
      : "Unavailable";

  const verdict =
    lite?.summary ||
    stress?.summary ||
    liteError ||
    fullError ||
    "No verdict available.";

  const keyRisk =
    lite?.top_risk_hint ||
    stress?.missing_risks?.[0]?.text ||
    stress?.weakest_assumptions?.[0]?.text ||
    stress?.reasoning_gaps?.[0]?.text ||
    "No dominant reliability risk was identified.";

  const deepPrompt = useMemo(() => {
    return buildDeepReasoningPrompt(question, lite, full);
  }, [question, lite, full]);

  const answerPreview = useMemo(() => truncateText(answer, 900), [answer]);

  const showHeroLoading = liteLoading && !lite;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Score
          </div>

          {showHeroLoading ? (
            <div className="space-y-4">
              <div className="text-5xl font-extrabold tracking-tight text-slate-300">
                —
              </div>
              <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
                ✦ Starting analysis...
              </div>
              <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex items-end gap-3">
                <div
                  className={`text-6xl font-extrabold tracking-tight ${
                    score !== null ? scoreColor(score) : "text-slate-400"
                  }`}
                >
                  {score !== null ? score : "—"}
                </div>
                <div className="pb-2">
                  <div className="text-lg font-semibold text-slate-500">/10</div>
                  <div
                    className={`mt-1 text-sm font-semibold ${
                      score !== null ? scoreColor(score) : "text-slate-500"
                    }`}
                  >
                    {label}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Verdict
                </div>
                <p className="mt-2 text-base leading-7 text-slate-900">
                  {verdict}
                </p>
              </div>
            </>
          )}
        </div>

        <SectionCard eyebrow="Key Reliability Risk" title="Highest-Impact Issue">
          {liteLoading && !lite ? (
            <div className="h-16 rounded-2xl bg-amber-50 animate-pulse" />
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-base leading-7 text-slate-900">{keyRisk}</p>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard eyebrow="Improve the Answer" title="Deep Reasoning Prompt">
        {liteLoading && !lite ? (
          <div className="space-y-3">
            <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-900">
              {deepPrompt}
            </p>

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(deepPrompt)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Copy Prompt
            </button>
          </div>
        )}
      </SectionCard>

      <SectionCard eyebrow="Deep Analysis" title="Reasoning Audit">
        <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
          {fullLoading
            ? "Running full audit..."
            : fullError
              ? "Full audit unavailable"
              : "Full audit complete"}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Reasoning Audit" title="Weak Assumptions">
          {fullLoading && !stress ? (
            <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            <BulletList items={stress?.weakest_assumptions} />
          )}
        </SectionCard>

        <SectionCard eyebrow="Reasoning Audit" title="Missing Risks">
          {fullLoading && !stress ? (
            <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            <BulletList items={stress?.missing_risks} />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Reasoning Audit" title="Reasoning Gaps">
          {fullLoading && !stress ? (
            <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            <BulletList items={stress?.reasoning_gaps} />
          )}
        </SectionCard>

        <SectionCard eyebrow="Reasoning Audit" title="Failure Scenarios">
          {fullLoading && !stress ? (
            <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            <BulletList items={stress?.failure_scenarios} />
          )}
        </SectionCard>
      </div>

      <SectionCard eyebrow="Claim Review" title="Claim-Level Concerns">
        {fullLoading && !stress ? (
          <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
        ) : (
          <ClaimReviewList items={stress?.claim_reviews} />
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Reconstruction" title="Main Conclusion">
          {fullLoading && !reconstruction ? (
            <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            <p className="whitespace-pre-wrap text-base leading-8 text-slate-900">
              {reconstruction?.main_conclusion ||
                "No main conclusion was reconstructed."}
            </p>
          )}
        </SectionCard>

        <SectionCard eyebrow="Reconstruction" title="Supporting Claims">
          {fullLoading && !reconstruction ? (
            <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            <StringList items={reconstruction?.supporting_claims} />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Reconstruction" title="Underlying Assumptions">
          {fullLoading && !reconstruction ? (
            <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            <StringList items={reconstruction?.assumptions} />
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Reconstruction"
          title="Uncertain or Context-Dependent Claims"
        >
          {fullLoading && !reconstruction ? (
            <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            <StringList
              items={reconstruction?.uncertain_or_context_dependent_claims}
            />
          )}
        </SectionCard>
      </div>

      <SectionCard eyebrow="Alternative Perspective" title="Another Angle">
        {fullLoading && !stress ? (
          <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
        ) : (
          <p className="whitespace-pre-wrap text-base leading-8 text-slate-900">
            {stress?.alternative_perspective ||
              "No alternative perspective was returned."}
          </p>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Original Question" title="Question">
          <p className="whitespace-pre-wrap text-base leading-8 text-slate-900">
            {question || "No question provided."}
          </p>
        </SectionCard>

        <SectionCard eyebrow="AI Answer" title="Answer Preview">
          <div className="space-y-4">
            <p className="whitespace-pre-wrap text-base leading-8 text-slate-900">
              {answerPreview || "No answer provided."}
            </p>

            {answer.length > 900 ? (
              <details className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  Show full answer
                </summary>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-900">
                  {answer}
                </p>
              </details>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
