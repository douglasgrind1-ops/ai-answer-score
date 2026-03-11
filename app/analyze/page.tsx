type AnalyzePageProps = {
  searchParams: Promise<{
    question?: string;
    answer?: string;
  }>;
};

type LiteAnalysisResponse = {
  reliability_score?: number;
  label?: string;
  summary?: string;
  top_risk_hint?: string;
  better_prompt?: string;
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

async function getLiteAnalysis(
  question: string,
  answer: string
): Promise<LiteAnalysisResponse | null> {
  if (!question || !answer) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL?.startsWith("http")
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "https://www.aianswerscore.com");

  try {
    const res = await fetch(`${baseUrl}/api/analyze-lite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, answer }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        error: text || "Failed to run analysis.",
      };
    }

    return (await res.json()) as LiteAnalysisResponse;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error while running analysis.",
    };
  }
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

export default async function AnalyzePage({
  searchParams,
}: AnalyzePageProps) {
  const params = await searchParams;
  const question = params.question || "";
  const answer = params.answer || "";

  const analysis = await getLiteAnalysis(question, answer);

  const score =
    typeof analysis?.reliability_score === "number"
      ? analysis.reliability_score
      : null;

  const label =
    score !== null
      ? analysis?.label || scoreToLabel(score)
      : "Unavailable";

  const answerPreview = truncateText(answer, 700);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            AI Trust Layer
          </div>
          <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight">
            <span>✦</span>
            <span>AI Answer Score</span>
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
            A fast analysis of the AI-generated answer, with the highest-priority
            issues surfaced first and a stronger next-step prompt.
          </p>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Score
            </div>
            <div className="flex items-end gap-3">
              <div
                className={`text-6xl font-extrabold tracking-tight ${
                  score !== null ? scoreColorClasses(score) : "text-slate-400"
                }`}
              >
                {score !== null ? score : "—"}
              </div>
              <div className="pb-2">
                <div className="text-lg font-semibold text-slate-500">/10</div>
                <div
                  className={`mt-1 text-sm font-semibold ${
                    score !== null ? scoreColorClasses(score) : "text-slate-500"
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
                {analysis?.summary ||
                  analysis?.error ||
                  "No analysis is available yet."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Better Prompt
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-900">
              {analysis?.better_prompt ||
                "No improved prompt is available yet."}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <SectionCard eyebrow="What’s Missing" title="Highest-Priority Issue">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-base leading-7 text-slate-900">
                {analysis?.top_risk_hint || "No major issue surfaced."}
              </p>
            </div>
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
                Run Deep Analysis
              </a>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}