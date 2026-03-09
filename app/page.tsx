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
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerB, setAnswerB] = useState('');
  const [mode, setMode] = useState<Mode>('blind_spots');
  const [compare, setCompare] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyze() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer,
          answerB,
          mode,
          compare,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 text-slate-900 md:p-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-blue-300 bg-white/80 px-4 py-1.5 text-sm text-blue-700 shadow-sm backdrop-blur">
            AI answer evaluation
          </div>

          <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <div className="space-y-5">
                <img
                  src="/assets/logo/ai-answer-score-logo.svg"
                  alt="AI Answer Score"
                  className="h-16 w-auto md:h-20"
                />

                <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight text-slate-950 md:text-6xl">
                  A trust score for AI-generated answers
                </h1>

                <p className="max-w-3xl text-xl leading-relaxed text-slate-600">
                  Score answer reliability, inspect the reasoning behind the
                  score, and compare competing responses before you rely on
                  them.
                </p>

                <p className="max-w-2xl text-sm text-slate-500">
                  Built for founders, analysts, researchers, writers, and anyone
                  making decisions with AI-generated output.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#live-demo"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500"
                >
                  Try the live demo
                </a>

                <a
                  href="#how-it-works"
                  className="rounded-xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
                >
                  See how it works
                </a>
              </div>

              <div className="pt-1">
                <img
                  src="/assets/logo/ai-answer-score-badge.svg"
                  alt="AI Answer Score badge"
                  className="h-14 w-auto"
                />
              </div>
            </div>

            <section className="rounded-3xl border border-blue-200 bg-white/85 p-6 shadow-lg backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Example result
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    AI Answer Score
                  </h2>
                </div>

                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Moderately reliable
                </span>
              </div>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-6xl font-bold leading-none text-slate-950">
                  7.2
                </span>
                <span className="pb-2 text-xl font-medium text-slate-500">
                  / 10
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Strong core recommendation, but missing context and weak
                assumptions reduce confidence.
              </p>

              <div className="mt-6 space-y-3">
                <DemoIssue
                  label="Top concern"
                  text="Overgeneralized recommendation without enough domain context."
                />
                <DemoIssue
                  label="Reasoning gap"
                  text="Fails to address when the opposite strategy may be better."
                />
                <DemoIssue
                  label="Best use"
                  text="Useful as a starting point, but worth checking before acting."
                />
              </div>
            </section>
          </section>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm backdrop-blur">
          <div className="grid gap-3 md:grid-cols-4">
            <TrustPill text="Founders" />
            <TrustPill text="Analysts" />
            <TrustPill text="Researchers" />
            <TrustPill text="Writers" />
          </div>
        </section>

        <section className="space-y-5">
          <SectionIntro
            eyebrow="Why it matters"
            title="Evaluate reliability before you trust the output"
            description="AI Answer Score helps you see whether an answer is solid, context-dependent, or missing key reasoning before it influences a decision."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Score answer reliability"
              description="Quickly see whether an AI answer is strong, weak, or highly context-dependent."
              className="border-blue-200 bg-blue-100/70"
            />
            <FeatureCard
              title="Inspect the reasoning"
              description="Uncover assumptions, blind spots, risks, and failure modes behind the answer."
              className="border-indigo-200 bg-indigo-100/70"
            />
            <FeatureCard
              title="Compare competing responses"
              description="Decide which answer is more reliable and when the alternative may actually be better."
              className="border-cyan-200 bg-cyan-100/70"
            />
          </div>
        </section>

        <section id="how-it-works" className="space-y-5">
          <SectionIntro
            eyebrow="How it works"
            title="From pasted answer to reasoning audit"
            description="Drop in a question and one or two LLM answers. Get a trust score, a concise verdict, and a deeper reasoning breakdown."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              step="01"
              title="Paste the question and answer"
              description="Use any answer from ChatGPT, Claude, Gemini, or another LLM."
            />
            <StepCard
              step="02"
              title="Get an instant score"
              description="See a reliability score plus a summary of what the answer gets right or wrong."
            />
            <StepCard
              step="03"
              title="Explore the reasoning"
              description="Open the audit to inspect assumptions, missing risks, and compare two answers side by side."
            />
          </div>
        </section>

        <section
          id="live-demo"
          className="space-y-6 rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur md:p-7"
        >
          <SectionIntro
            eyebrow="Try the live demo"
            title="Paste an AI answer and see how it scores"
            description="Use the evaluator below to inspect a single answer or compare two competing responses."
          />

          <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <input
                id="compare-mode"
                type="checkbox"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="compare-mode"
                className="text-base font-medium text-slate-800"
              >
                Compare two answers
              </label>
            </div>

            <ModeSelector mode={mode} setMode={setMode} />

            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {getModeDescription(mode)}
            </div>
          </section>

          <section
            className={`grid gap-6 ${
              compare ? 'md:grid-cols-3' : 'md:grid-cols-2'
            }`}
          >
            <Card title="Original question">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Paste the original user question here..."
                className="h-56 w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </Card>

            <Card title={compare ? 'LLM answer A' : 'LLM answer'}>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Paste the first LLM response here..."
                className="h-56 w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </Card>

            {compare && (
              <Card title="LLM answer B">
                <textarea
                  value={answerB}
                  onChange={(e) => setAnswerB(e.target.value)}
                  placeholder="Paste the second LLM response here..."
                  className="h-56 w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </Card>
            )}
          </section>

          <div className="flex items-center gap-4">
            <button
              onClick={analyze}
              disabled={
                loading ||
                !question.trim() ||
                !answer.trim() ||
                (compare && !answerB.trim())
              }
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {loading
                ? 'Analyzing...'
                : compare
                ? 'Compare answers'
                : 'Analyze answer'}
            </button>

            {error && <p className="text-red-600">{error}</p>}
          </div>
        </section>

        {result?.type === 'single' && <SingleAnswerView result={result} />}
        {result?.type === 'compare' && <CompareView result={result} />}

        <footer className="space-y-2 pb-4 pt-2 text-center">
          <div className="flex justify-center">
            <img
              src="/assets/logo/ai-answer-score-horizontal.svg"
              alt="AI Answer Score"
              className="h-10 w-auto"
            />
          </div>
          <p className="text-sm text-slate-500">
            Evaluate AI reasoning before you trust the output.
          </p>
        </footer>
      </div>
    </main>
  );
}

function SingleAnswerView({ result }: { result: SingleResult }) {
  return (
    <>
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

      <details className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <summary className="cursor-pointer text-lg font-semibold text-slate-900">
          Show reasoning details
        </summary>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <SimpleListCard
            title="Supporting claims"
            items={result.reconstruction.supporting_claims}
          />
          <SimpleListCard
            title="Assumptions"
            items={result.reconstruction.assumptions}
          />
          <SimpleListCard
            title="Uncertain or context-dependent claims"
            items={result.reconstruction.uncertain_or_context_dependent_claims}
          />
        </div>
      </details>
    </>
  );
}

function CompareView({ result }: { result: CompareResult }) {
  return (
    <>
      <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg md:p-8">
        <h2 className="mb-3 text-xl font-semibold">Final recommendation</h2>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-4xl font-bold">
            Winner:{' '}
            {result.comparison.winner === 'tie'
              ? 'Tie'
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

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Comparison summary">
          <p className="leading-7 text-slate-700">
            {result.comparison.comparison_summary}
          </p>
        </Card>

        <Card title="Answer A score">
          <ScoreDisplay score={result.comparison.answer_a_score} />
        </Card>

        <Card title="Answer B score">
          <ScoreDisplay score={result.comparison.answer_b_score} />
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title={`Answer A (${result.comparison.answer_a_score}/10)`}>
          <p className="mb-3 font-medium text-slate-900">Strengths</p>
          <ul className="list-disc space-y-2 pl-5 text-slate-700">
            {result.comparison.answer_a_strengths.map((item, i) => (
              <li key={`a-s-${i}`}>{item}</li>
            ))}
          </ul>

          <p className="mb-3 mt-5 font-medium text-slate-900">Weaknesses</p>
          <ul className="list-disc space-y-2 pl-5 text-slate-700">
            {result.comparison.answer_a_weaknesses.map((item, i) => (
              <li key={`a-w-${i}`}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card title={`Answer B (${result.comparison.answer_b_score}/10)`}>
          <p className="mb-3 font-medium text-slate-900">Strengths</p>
          <ul className="list-disc space-y-2 pl-5 text-slate-700">
            {result.comparison.answer_b_strengths.map((item, i) => (
              <li key={`b-s-${i}`}>{item}</li>
            ))}
          </ul>

          <p className="mb-3 mt-5 font-medium text-slate-900">Weaknesses</p>
          <ul className="list-disc space-y-2 pl-5 text-slate-700">
            {result.comparison.answer_b_weaknesses.map((item, i) => (
              <li key={`b-w-${i}`}>{item}</li>
            ))}
          </ul>
        </Card>
      </section>

      <details className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <summary className="cursor-pointer text-lg font-semibold text-slate-900">
          Show detailed audits for both answers
        </summary>

        <div className="mt-5 space-y-8">
          <div>
            <h3 className="mb-4 text-xl font-semibold text-slate-900">
              Answer A audit
            </h3>
            <SingleAnswerView result={result.answerA} />
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-slate-900">
              Answer B audit
            </h3>
            <SingleAnswerView result={result.answerB} />
          </div>
        </div>
      </details>
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
      description: 'Find missing context and hidden assumptions.',
      icon: '🔎',
    },
    {
      key: 'risk_review',
      title: 'Risk Review',
      description: 'Identify risks and possible failure scenarios.',
      icon: '⚠️',
    },
    {
      key: 'devils_advocate',
      title: "Devil's Advocate",
      description: 'Challenge the answer with strong counterarguments.',
      icon: '🧠',
    },
    {
      key: 'alternative_strategy',
      title: 'Alternative Strategy',
      description: 'Suggest better or safer ways to solve the problem.',
      icon: '🔁',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Choose how to stress-test the answer
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Analyze the response from different angles depending on what you want
          to learn.
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
