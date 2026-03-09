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
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="space-y-6">
  <div className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
    AI reliability scoring
  </div>

  <header className="space-y-4">
  <h1 className="text-5xl font-bold tracking-tight text-slate-900">
    AI Answer Score
  </h1>

  <p className="text-xl text-slate-600 max-w-3xl">
    Instantly evaluate the reliability of AI answers.
  </p>

  <p className="text-sm text-slate-500 max-w-2xl">
    Built for evaluating ChatGPT, Claude, Gemini, and other LLM responses.
  </p>
</header>

  <div className="grid gap-3 md:grid-cols-3">
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Instant score</p>
      <p className="mt-1 text-sm text-slate-600">
        See whether an answer is strong, weak, or context-dependent.
      </p>
    </div>

    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Reasoning audit</p>
      <p className="mt-1 text-sm text-slate-600">
        Inspect assumptions, gaps, risks, and failure scenarios.
      </p>
    </div>

    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Compare answers</p>
      <p className="mt-1 text-sm text-slate-600">
        Decide which answer is more reliable and when the other one may be better.
      </p>
    </div>
  </div>
</header>

        <section className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="compare-mode"
              type="checkbox"
              checked={compare}
              onChange={(e) => setCompare(e.target.checked)}
            />
            <label htmlFor="compare-mode" className="text-sm font-medium">
              Compare two answers
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Review mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="w-full md:w-80 p-3 border rounded-xl bg-white outline-none focus:ring"
            >
              <option value="blind_spots">Blind spots</option>
              <option value="risk_review">Risk review</option>
              <option value="devils_advocate">Devil&apos;s advocate</option>
              <option value="alternative_strategy">Alternative strategy</option>
            </select>

            <p className="text-sm text-slate-600 mt-2">{getModeDescription(mode)}</p>
          </div>
        </section>

        <section className={`grid gap-6 ${compare ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          <Card title="Original question">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Paste the original user question here..."
              className="w-full h-56 p-4 border rounded-xl resize-none outline-none focus:ring bg-white"
            />
          </Card>

          <Card title={compare ? 'LLM answer A' : 'LLM answer'}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Paste the first LLM response here..."
              className="w-full h-56 p-4 border rounded-xl resize-none outline-none focus:ring bg-white"
            />
          </Card>

          {compare && (
            <Card title="LLM answer B">
              <textarea
                value={answerB}
                onChange={(e) => setAnswerB(e.target.value)}
                placeholder="Paste the second LLM response here..."
                className="w-full h-56 p-4 border rounded-xl resize-none outline-none focus:ring bg-white"
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
            className="px-5 py-3 rounded-xl bg-black text-white disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : compare ? 'Compare' : 'Analyze'}
          </button>

          {error && <p className="text-red-600">{error}</p>}
        </div>

        {result?.type === 'single' && <SingleAnswerView result={result} />}

        {result?.type === 'compare' && <CompareView result={result} />}
      </div>
    </main>
  );
}

function SingleAnswerView({ result }: { result: SingleResult }) {
  return (
    <>
      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Summary">
          <p className="text-slate-700">{result.stress_test.summary}</p>
        </Card>

        <Card title="Reliability score">
          <p className="text-4xl font-bold">
            {result.stress_test.reliability_score}
            <span className="text-lg font-medium text-slate-500">/10</span>
          </p>
          <p className="text-sm text-slate-600 mt-3">
            {result.stress_test.reliability_explanation}
          </p>
          <div className="mt-4">
            <ReliabilityGuide score={result.stress_test.reliability_score} />
          </div>
        </Card>

        <Card title="Best follow-up question">
          <p className="text-slate-700">{result.stress_test.best_follow_up_question}</p>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Main conclusion">
          <p className="text-slate-700">{result.reconstruction.main_conclusion}</p>
        </Card>

        <Card title="Alternative perspective">
          <p className="text-slate-700">{result.stress_test.alternative_perspective}</p>
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

      <details className="bg-white border rounded-2xl p-5 shadow-sm">
        <summary className="cursor-pointer text-lg font-semibold">
          Show reasoning details
        </summary>

        <div className="grid gap-6 md:grid-cols-2 mt-5">
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
      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Final recommendation</h2>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold">Winner: {result.comparison.winner}</span>
        </div>

        <p className="text-slate-800 mb-3">{result.comparison.winner_rationale}</p>

        <div className="bg-slate-50 border rounded-xl p-4 mt-3">
          <p className="text-sm font-semibold text-slate-800">
            When the other answer may be better
          </p>
          <p className="text-sm text-slate-700 mt-1">
            {result.comparison.when_other_is_better}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
          <p className="text-sm font-semibold text-blue-900">Practical takeaway</p>
          <p className="text-sm text-blue-800 mt-1">
            {result.comparison.decision_takeaway}
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Comparison summary">
          <p className="text-slate-700">{result.comparison.comparison_summary}</p>
        </Card>

        <Card title="Answer A score">
          <p className="text-4xl font-bold">
            {result.comparison.answer_a_score}
            <span className="text-lg font-medium text-slate-500">/10</span>
          </p>
        </Card>

        <Card title="Answer B score">
          <p className="text-4xl font-bold">
            {result.comparison.answer_b_score}
            <span className="text-lg font-medium text-slate-500">/10</span>
          </p>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title={`Answer A (${result.comparison.answer_a_score}/10)`}>
          <p className="font-medium mb-3">Strengths</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            {result.comparison.answer_a_strengths.map((item, i) => (
              <li key={`a-s-${i}`}>{item}</li>
            ))}
          </ul>

          <p className="font-medium mt-5 mb-3">Weaknesses</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            {result.comparison.answer_a_weaknesses.map((item, i) => (
              <li key={`a-w-${i}`}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card title={`Answer B (${result.comparison.answer_b_score}/10)`}>
          <p className="font-medium mb-3">Strengths</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            {result.comparison.answer_b_strengths.map((item, i) => (
              <li key={`b-s-${i}`}>{item}</li>
            ))}
          </ul>

          <p className="font-medium mt-5 mb-3">Weaknesses</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            {result.comparison.answer_b_weaknesses.map((item, i) => (
              <li key={`b-w-${i}`}>{item}</li>
            ))}
          </ul>
        </Card>
      </section>

      <details className="bg-white border rounded-2xl p-5 shadow-sm">
        <summary className="cursor-pointer text-lg font-semibold">
          Show detailed audits for both answers
        </summary>

        <div className="mt-5 space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Answer A audit</h3>
            <SingleAnswerView result={result.answerA} />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Answer B audit</h3>
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
    <section className="bg-white border rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
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
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
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
              <span className="text-slate-700">{item.text}</span>
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
    <section className="bg-white border rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>

      {sortedItems.length === 0 ? (
        <p className="text-slate-500">No claim-level issues returned.</p>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item, index) => (
            <div
              key={`${item.claim}-${index}`}
              className="rounded-xl border bg-slate-50 p-4"
            >
              <div className="flex items-start gap-3">
                <SeverityBadge level={item.severity} />
                <div>
                  <p className="font-medium text-slate-900">{item.claim}</p>
                  <p className="text-slate-700 mt-1">{item.concern}</p>
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
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-slate-100 text-slate-700 border-slate-200',
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
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-slate-100 text-slate-700 border-slate-200',
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
    <div className="rounded-xl bg-slate-50 border p-3">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </div>
  );
}
