"use client";

import { useEffect, useMemo, useState } from "react";

type LiteResponse = {
  reliability_score?: number;
  label?: string;
  summary?: string;
  top_risk_hint?: string;
  deep_reasoning_prompt?: string;
  error?: string;
};

function scoreToLabel(score: number) {
  if (score >= 9) return "Highly reliable";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Moderately reliable";
  if (score >= 3) return "Use caution";
  return "Low reliability";
}

function scoreColorClasses(score: number) {
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

export default function AnalyzeClient({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [analysis, setAnalysis] = useState<LiteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(question && answer));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!question || !answer) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        setIsLoading(true);
        setError(null);

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
          setError(data?.error || "Failed to run analysis.");
          setAnalysis(null);
          return;
        }

        setAnalysis(data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error.");
        setAnalysis(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [question, answer]);

  const score =
    typeof analysis?.reliability_score === "number"
      ? analysis.reliability_score
      : null;

  const label =
    score !== null
      ? analysis?.label || scoreToLabel(score)
      : "Unavailable";

  const answerPreview = useMemo(() => truncateText(answer, 700), [answer]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Score
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="text-5xl font-extrabold tracking-tight text-slate-300">
                  —
                </div>
                <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
                  ✦ Analyzing...
                </div>
                <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-end gap-3">
                  <div
                    className={`text-6xl font-extrabold tracking-tight ${
                      score !== null
                        ? scoreColorClasses(score)
                        : "text-slate-400"
                    }`}
                  >
                    {score !== null ? score : "—"}
                  </div>
                  <div className="pb-2">
                    <div className="text-lg font-semibold text-slate-500">
                      /10
                    </div>
                    <div
                      className={`mt-1 text-sm font-semibold ${
                        score !== null
                          ? scoreColorClasses(score)
                          : "text-slate-500"
                      }`}
                    >
                      {error ? "Unavailable" : label}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Verdict
                  </div>
                  <p className="mt-2 text-base leading-7 text-slate-900">
                    {error
                      ? error
                      : analysis?.summary || "No analysis is available yet."}
                  </p>
                </div>
              </>
            )}
          </div>

          <SectionCard eyebrow="What’s Missing" title="Highest-Priority Issue">
            {isLoading ? (
              <div className="h-16 rounded-2xl bg-amber-50 animate-pulse" />
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-base leading-7 text-slate-900">
                  {analysis?.top_risk_hint || "No major issue surfaced."}
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard eyebrow="Improve the Answer" title="Deep Reasoning Prompt">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-900">
                {analysis?.deep_reasoning_prompt ||
                  "No improved prompt available."}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    analysis?.deep_reasoning_prompt || ""
                  )
                }
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Copy Prompt
              </button>
            </div>
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

              {answer.length > 700 ? (
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

        <SectionCard eyebrow="Next Step" title="Deep Analysis">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-slate-700">
              This page is intentionally fast and focused. For a full reasoning
              audit with weak assumptions, missing risks, reasoning gaps, and
              failure scenarios, run the deeper inspection next.
            </p>

            <a
              href={`/analyze/deep?question=${encodeURIComponent(
                question
              )}&answer=${encodeURIComponent(answer)}`}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Open Full Audit
            </a>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
