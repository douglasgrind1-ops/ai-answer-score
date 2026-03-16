"use client";

import type {
  ClaimReview,
  CompareResult,
  Level,
  SingleResult,
  WeightedItem,
} from "./types";

function buildImprovedPromptFromQuestion(question: string, result: SingleResult) {
  const assumption =
    result.stress_test.weakest_assumptions?.[0]?.text || "unclear assumptions";
  const risk =
    result.stress_test.missing_risks?.[0]?.text || "missing risks or constraints";
  const gap =
    result.stress_test.reasoning_gaps?.[0]?.text || "insufficient reasoning depth";

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
• use clear criteria and trade-offs
• give a structured, complete answer`;
}

export function SingleAnswerView({
  result,
  question,
}: {
  result: SingleResult;
  question: string;
}) {
  const primaryRisk =
    result.stress_test.missing_risks?.[0]?.text ||
    result.stress_test.weakest_assumptions?.[0]?.text ||
    result.stress_test.reasoning_gaps?.[0]?.text ||
    "No dominant reliability risk identified.";

  const improvedPrompt = buildImprovedPromptFromQuestion(question, result);

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
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
            <InfoCard label="Summary">
              <p className="mt-2 leading-7 text-slate-700">
                {result.stress_test.summary}
              </p>
            </InfoCard>

            <InfoCard
              label="Primary Risk"
              className="border-amber-200 bg-amber-50"
              labelClassName="text-amber-700"
            >
              <p className="mt-2 leading-7 text-slate-700">{primaryRisk}</p>
            </InfoCard>

            <InfoCard
              label="Improved Prompt"
              className="border-indigo-200 bg-indigo-50"
              labelClassName="text-indigo-700"
            >
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                {improvedPrompt}
              </p>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(improvedPrompt)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Copy Prompt
                </button>
              </div>
            </InfoCard>

            <InfoCard label="Reliability Explanation">
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {result.stress_test.reliability_explanation}
              </p>
            </InfoCard>
          </div>
        </div>
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
        <Card title="Optional next question">
          <p className="leading-7 text-slate-700">
            {result.stress_test.best_follow_up_question}
          </p>
        </Card>
      </section>
    </>
  );
}

export function CompareView({ result }: { result: CompareResult }) {
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
            <InfoCard label="Winner rationale">
              <p className="mt-2 leading-7 text-slate-700">
                {result.comparison.winner_rationale}
              </p>
            </InfoCard>

            <InfoCard
              label="Key reasoning difference"
              className="border-indigo-200 bg-indigo-50"
              labelClassName="text-indigo-700"
            >
              <p className="mt-2 leading-7 text-slate-700">
                {result.comparison.key_reasoning_difference ||
                  "No single dominant reasoning difference was identified."}
              </p>
            </InfoCard>

            <InfoCard label="Practical takeaway">
              <p className="mt-2 leading-7 text-slate-700">
                {result.comparison.decision_takeaway}
              </p>
            </InfoCard>
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

function InfoCard({
  label,
  children,
  className = "border-slate-200 bg-slate-50",
  labelClassName = "text-slate-500",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <div
        className={`text-xs font-bold uppercase tracking-[0.14em] ${labelClassName}`}
      >
        {label}
      </div>
      {children}
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
      {items?.length ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="leading-7 text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="leading-7 text-slate-500">
          No additional information returned.
        </p>
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
  return (
    <Card title={title}>
      {items?.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.text}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="leading-7 text-slate-700">{item.text}</p>
              {item.level ? (
                <div className="mt-3">
                  <ImpactBadge level={item.level} />
                </div>
              ) : item.impact ? (
                <div className="mt-3">
                  <ImpactBadge level={item.impact} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="leading-7 text-slate-500">No items returned.</p>
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
              <p className="font-semibold text-slate-900">{item.claim}</p>
              <p className="mt-2 leading-7 text-slate-700">{item.concern}</p>
              {item.severity ? (
                <div className="mt-3">
                  <SeverityBadge level={item.severity} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="leading-7 text-slate-500">No claim-level concerns returned.</p>
      )}
    </Card>
  );
}

function ImpactBadge({ level }: { level: Level }) {
  const styles =
    level === "high"
      ? "bg-red-100 text-red-700"
      : level === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-200 text-slate-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${styles}`}
    >
      {level} impact
    </span>
  );
}

function SeverityBadge({ level }: { level: Level }) {
  const styles =
    level === "high"
      ? "bg-red-100 text-red-700"
      : level === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-200 text-slate-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${styles}`}
    >
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
