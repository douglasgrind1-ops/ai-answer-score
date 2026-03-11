import AnalyzeClient from "./AnalyzeClient";

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

        <AnalyzeClient question={question} answer={answer} />
      </div>
    </main>
  );
}