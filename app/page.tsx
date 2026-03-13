'use client';

import { useState } from 'react';

type Mode =
  | 'blind_spots'
  | 'risk_review'
  | 'devils_advocate'
  | 'alternative_strategy';

type WeightedItem = {
  text: string;
  impact: 'high' | 'medium' | 'low';
};

type ClaimReview = {
  claim: string;
  concern: string;
  severity: 'high' | 'medium' | 'low';
};

type SingleResult = {
  type: 'single';
  reconstruction: {
    main_conclusion: string;
    supporting_claims: string[];
    assumptions: string[];
    uncertain_or_context_dependent_claims: string[];
  };
  stress_test: {
    weakest_assumptions: WeightedItem[];
    missing_risks: WeightedItem[];
    reasoning_gaps: WeightedItem[];
    failure_scenarios: WeightedItem[];
    alternative_perspective: string;
    best_follow_up_question: string;
    summary: string;
    reliability_score: number;
    reliability_explanation: string;
    claim_reviews: ClaimReview[];
  };
};

type CompareResult = {
  type: 'compare';
  answerA: SingleResult;
  answerB: SingleResult;
  comparison: {
    winner: 'A' | 'B' | 'tie';
    winner_rationale: string;
    key_reasoning_difference?: string;
    score_rationale?: string;
    when_other_is_better: string;
    decision_takeaway: string;
    comparison_summary: string;
    answer_a_score: number;
    answer_b_score: number;
    answer_a_strengths: string[];
    answer_b_strengths: string[];
    answer_a_weaknesses: string[];
    answer_b_weaknesses: string[];
  };
};

type Result = SingleResult | CompareResult;

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

      setResult(data);
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
            </div>

            <a
              href="#live-demo"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500"
            >
              Try demo
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
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                    Score
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Quantifies answer reliability on a simple 0–10 scale.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-amber-600">
                    Primary Risk
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Identifies the highest-impact weakness immediately.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
                    Better Prompt
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Turns critique into a stronger next-pass instruction.
                  </p>
                </div>
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
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Fast view
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Score, verdict, and top risk in seconds.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Deep audit
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Full reasoning inspection and a stronger improved prompt.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </header>

        <section
          id="trust-badge"
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Trust Badge
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            AI Answer Score Trust Badge
          </h2>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
            A verification-style badge for AI-generated answers. Show reliability,
            primary risk, and reasoning quality in a format users instantly
            understand.
          </p>

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

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Why it matters
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <li>Gives AI answers a visible trust layer.</li>
                <li>Shows users the primary risk immediately.</li>
                <li>Links directly into a full reasoning audit.</li>
                <li>
                  Can evolve into an embeddable badge for publishers and AI apps.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-3"
        >
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
              1. Inspect
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Score the answer
            </h3>
            <p className="text-sm leading-7 text-slate-700">
              Evaluate one answer or compare two answers side by side.
            </p>
          </div>

          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
              2. Diagnose
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Surface the main risk
            </h3>
            <p className="text-sm leading-7 text-slate-700">
              Identify weak assumptions, missing risks, reasoning gaps, and
              failure scenarios.
            </p>
          </div>

          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              3. Improve
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Generate a stronger prompt
            </h3>
            <p className="text-sm leading-7 text-slate-700">
              Turn critique into a better next-pass prompt you can copy, rerun,
              or use directly in ChatGPT.
            </p>
          </div>
        </section>

        <section
          id="leaderboard"
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Model snapshot
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Compare reasoning quality across answers
          </h2>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
            AI Answer Score helps you see not just which answer is better, but
            why.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-600">ChatGPT</div>
              <div className="mt-2 text-3xl font-extrabold text-indigo-600">
                7.8
              </div>
              <div className="mt-1 text-sm text-slate-500">Reliable but incomplete</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-600">Claude</div>
              <div className="mt-2 text-3xl font-extrabold text-indigo-600">
                8.6
              </div>
              <div className="mt-1 text-sm text-slate-500">Stronger nuance and structure</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-600">Gemini</div>
              <div className="mt-2 text-3xl font-extrabold text-indigo-600">
                6.9
              </div>
              <div className="mt-1 text-sm text-slate-500">Useful but weaker reasoning</div>
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
          </form>
        </section>

        {result ? (
          <section className="space-y-6">
            {"comparison" in result ? (
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

        <Card title="AnswerScore">
          <ScoreDisplay score={result.stress_test.reliability_score} />
          <p className="mt-4 text-sm text-slate-600">
            {result.stress_test.reliability_explanation}
          </p>
          <div className="mt-4">
            <ReliabilityGuide score={result.stress_test.reliability_score} />
          </div>
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
        <Card title="Supporting claims">
          <ul className="space-y-3">
            {result.reconstruction.supporting_claims.map((claim, index) => (
              <li key={index} className="leading-7 text-slate-700">
                {claim}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Uncertain or context-dependent claims">
          <ul className="space-y-3">
            {result.reconstruction.uncertain_or_context_dependent_claims.map(
              (claim, index) => (
                <li key={index} className="leading-7 text-slate-700">
                  {claim}
                </li>
              )
            )}
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Underlying assumptions">
          <ul className="space-y-3">
            {result.reconstruction.assumptions.map((assumption, index) => (
              <li key={index} className="leading-7 text-slate-700">
                {assumption}
              </li>
            ))}
          </ul>
        </Card>

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
            {result.answer_a.stress_test.summary}
          </p>
          <div className="mt-4">
            <ScoreDisplay score={result.answer_a.stress_test.reliability_score} />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {result.answer_a.stress_test.reliability_explanation}
          </p>
        </Card>

        <Card title="Answer B summary">
          <p className="leading-7 text-slate-700">
            {result.answer_b.stress_test.summary}
          </p>
          <div className="mt-4">
            <ScoreDisplay score={result.answer_b.stress_test.reliability_score} />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {result.answer_b.stress_test.reliability_explanation}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ClaimReviewCard
          title="Answer A inspection"
          items={result.answer_a.stress_test.claim_reviews}
        />
        <ClaimReviewCard
          title="Answer B inspection"
          items={result.answer_b.stress_test.claim_reviews}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A weakest assumptions"
          items={result.answer_a.stress_test.weakest_assumptions}
        />
        <WeightedListCard
          title="Answer B weakest assumptions"
          items={result.answer_b.stress_test.weakest_assumptions}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A missing risks"
          items={result.answer_a.stress_test.missing_risks}
        />
        <WeightedListCard
          title="Answer B missing risks"
          items={result.answer_b.stress_test.missing_risks}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A reasoning gaps"
          items={result.answer_a.stress_test.reasoning_gaps}
        />
        <WeightedListCard
          title="Answer B reasoning gaps"
          items={result.answer_b.stress_test.reasoning_gaps}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A failure scenarios"
          items={result.answer_a.stress_test.failure_scenarios}
        />
        <WeightedListCard
          title="Answer B failure scenarios"
          items={result.answer_b.stress_test.failure_scenarios}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Answer A main conclusion">
          <p className="leading-7 text-slate-700">
            {result.answer_a.reconstruction.main_conclusion}
          </p>
        </Card>

        <Card title="Answer B main conclusion">
          <p className="leading-7 text-slate-700">
            {result.answer_b.reconstruction.main_conclusion}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Answer A alternative perspective">
          <p className="leading-7 text-slate-700">
            {result.answer_a.stress_test.alternative_perspective}
          </p>
        </Card>

        <Card title="Answer B alternative perspective">
          <p className="leading-7 text-slate-700">
            {result.answer_b.stress_test.alternative_perspective}
          </p>
        </Card>
      </section>
    </>
  );
}

function getModeDescription(mode: Mode) {
  switch (mode) {
    case 'blind_spots':
      return 'Highlights what the answer overlooked, what context is missing, and what assumptions may be hidden.';
    case 'risk_review':
      return 'Focuses on downside, execution risk, adoption friction, and failure modes.';
    case 'devils_advocate':
      return 'Makes the strongest fair case against the answer’s recommendation without forcing fake disagreement.';
    case 'alternative_strategy':
      return 'Looks for a better plan, different sequencing, or a lower-risk way to achieve the same goal.';
    default:
      return '';
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
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function FeatureCard({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm ${
        className ?? 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
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
    <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur">
      <p className="text-sm font-semibold text-blue-700">{step}</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function ModeSelector({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const modes = [
    {
      key: 'blind_spots',
      title: 'Blind Spot Finder',
      description: 'Find missing context and hidden assumptions in the AI’s reasoning.',
      icon: '🔎',
    },
    {
      key: 'risk_review',
      title: 'Risk Review',
      description: 'Identify risks, edge cases, and failure scenarios the AI may have ignored.',
      icon: '⚠️',
    },
    {
      key: 'devils_advocate',
      title: "Devil's Advocate",
      description: "Generate strong counterarguments that challenge the AI's conclusion.",
      icon: '🧠',
    },
    {
      key: 'alternative_strategy',
      title: 'Alternative Strategy',
      description: 'Suggest better or safer approaches the AI may have overlooked.',
      icon: '🔁',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Choose how to evaluate the AI answer
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Analyze the response from different angles to uncover reasoning gaps and risks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modes.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key as Mode)}
            className={`rounded-2xl border p-4 text-left transition ${
              mode === m.key
                ? 'border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-100'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
            }`}
          >
            <div className="text-lg">{m.icon}</div>

            <p className="mt-3 font-semibold text-slate-900">{m.title}</p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {m.description}
            </p>
          </button>
        ))}
      </div>
    </div>
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
    <div className="space-y-2">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-blue-700">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="max-w-3xl leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function TrustPill({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm">
      {text}
    </div>
  );
}

function DemoIssue({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function LeaderboardCard({
  rank,
  model,
  score,
  note,
  accent,
}: {
  rank: string;
  model: string;
  score: string;
  note: string;
  accent: string;
}) {
  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${accent}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {rank}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{model}</h3>
        <span className="text-3xl font-bold text-slate-950">{score}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
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
    <Card title={title}>
      {items.length === 0 ? (
        <p className="text-slate-500">No items returned.</p>
      ) : (
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function WeightedListCard({
  title,
  items,
}: {
  title: string;
  items: WeightedItem[];
}) {
  const sortedItems = [...items].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.impact] - rank[b.impact];
  });

  return (
    <Card title={title}>
      {sortedItems.length === 0 ? (
        <p className="text-slate-500">No items returned.</p>
      ) : (
        <ul className="space-y-3">
          {sortedItems.map((item, index) => (
            <li key={`${title}-${index}`} className="flex items-start gap-3">
              <ImpactBadge level={item.impact} />
              <span className="leading-7 text-slate-700">{item.text}</span>
            </li>
          ))}
        </ul>
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
  const sortedItems = [...items].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.severity] - rank[b.severity];
  });

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>

      {sortedItems.length === 0 ? (
        <p className="text-slate-500">No claim-level issues returned.</p>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item, index) => (
            <div
              key={`${item.claim}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="flex items-start gap-3">
                <SeverityBadge level={item.severity} />
                <div>
                  <p className="font-medium text-slate-900">{item.claim}</p>
                  <p className="mt-1 leading-7 text-slate-700">
                    {item.concern}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ImpactBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'border-red-200 bg-red-100 text-red-700',
    medium: 'border-amber-200 bg-amber-100 text-amber-700',
    low: 'border-slate-200 bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[level]}`}
    >
      {level}
    </span>
  );
}

function SeverityBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'border-red-200 bg-red-100 text-red-700',
    medium: 'border-amber-200 bg-amber-100 text-amber-700',
    low: 'border-slate-200 bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[level]}`}
    >
      {level}
    </span>
  );
}

function ReliabilityGuide({ score }: { score: number }) {
  let label = 'Mixed';
  let description =
    'Some parts may be useful, but the answer likely has important gaps or weak assumptions.';

  if (score <= 3) {
    label = 'Low reliability';
    description =
      'The answer likely has major weaknesses, missing context, or unsupported conclusions.';
  } else if (score <= 5) {
    label = 'Caution';
    description =
      'The answer may be directionally useful, but important risks or missing considerations reduce trust.';
  } else if (score <= 7) {
    label = 'Moderate reliability';
    description =
      'The answer is reasonably useful, but still has caveats worth checking before acting on it.';
  } else if (score <= 8) {
    label = 'Strong';
    description =
      'The answer appears fairly solid, though it may still benefit from validation or added context.';
  } else {
    label = 'Very strong';
    description =
      'The answer appears well-reasoned and reliable, with relatively minor weaknesses.';
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <p className="text-sm font-semibold text-blue-900">{label}</p>
      <p className="mt-1 text-sm leading-6 text-blue-800">{description}</p>
    </div>
  );
}

function ScoreDisplay({ score }: { score: number }) {
  const color =
    score >= 8
      ? 'border-green-100 bg-green-50 text-green-700'
      : score >= 5
      ? 'border-blue-100 bg-blue-50 text-blue-700'
      : 'border-red-100 bg-red-50 text-red-700';

  return (
    <div
      className={`inline-flex items-end gap-2 rounded-2xl border px-4 py-3 ${color}`}
    >
      <span className="text-5xl font-bold leading-none">{score}</span>
      <span className="pb-1 text-lg font-medium">/10</span>
    </div>
  );
}
