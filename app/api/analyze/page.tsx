type AnalyzePageProps = {
  searchParams: Promise<{
    question?: string;
    answer?: string;
  }>;
};

export default async function AnalyzePage({ searchParams }: AnalyzePageProps) {
  const params = await searchParams;
  const question = params.question || "";
  const answer = params.answer || "";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            AI trust layer
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            ✦ AI Answer Score
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Full analysis for the AI-generated answer, including verdict,
            missing context, and a stronger follow-up prompt.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Original Question
            </div>
            <p className="text-base leading-7 text-slate-900 whitespace-pre-wrap">
              {question || "No question provided."}
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              AI Answer
            </div>
            <p className="text-base leading-7 text-slate-900 whitespace-pre-wrap">
              {answer || "No answer provided."}
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Full Analysis
            </div>
            <p className="text-base leading-7 text-slate-700">
              This page is now connected. The next step is to run your deep
              analysis here so users can move from the extension’s fast score
              into the full AI Answer Score experience.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
