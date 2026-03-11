type AnalyzePageProps = {
  searchParams: Promise<{
    question?: string;
    answer?: string;
  }>;
};

type FullAnalysisResponse = {
  stress_test?: {
    reliability_score?: number;
    summary?: string;
    reliability_explanation?: string;
    best_follow_up_question?: string;
    weakest_assumptions?: Array<{
      text: string;
      impact?: string;
    }>;
    missing_risks?: Array<{
      text: string;
      impact?: string;
    }>;
    reasoning_gaps?: Array<{
      text: string;
      impact?: string;
    }>;
    failure_scenarios?: Array<{
      text: string;
      impact?: string;
    }>;
    alternative_perspective?: string;
  };
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

async function getFullAnalysis(
  question: string,
  answer: string
): Promise<FullAnalysisResponse | null> {
  if (!question || !answer) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.startsWith("http")
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://www.aianswerscore.com";

  try {
    const res = await fetch(`${baseUrl}/api/analyze`, {
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
        error: text || "Failed to run full analysis.",
      };
    }

    return (await res.json()) as FullAnalysisResponse;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error while running full analysis.",
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

function BulletList({
  items,
}: {
  items: Array<{ text: string; impact?: string }> | undefined;
}) {
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

export default async function AnalyzePage({
  searchParams,
}: AnalyzePageProps) {
  const params = await searchParams;
  const question = params.question || "";
  const answer = params.answer || "";

  const analysis = await getFullAnalysis(question, answer);
  const stressTest = analysis?.stress_test;

  const score =
    typeof stressTest?.reliability_score === "number"
      ? stressTest.reliability_score
      : null;

  const label = score !== null ? scoreToLabel(score) : "Unavailable";

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
            Full analysis for the AI-generated answer, including verdict,
            missing context, stronger prompting, and deeper reasoning gaps.
          </p>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Score
            </div>
            <div className="flex items-end gap-3">
              <div
                className={`text-6xl font-extrabold tracking-tight ${score !== null ? scoreColorClasses(score) : "text-slate-400"}`}
              >
                {score !== null ? score : "—"}
              </div>
              <div className="pb-2">
                <div className="text-lg font-semibold text-slate-500">/10</div>
                <div
                  className={`mt-1 text-sm font-semibold ${score !== null ? scoreColorClasses(score) : "text-slate-500"}`}
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
                {stressTest?.summary ||
                  analysis?.error ||
                  "No full analysis is available yet."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Better Prompt
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-900">
              {stressTest?.best_follow_up_question ||
                "No improved prompt is available yet."}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <SectionCard eyebrow="Original Question" title="Question">
            <p className="whitespace-pre-wrap text-base leading-8 text-slate-900">
              {question || "No question provided."}
            </p>
          </SectionCard>

          <SectionCard eyebrow="AI Answer" title="Answer">
            <p className="whitespace-pre-wrap text-base leading-8 text-slate-900">
              {answer || "No answer provided."}
            </p>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard eyebrow="What’s Missing" title="Weak Assumptions">
              <BulletList items={stressTest?.weakest_assumptions} />
            </SectionCard>

            <SectionCard eyebrow="What’s Missing" title="Missing Risks">
              <BulletList items={stressTest?.missing_risks} />
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard eyebrow="Deep Analysis" title="Reasoning Gaps">
              <BulletList items={stressTest?.reasoning_gaps} />
            </SectionCard>

            <SectionCard eyebrow="Deep Analysis" title="Failure Scenarios">
              <BulletList items={stressTest?.failure_scenarios} />
            </SectionCard>
          </div>

          <SectionCard eyebrow="Alternative Perspective" title="Another Angle">
            <p className="whitespace-pre-wrap text-base leading-8 text-slate-900">
              {stressTest?.alternative_perspective ||
                stressTest?.reliability_explanation ||
                "No alternative perspective was returned."}
            </p>
          </SectionCard>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
    <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
    Debug Response
  </div>
  <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-700">
    {JSON.stringify(analysis, null, 2)}
  </pre>
  </section>
        
      </div>
    </main>
  );
}
