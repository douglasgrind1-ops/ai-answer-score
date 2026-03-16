"use client";

import { useState } from "react";

type Mode = "blind_spots" | "reasoning" | "accuracy" | "decision_quality";
type Level = "high" | "medium" | "low";

type WeightedItem = {
  text: string;
  impact?: Level;
  weight?: number;
};

type ClaimReview = {
  claim: string;
  concern: string;
  severity?: Level;
};

type Reconstruction = {
  main_conclusion: string;
  supporting_claims: string[];
  assumptions: string[];
  uncertain_or_context_dependent_claims: string[];
};

type StressTest = {
  summary: string;
  reliability_score: number;
  reliability_explanation: string;
  best_follow_up_question: string;
  alternative_perspective: string;
  weakest_assumptions: WeightedItem[];
  missing_risks: WeightedItem[];
  reasoning_gaps: WeightedItem[];
  failure_scenarios: WeightedItem[];
  claim_reviews: ClaimReview[];
};

type SingleResult = {
  reconstruction: Reconstruction;
  stress_test: StressTest;
};

type CompareResult = {
  comparison: {
    winner: "A" | "B" | "tie" | string;
    winner_rationale: string;
    key_reasoning_difference?: string;
    score_rationale?: string;
    when_other_is_better: string;
    decision_takeaway: string;
  };
  answerA: SingleResult;
  answerB: SingleResult;
};

type Result = SingleResult | CompareResult;

function isCompareResult(result: Result): result is CompareResult {
  return "comparison" in result;
}

function normalizeSingleResult(raw: any): SingleResult {
  return {
    reconstruction: {
      main_conclusion: raw?.reconstruction?.main_conclusion || "No main conclusion provided.",
      supporting_claims: raw?.reconstruction?.supporting_claims || [],
      assumptions: raw?.reconstruction?.assumptions || [],
      uncertain_or_context_dependent_claims:
        raw?.reconstruction?.uncertain_or_context_dependent_claims || [],
    },
    stress_test: {
      summary: raw?.stress_test?.summary || "No summary provided.",
      reliability_score: Number(raw?.stress_test?.reliability_score ?? 0),
      reliability_explanation:
        raw?.stress_test?.reliability_explanation || "No reliability explanation provided.",
      best_follow_up_question:
        raw?.stress_test?.best_follow_up_question || "No follow-up question provided.",
      alternative_perspective:
        raw?.stress_test?.alternative_perspective || "No alternative perspective provided.",
      weakest_assumptions: raw?.stress_test?.weakest_assumptions || [],
      missing_risks: raw?.stress_test?.missing_risks || [],
      reasoning_gaps: raw?.stress_test?.reasoning_gaps || [],
      failure_scenarios: raw?.stress_test?.failure_scenarios || [],
      claim_reviews: raw?.stress_test?.claim_reviews || [],
    },
  };
}

function normalizeResult(raw: any): Result {
  if (raw?.comparison) {
    const answerA = normalizeSingleResult(raw.answerA || raw.answer_a || {});
    const answerB = normalizeSingleResult(raw.answerB || raw.answer_b || {});

    return {
      comparison: {
        winner: raw.comparison?.winner || "tie",
        winner_rationale: raw.comparison?.winner_rationale || "No winner rationale provided.",
        key_reasoning_difference: raw.comparison?.key_reasoning_difference || "",
        score_rationale: raw.comparison?.score_rationale || "",
        when_other_is_better:
          raw.comparison?.when_other_is_better || "No alternate-use case provided.",
        decision_takeaway:
          raw.comparison?.decision_takeaway || "No practical takeaway provided.",
      },
      answerA,
      answerB,
    };
  }

  return normalizeSingleResult(raw);
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerB, setAnswerB] = useState("");
  const [mode, setMode] = useState<Mode>("blind_spots");
  const [compare, setCompare] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = compare
        ? {
            type: "compare",
            mode,
            question,
            answer_a: answer,
            answer_b: answerB,
          }
        : {
            type: "single",
            mode,
            question,
            answer,
          };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      setResult(normalizeResult(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 text-slate-900 md:p-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="sticky top-4 z-30">
          <nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo/ai-answer-score-mark.svg"
                alt="AI Answer Score"
                className="h-9 w-9"
              />
              <span className="text-sm font-semibold text-slate-900 md:text-base">
                AI Answer Score
              </span>
            </div>

            <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
              <a href="#how-it-works" className="hover:text-slate-900">
                How it works
              </a>
              <a href="#trust-badge" className="hover:text-slate-900">
                Trust badge
              </a>
              <a href="#leaderboard" className="hover:text-slate-900">
                Model snapshot
              </a>
              <a href="#live-demo" className="hover:text-slate-900">
                Live demo
              </a>
              <a href="#install-extension" className="hover:text-slate-900">
                Add to Chrome
              </a>
            </div>

            <a
              href="#install-extension"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500"
            >
              Add to Chrome
            </a>
          </nav>
        </div>

        <header className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-blue-300 bg-white/80 px-4 py-1.5 text-sm text-blue-700 shadow-sm backdrop-blur">
            The trust layer for AI answers
          </div>

          <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <div className="space-y-5">
                <img
                  src="/assets/logo/ai-answer-score-logo.svg"
                  alt="AI Answer Score"
                  className="h-16 w-auto md:h-20"
                />

                <div className="space-y-4">
                  <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                    Know whether an AI answer is actually worth trusting.
                  </h1>

                  <p className="max-w-3xl text-lg leading-8 text-slate-700 md:text-xl">
                    AI Answer Score inspects reasoning quality, surfaces the
                    primary risk, and gives you a stronger follow-up prompt so
                    you can improve weak answers instead of guessing.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="#live-demo"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500"
                >
                  Try the live demo
                </a>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  See how it works
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FeatureCard
                  label="Score"
                  color="indigo"
                  description="Quantifies answer reliability on a simple 0–10 scale."
                />
                <FeatureCard
                  label="Primary Risk"
                  color="amber"
                  description="Identifies the highest-impact weakness immediately."
                />
                <FeatureCard
                  label="Better Prompt"
                  color="emerald"
                  description="Turns critique into a stronger next-pass instruction."
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                    Trust Badge Preview
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-600">
                    What users see at a glance
                  </div>
                </div>
                <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  Live concept
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                  ✦ AI Answer Score
                </div>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-indigo-600">
                  7.8 / 10
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-600">
                  Moderately Reliable
                </div>

                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                    Primary Risk
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    Missing constraints and weak assumptions reduce practical
                    reliability.
                  </p>
                </div>

                <div className="mt-4 text-sm font-semibold text-indigo-600">
                  Analyze reasoning →
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SimpleCard
                  label="Fast view"
                  text="Score, verdict, and top risk in seconds."
                />
                <SimpleCard
                  label="Deep audit"
                  text="Full reasoning inspection and a stronger improved prompt."
                />
              </div>
            </div>
          </section>
        </header>

        <section
          id="trust-badge"
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <SectionIntro
            eyebrow="Trust Badge"
            title="AI Answer Score Trust Badge"
            description="A verification-style badge for AI-generated answers. Show reliability, primary risk, and reasoning quality in a format users instantly understand."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                Example Badge
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                  ✦ AI Answer Score
                </div>
                <div className="mt-2 text-3xl font-extrabold text-indigo-600">
                  7.8 / 10
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-600">
                  Moderately Reliable
                </div>
                <div className="mt-3 text-sm font-medium text-amber-700">
                  Primary Risk: Missing constraints
                </div>
                <div className="mt-3 text-sm font-semibold text-indigo-600">
                  Analyze reasoning →
                </div>
              </div>
            </div>

            <SimpleListCard
              title="Why it matters"
              items={[
                "Gives AI answers a visible trust layer.",
                "Shows users the primary risk immediately.",
                "Links directly into a full reasoning audit.",
                "Can evolve into an embeddable badge for publishers and AI apps.",
              ]}
            />
          </div>
        </section>

        <section
          id="how-it-works"
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <SectionIntro
            eyebrow="How it works"
            title="From answer to audit in seconds"
            description="Score one answer or compare two. Surface the weak spots, then improve the answer with a stronger prompt."
          />

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <StepCard
              step="1. Inspect"
              title="Score the answer"
              description="Evaluate one answer or compare two answers side by side."
            />
            <StepCard
              step="2. Diagnose"
              title="Surface the main risk"
              description="Identify weak assumptions, missing risks, reasoning gaps, and failure scenarios."
            />
            <StepCard
              step="3. Improve"
              title="Generate a stronger prompt"
              description="Turn critique into a better next-pass prompt you can copy, rerun, or use directly in ChatGPT."
            />
          </div>
        </section>

        <section
          id="leaderboard"
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <SectionIntro
            eyebrow="Model snapshot"
            title="Compare reasoning quality across answers"
            description="AI Answer Score helps you see not just which answer is better, but why."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <LeaderboardCard
              name="ChatGPT"
              score="7.8"
              note="Reliable but incomplete"
            />
            <LeaderboardCard
              name="Claude"
              score="8.6"
              note="Stronger nuance and structure"
            />
            <LeaderboardCard
              name="Gemini"
              score="6.9"
              note="Useful but weaker reasoning"
            />
          </div>
        </section>

        <section
          id="install-extension"
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <SectionIntro
            eyebrow="Chrome Extension"
            title="Add AI Answer Score to Chrome"
            description="Install the extension to see AI Answer Score directly inside ChatGPT. Get a live trust badge, the primary risk, and one-click access to a full reasoning audit."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <SimpleListCard
                title="What you get"
                items={[
                  "✦ AI Answer Score badge inside ChatGPT",
                  "Primary risk surfaced instantly",
                  "Open full audit for deep reasoning analysis",
                  "Generate a stronger follow-up prompt in one click",
                ]}
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="YOUR_CHROME_WEB_STORE_URL"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500"
                >
                  Add to Chrome
                </a>

                <a
                  href="/privacy"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Privacy Policy
                </a>
              </div>

              <p className="text-sm text-slate-500">
                Works on desktop Chrome. Installation happens through the Chrome Web Store.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                Extension Preview
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                  ✦ AI Answer Score
                </div>
                <div className="mt-2 text-3xl font-extrabold text-indigo-600">
                  7.8 / 10
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-600">
                  Moderately Reliable
                </div>
                <div className="mt-3 text-sm font-medium text-amber-700">
                  Primary Risk: Missing constraints
                </div>
                <div className="mt-3 text-sm font-semibold text-indigo-600">
                  Analyze reasoning →
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="live-demo"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-6 space-y-3">
            <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
              Live demo
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Score an answer right now
            </h2>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              Paste a question and one or two answers to see where reasoning is
              strong, where it breaks down, and how to improve it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ModeSelector
              compare={compare}
              setCompare={setCompare}
              mode={mode}
              setMode={setMode}
            />

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Paste the user question here..."
                  className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {compare ? "Answer A" : "Answer"}
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Paste the first answer here..."
                  className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </div>

              {compare && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Answer B
                  </label>
                  <textarea
                    value={answerB}
                    onChange={(e) => setAnswerB(e.target.value)}
                    placeholder="Paste the second answer here..."
                    className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Run analysis"}
              </button>

              {error ? (
                <p className="text-sm font-medium text-red-600">{error}</p>
              ) : null}
            </div>

            {loading && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                  AI inspection in progress
                </div>

                <div className="mt-4 space-y-3">
                  <DemoIssue text="Inspecting answer structure" />
                  <DemoIssue text="Evaluating reasoning quality" />
                  <DemoIssue text="Generating trust score" />
                </div>
              </div>
            )}

            <p className="text-sm text-slate-500">
              {getModeDescription(mode)}
            </p>
          </form>
        </section>

        {result ? (
          <section className="space-y-6">
            {isCompareResult(result) ? (
              <CompareView result={result} />
            ) : (
              <SingleAnswerView result={result} />
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function SingleAnswerView({ result }: { result: SingleResult }) {
  const primaryRisk =
    result.stress_test.missing_risks?.[0]?.text ||
    result.stress_test.weakest_assumptions?.[0]?.text ||
    result.stress_test.reasoning_gaps?.[0]?.text ||
    "No dominant reliability risk identified.";

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
              ✦ AI Answer Score
            </div>

            <div className="mt-3 flex items-end gap-3">
              <div className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
                {result.stress_test.reliability_score}
              </div>
              <div className="pb-2">
                <div className="text-lg font-semibold text-slate-500">/10</div>
                <div className="text-sm font-semibold text-slate-600">
                  Trust badge
                </div>
              </div>
            </div>

            <div className="mt-5">
              <ReliabilityGuide score={result.stress_test.reliability_score} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Summary
              </div>
              <p className="mt-2 leading-7 text-slate-700">
                {result.stress_test.summary}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                Primary Risk
              </div>
              <p className="mt-2 leading-7 text-slate-700">{primaryRisk}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Reliability Explanation
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {result.stress_test.reliability_explanation}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Summary">
          <p className="leading-7 text-slate-700">{result.stress_test.summary}</p>
        </Card>

        <Card title="Answer Score">
          <ScoreDisplay score={result.stress_test.reliability_score} />
          <p className="mt-4 text-sm text-slate-600">
            {result.stress_test.reliability_explanation}
          </p>
        </Card>

        <Card title="Best follow-up question">
          <p className="leading-7 text-slate-700">
            {result.stress_test.best_follow_up_question}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Main conclusion">
          <p className="leading-7 text-slate-700">
            {result.reconstruction.main_conclusion}
          </p>
        </Card>

        <Card title="Alternative perspective">
          <p className="leading-7 text-slate-700">
            {result.stress_test.alternative_perspective}
          </p>
        </Card>
      </section>

      <section className="grid gap-6">
        <ClaimReviewCard
          title="Answer inspection"
          items={result.stress_test.claim_reviews}
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <WeightedListCard
          title="Weakest assumptions"
          items={result.stress_test.weakest_assumptions}
        />
        <WeightedListCard
          title="Missing risks"
          items={result.stress_test.missing_risks}
        />
        <WeightedListCard
          title="Reasoning gaps"
          items={result.stress_test.reasoning_gaps}
        />
        <WeightedListCard
          title="Failure scenarios"
          items={result.stress_test.failure_scenarios}
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <SimpleListCard
          title="Supporting claims"
          items={result.reconstruction.supporting_claims}
        />
        <SimpleListCard
          title="Uncertain or context-dependent claims"
          items={result.reconstruction.uncertain_or_context_dependent_claims}
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <SimpleListCard
          title="Underlying assumptions"
          items={result.reconstruction.assumptions}
        />
        <Card title="Recommended next question">
          <p className="leading-7 text-slate-700">
            {result.stress_test.best_follow_up_question}
          </p>
        </Card>
      </section>
    </>
  );
}

function CompareView({ result }: { result: CompareResult }) {
  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
              ✦ AI Answer Score Compare
            </div>

            <div className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              {result.comparison.winner === "tie"
                ? "Tie"
                : `Winner: Answer ${result.comparison.winner}`}
            </div>

            <div className="mt-2 text-sm font-semibold text-slate-600">
              Comparison trust summary
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Winner rationale
              </div>
              <p className="mt-2 leading-7 text-slate-700">
                {result.comparison.winner_rationale}
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
                Key reasoning difference
              </div>
              <p className="mt-2 leading-7 text-slate-700">
                {result.comparison.key_reasoning_difference ||
                  "No single dominant reasoning difference was identified."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Practical takeaway
              </div>
              <p className="mt-2 leading-7 text-slate-700">
                {result.comparison.decision_takeaway}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg md:p-8">
        <h2 className="mb-3 text-xl font-semibold">Final recommendation</h2>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-4xl font-bold">
            Winner:{" "}
            {result.comparison.winner === "tie"
              ? "Tie"
              : `Answer ${result.comparison.winner}`}
          </span>
        </div>

        <p className="mb-4 leading-7 text-blue-50">
          {result.comparison.winner_rationale}
        </p>

        {result.comparison.key_reasoning_difference && (
          <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">
              Key reasoning difference
            </p>
            <p className="mt-1 text-sm leading-6 text-blue-50">
              {result.comparison.key_reasoning_difference}
            </p>
          </div>
        )}

        {result.comparison.score_rationale && (
          <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Score rationale</p>
            <p className="mt-1 text-sm leading-6 text-blue-50">
              {result.comparison.score_rationale}
            </p>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4">
          <p className="text-sm font-semibold text-white">
            When the other answer may be better
          </p>
          <p className="mt-1 text-sm leading-6 text-blue-50">
            {result.comparison.when_other_is_better}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-white/20 bg-white/15 p-4">
          <p className="text-sm font-semibold text-white">Practical takeaway</p>
          <p className="mt-1 text-sm leading-6 text-blue-50">
            {result.comparison.decision_takeaway}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Answer A summary">
          <p className="leading-7 text-slate-700">
            {result.answerA.stress_test.summary}
          </p>
          <div className="mt-4">
            <ScoreDisplay score={result.answerA.stress_test.reliability_score} />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {result.answerA.stress_test.reliability_explanation}
          </p>
        </Card>

        <Card title="Answer B summary">
          <p className="leading-7 text-slate-700">
            {result.answerB.stress_test.summary}
          </p>
          <div className="mt-4">
            <ScoreDisplay score={result.answerB.stress_test.reliability_score} />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {result.answerB.stress_test.reliability_explanation}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ClaimReviewCard
          title="Answer A inspection"
          items={result.answerA.stress_test.claim_reviews}
        />
        <ClaimReviewCard
          title="Answer B inspection"
          items={result.answerB.stress_test.claim_reviews}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A weakest assumptions"
          items={result.answerA.stress_test.weakest_assumptions}
        />
        <WeightedListCard
          title="Answer B weakest assumptions"
          items={result.answerB.stress_test.weakest_assumptions}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A missing risks"
          items={result.answerA.stress_test.missing_risks}
        />
        <WeightedListCard
          title="Answer B missing risks"
          items={result.answerB.stress_test.missing_risks}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A reasoning gaps"
          items={result.answerA.stress_test.reasoning_gaps}
        />
        <WeightedListCard
          title="Answer B reasoning gaps"
          items={result.answerB.stress_test.reasoning_gaps}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A failure scenarios"
          items={result.answerA.stress_test.failure_scenarios}
        />
        <WeightedListCard
          title="Answer B failure scenarios"
          items={result.answerB.stress_test.failure_scenarios}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Answer A main conclusion">
          <p className="leading-7 text-slate-700">
            {result.answerA.reconstruction.main_conclusion}
          </p>
        </Card>

        <Card title="Answer B main conclusion">
          <p className="leading-7 text-slate-700">
            {result.answerB.reconstruction.main_conclusion}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Answer A alternative perspective">
          <p className="leading-7 text-slate-700">
            {result.answerA.stress_test.alternative_perspective}
          </p>
        </Card>

        <Card title="Answer B alternative perspective">
          <p className="leading-7 text-slate-700">
            {result.answerB.stress_test.alternative_perspective}
          </p>
        </Card>
      </section>
    </>
  );
}

function getModeDescription(mode: Mode) {
  switch (mode) {
    case "reasoning":
      return "Reasoning mode focuses on logic, coherence, assumptions, and whether the answer actually supports its conclusion.";
    case "accuracy":
      return "Accuracy mode is best when you want to inspect whether the answer may contain factual errors, unsupported claims, or weak evidence.";
    case "decision_quality":
      return "Decision quality mode evaluates whether the answer helps someone make a sound decision under uncertainty, trade-offs, and risk.";
    default:
      return "Blind spots mode surfaces missing assumptions, overlooked risks, and hidden weaknesses in the answer.";
  }
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold tracking-tight text-slate-900">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FeatureCard({
  label,
  description,
  color,
}: {
  label: string;
  description: string;
  color: "indigo" | "amber" | "emerald";
}) {
  const colorClasses =
    color === "indigo"
      ? "text-indigo-600"
      : color === "amber"
        ? "text-amber-600"
        : "text-emerald-600";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className={`text-xs font-bold uppercase tracking-[0.14em] ${colorClasses}`}>
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
        {step}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-sm leading-7 text-slate-700">{description}</p>
    </div>
  );
}

function ModeSelector({
  compare,
  setCompare,
  mode,
  setMode,
}: {
  compare: boolean;
  setCompare: (value: boolean) => void;
  mode: Mode;
  setMode: (value: Mode) => void;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCompare(false)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            !compare
              ? "bg-indigo-600 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Single answer
        </button>

        <button
          type="button"
          onClick={() => setCompare(true)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            compare
              ? "bg-indigo-600 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Compare two answers
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Analysis mode
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
        >
          <option value="blind_spots">Blind spots</option>
          <option value="reasoning">Reasoning</option>
          <option value="accuracy">Accuracy</option>
          <option value="decision_quality">Decision quality</option>
        </select>
      </div>
    </>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function DemoIssue({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-700">
      <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></div>
      {text}
    </div>
  );
}

function LeaderboardCard({
  name,
  score,
  note,
}: {
  name: string;
  score: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-sm font-semibold text-slate-600">{name}</div>
      <div className="mt-2 text-3xl font-extrabold text-indigo-600">{score}</div>
      <div className="mt-1 text-sm text-slate-500">{note}</div>
    </div>
  );
}

function SimpleCard({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function SimpleListCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </div>
      <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function WeightedListCard({
  title,
  items,
}: {
  title: string;
  items: WeightedItem[];
}) {
  return (
    <Card title={title}>
      {items?.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.text}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="leading-7 text-slate-700">{item.text}</p>
                {item.impact ? <ImpactBadge level={item.impact} /> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-7 text-slate-500">
          No items were returned in this section.
        </p>
      )}
    </Card>
  );
}

function ClaimReviewCard({
  title,
  items,
}: {
  title: string;
  items: ClaimReview[];
}) {
  return (
    <Card title={title}>
      {items?.length ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={`${item.claim}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold leading-7 text-slate-900">
                  {item.claim}
                </p>
                {item.severity ? <SeverityBadge level={item.severity} /> : null}
              </div>
              <p className="mt-2 leading-7 text-slate-700">{item.concern}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-7 text-slate-500">
          No claim-level inspection items were returned.
        </p>
      )}
    </Card>
  );
}

function ImpactBadge({ level }: { level: Level }) {
  const classes =
    level === "high"
      ? "bg-red-100 text-red-700"
      : level === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-200 text-slate-700";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${classes}`}>
      {level} impact
    </span>
  );
}

function SeverityBadge({ level }: { level: Level }) {
  const classes =
    level === "high"
      ? "bg-red-100 text-red-700"
      : level === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-200 text-slate-700";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${classes}`}>
      {level} severity
    </span>
  );
}

function ReliabilityGuide({ score }: { score: number }) {
  const items = [
    {
      label: "9–10",
      title: "Highly reliable",
      description:
        "Strong reasoning, good structure, and relatively few obvious weaknesses.",
      active: score >= 9,
    },
    {
      label: "7–8",
      title: "Strong",
      description:
        "Useful and mostly dependable, but may still miss nuance or constraints.",
      active: score >= 7 && score < 9,
    },
    {
      label: "5–6",
      title: "Moderately reliable",
      description:
        "Directionally helpful, though important gaps or assumptions may remain.",
      active: score >= 5 && score < 7,
    },
    {
      label: "3–4",
      title: "Use caution",
      description:
        "Noticeable reasoning weaknesses or missing risks reduce trustworthiness.",
      active: score >= 3 && score < 5,
    },
    {
      label: "0–2",
      title: "Low reliability",
      description:
        "Weak reasoning or major omissions make the answer hard to trust.",
      active: score < 3,
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        Reliability Guide
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border px-4 py-3 transition ${
              item.active
                ? "border-indigo-200 bg-indigo-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-slate-900">
                {item.title}
              </div>
              <div
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  item.active
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-white text-slate-500"
                }`}
              >
                {item.label}
              </div>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreDisplay({ score }: { score: number }) {
  const colorClass =
    score >= 9
      ? "text-green-600"
      : score >= 7
        ? "text-indigo-600"
        : score >= 5
          ? "text-amber-500"
          : "text-red-500";

  const barClass =
    score >= 9
      ? "bg-green-600"
      : score >= 7
        ? "bg-indigo-600"
        : score >= 5
          ? "bg-amber-500"
          : "bg-red-500";

  const bgClass =
    score >= 9
      ? "from-green-50 to-emerald-50 border-green-200"
      : score >= 7
        ? "from-indigo-50 to-blue-50 border-indigo-200"
        : score >= 5
          ? "from-amber-50 to-yellow-50 border-amber-200"
          : "from-red-50 to-rose-50 border-red-200";

  const label =
    score >= 9
      ? "Highly reliable"
      : score >= 7
        ? "Strong"
        : score >= 5
          ? "Moderately reliable"
          : score >= 3
            ? "Use caution"
            : "Low reliability";

  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br ${bgClass} p-5 shadow-sm`}
    >
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        ✦ AI Answer Score
      </div>

      <div className="mt-3 flex items-end gap-3">
        <div className={`text-5xl font-extrabold tracking-tight ${colorClass}`}>
          {score}
        </div>
        <div className="pb-2">
          <div className="text-lg font-semibold text-slate-500">/10</div>
          <div className="text-sm font-semibold text-slate-600">{label}</div>
        </div>
      </div>

      <div className="mt-4 h-3 w-full rounded-full bg-white/80">
        <div
          className={`h-3 rounded-full ${barClass} transition-all`}
          style={{ width: `${Math.max(0, Math.min(100, score * 10))}%` }}
        />
      </div>
    </div>
  );
}
