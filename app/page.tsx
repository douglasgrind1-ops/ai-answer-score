"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

type Mode = "blind_spots" | "reasoning" | "accuracy" | "decision_quality";
type Level = "high" | "medium" | "low";

type WeightedItem = {
  text: string;
  impact?: Level;
  level?: Level;
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

const CHROME_WEB_STORE_URL = "YOUR_CHROME_WEB_STORE_URL";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerB, setAnswerB] = useState("");
  const [mode, setMode] = useState<Mode>("blind_spots");
  const [compare, setCompare] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
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

      const raw = await response.json();

      if (!response.ok) {
        throw new Error(raw?.error || "Something went wrong.");
      }

      setResult(normalizeResult(raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 text-slate-900 md:p-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <TopNav />

        <HeroSection chromeUrl={CHROME_WEB_STORE_URL} />

        <TrustBadgeSection chromeUrl={CHROME_WEB_STORE_URL} />

        <HowItWorksSection />

        <ModelSnapshotSection />

        <InstallSection chromeUrl={CHROME_WEB_STORE_URL} />

        <LiveDemoSection
          question={question}
          setQuestion={setQuestion}
          answer={answer}
          setAnswer={setAnswer}
          answerB={answerB}
          setAnswerB={setAnswerB}
          mode={mode}
          setMode={setMode}
          compare={compare}
          setCompare={setCompare}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />

        {result ? (
          <section className="space-y-6">
            {isCompareResult(result) ? (
              <CompareView result={result} />
            ) : (
              <SingleAnswerView result={result} question={question} />
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function TopNav() {
  return (
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
          <NavLink href="#how-it-works" label="How it works" />
          <NavLink href="#trust-badge" label="Trust badge" />
          <NavLink href="#model-snapshot" label="Model snapshot" />
          <NavLink href="#install-extension" label="Add to Chrome" />
          <NavLink href="#live-demo" label="Live demo" />
        </div>

        <a
          href={CHROME_WEB_STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500"
        >
          Add to Chrome
        </a>
      </nav>
    </div>
  );
}

function HeroSection({ chromeUrl }: { chromeUrl: string }) {
  return (
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
                AI Answer Score inspects reasoning quality, surfaces the primary
                risk, and gives you a stronger follow-up prompt so you can
                improve weak answers instead of guessing.
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
              href={chromeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Add to Chrome
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard
              title="Score"
              accent="text-indigo-600"
              description="Quantifies answer reliability on a simple 0–10 scale."
            />
            <FeatureCard
              title="Primary Risk"
              accent="text-amber-600"
              description="Identifies the highest-impact weakness immediately."
            />
            <FeatureCard
              title="Better Prompt"
              accent="text-emerald-600"
              description="Turns critique into a stronger next-pass instruction."
            />
          </div>
        </div>

        <TrustBadgePreview />
      </section>
    </header>
  );
}

function TrustBadgeSection({ chromeUrl }: { chromeUrl: string }) {
  return (
    <section
      id="trust-badge"
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <SectionIntro
        eyebrow="Trust Badge"
        title="AI Answer Score Trust Badge"
        description="A verification-style badge for AI-generated answers. Show reliability, primary risk, and reasoning quality in a format users instantly understand."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <SimpleListPanel
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
              href={chromeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500"
            >
              Add to Chrome
            </a>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              See how it works
            </a>
          </div>

          <p className="text-sm text-slate-500">
            Works on desktop Chrome. Installation happens through the Chrome Web
            Store.
          </p>
        </div>

        <TrustBadgePreview />
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
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
          accent="bg-blue-50 text-blue-700"
        />
        <StepCard
          step="2. Diagnose"
          title="Surface the main risk"
          description="Identify weak assumptions, missing risks, reasoning gaps, and failure scenarios."
          accent="bg-amber-50 text-amber-700"
        />
        <StepCard
          step="3. Improve"
          title="Generate a stronger prompt"
          description="Turn critique into a better next-pass prompt you can copy, rerun, or use directly in ChatGPT."
          accent="bg-emerald-50 text-emerald-700"
        />
      </div>
    </section>
  );
}

function ModelSnapshotSection() {
  return (
    <section
      id="model-snapshot"
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
          summary="Reliable but incomplete"
        />
        <LeaderboardCard
          name="Claude"
          score="8.6"
          summary="Stronger nuance and structure"
        />
        <LeaderboardCard
          name="Gemini"
          score="6.9"
          summary="Useful but weaker reasoning"
        />
      </div>
    </section>
  );
}

function InstallSection({ chromeUrl }: { chromeUrl: string }) {
  return (
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
          <SimpleListPanel
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
              href={chromeUrl}
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
            Works on desktop Chrome. Installation happens through the Chrome Web
            Store.
          </p>
        </div>

        <TrustBadgePreview />
      </div>
    </section>
  );
}

function LiveDemoSection(props: {
  question: string;
  setQuestion: (value: string) => void;
  answer: string;
  setAnswer: (value: string) => void;
  answerB: string;
  setAnswerB: (value: string) => void;
  mode: Mode;
  setMode: (value: Mode) => void;
  compare: boolean;
  setCompare: (value: boolean) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: FormEvent) => void;
}) {
  const {
    question,
    setQuestion,
    answer,
    setAnswer,
    answerB,
    setAnswerB,
    mode,
    setMode,
    compare,
    setCompare,
    loading,
    error,
    onSubmit,
  } = props;

  return (
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

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <ToggleButton
            active={!compare}
            onClick={() => setCompare(false)}
            label="Single answer"
          />
          <ToggleButton
            active={compare}
            onClick={() => setCompare(true)}
            label="Compare two answers"
          />
        </div>

        <div className="grid gap-6">
          <InputBlock label="Question">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Paste the user question here..."
              className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            />
          </InputBlock>

          <InputBlock label={compare ? "Answer A" : "Answer"}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Paste the first answer here..."
              className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            />
          </InputBlock>

          {compare ? (
            <InputBlock label="Answer B">
              <textarea
                value={answerB}
                onChange={(e) => setAnswerB(e.target.value)}
                placeholder="Paste the second answer here..."
                className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
              />
            </InputBlock>
          ) : null}

          <InputBlock label="Analysis mode">
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
          </InputBlock>
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

        {loading ? <ProgressPanel /> : null}

        <p className="text-sm text-slate-500">{getModeDescription(mode)}</p>
      </form>
    </section>
  );
}

function SingleAnswerView({
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
      <ResultHero
        score={result.stress_test.reliability_score}
        summary={result.stress_test.summary}
        primaryRisk={primaryRisk}
        improvedPrompt={improvedPrompt}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard title="Main conclusion">
          <ResultParagraph text={result.reconstruction.main_conclusion} />
        </InfoCard>

        <InfoCard title="Alternative perspective">
          <ResultParagraph text={result.stress_test.alternative_perspective} />
        </InfoCard>
      </div>

      <InfoCard title="Answer inspection">
        <ClaimReviewList items={result.stress_test.claim_reviews} />
      </InfoCard>

      <div className="grid gap-6 md:grid-cols-2">
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SimpleListCard
          title="Supporting claims"
          items={result.reconstruction.supporting_claims}
        />
        <SimpleListCard
          title="Uncertain or context-dependent claims"
          items={result.reconstruction.uncertain_or_context_dependent_claims}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SimpleListCard
          title="Underlying assumptions"
          items={result.reconstruction.assumptions}
        />
        <InfoCard title="Optional next question">
          <ResultParagraph text={result.stress_test.best_follow_up_question} />
        </InfoCard>
      </div>
    </>
  );
}

function CompareView({ result }: { result: CompareResult }) {
  return (
    <>
      <CompareHero result={result} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AnswerSummaryCard label="Answer A" result={result.answerA} />
        <AnswerSummaryCard label="Answer B" result={result.answerB} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Answer A inspection">
          <ClaimReviewList items={result.answerA.stress_test.claim_reviews} />
        </InfoCard>
        <InfoCard title="Answer B inspection">
          <ClaimReviewList items={result.answerB.stress_test.claim_reviews} />
        </InfoCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A weakest assumptions"
          items={result.answerA.stress_test.weakest_assumptions}
        />
        <WeightedListCard
          title="Answer B weakest assumptions"
          items={result.answerB.stress_test.weakest_assumptions}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A missing risks"
          items={result.answerA.stress_test.missing_risks}
        />
        <WeightedListCard
          title="Answer B missing risks"
          items={result.answerB.stress_test.missing_risks}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A reasoning gaps"
          items={result.answerA.stress_test.reasoning_gaps}
        />
        <WeightedListCard
          title="Answer B reasoning gaps"
          items={result.answerB.stress_test.reasoning_gaps}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeightedListCard
          title="Answer A failure scenarios"
          items={result.answerA.stress_test.failure_scenarios}
        />
        <WeightedListCard
          title="Answer B failure scenarios"
          items={result.answerB.stress_test.failure_scenarios}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Answer A main conclusion">
          <ResultParagraph text={result.answerA.reconstruction.main_conclusion} />
        </InfoCard>
        <InfoCard title="Answer B main conclusion">
          <ResultParagraph text={result.answerB.reconstruction.main_conclusion} />
        </InfoCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Answer A alternative perspective">
          <ResultParagraph
            text={result.answerA.stress_test.alternative_perspective}
          />
        </InfoCard>
        <InfoCard title="Answer B alternative perspective">
          <ResultParagraph
            text={result.answerB.stress_test.alternative_perspective}
          />
        </InfoCard>
      </div>
    </>
  );
}

function ResultHero({
  score,
  summary,
  primaryRisk,
  improvedPrompt,
}: {
  score: number;
  summary: string;
  primaryRisk: string;
  improvedPrompt: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
            ✦ AI Answer Score
          </div>

          <div className="mt-3 flex items-end gap-3">
            <div className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
              {score}
            </div>
            <div className="pb-2">
              <div className="text-lg font-semibold text-slate-500">/10</div>
              <div className="text-sm font-semibold text-slate-600">
                Trust badge
              </div>
            </div>
          </div>

          <div className="mt-5">
            <ReliabilityGuide score={score} />
          </div>
        </div>

        <div className="space-y-4">
          <ResultPanel title="Summary" tone="slate">
            <ResultParagraph text={summary} />
          </ResultPanel>

          <ResultPanel title="Primary Risk" tone="amber">
            <ResultParagraph text={primaryRisk} />
          </ResultPanel>

          <ResultPanel title="Improved Prompt" tone="indigo">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
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
          </ResultPanel>
        </div>
      </div>
    </section>
  );
}

function CompareHero({ result }: { result: CompareResult }) {
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
            <ResultPanel title="Winner rationale" tone="slate">
              <ResultParagraph text={result.comparison.winner_rationale} />
            </ResultPanel>

            <ResultPanel title="Key reasoning difference" tone="indigo">
              <ResultParagraph
                text={
                  result.comparison.key_reasoning_difference ||
                  "No single dominant reasoning difference was identified."
                }
              />
            </ResultPanel>

            <ResultPanel title="Practical takeaway" tone="slate">
              <ResultParagraph text={result.comparison.decision_takeaway} />
            </ResultPanel>
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

        {result.comparison.key_reasoning_difference ? (
          <CompareBluePanel title="Key reasoning difference">
            {result.comparison.key_reasoning_difference}
          </CompareBluePanel>
        ) : null}

        {result.comparison.score_rationale ? (
          <CompareBluePanel title="Score rationale">
            {result.comparison.score_rationale}
          </CompareBluePanel>
        ) : null}

        <CompareBluePanel title="When the other answer may be better">
          {result.comparison.when_other_is_better}
        </CompareBluePanel>

        <CompareBluePanel title="Practical takeaway">
          {result.comparison.decision_takeaway}
        </CompareBluePanel>
      </section>
    </>
  );
}

function AnswerSummaryCard({
  label,
  result,
}: {
  label: string;
  result: SingleResult;
}) {
  return (
    <InfoCard title={`${label} summary`}>
      <ResultParagraph text={result.stress_test.summary} />
      <div className="mt-4">
        <ScoreDisplay score={result.stress_test.reliability_score} />
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        {result.stress_test.reliability_explanation}
      </p>
    </InfoCard>
  );
}

function ResultPanel({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "slate" | "amber" | "indigo";
  children: ReactNode;
}) {
  const styles =
    tone === "amber"
      ? "border-amber-200 bg-amber-50"
      : tone === "indigo"
        ? "border-indigo-200 bg-indigo-50"
        : "border-slate-200 bg-slate-50";

  const heading =
    tone === "amber"
      ? "text-amber-700"
      : tone === "indigo"
        ? "text-indigo-700"
        : "text-slate-500";

  return (
    <div className={`rounded-2xl border p-4 ${styles}`}>
      <div className={`text-xs font-bold uppercase tracking-[0.14em] ${heading}`}>
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function CompareBluePanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-blue-50">{children}</p>
    </div>
  );
}

function ProgressPanel() {
  return (
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
  );
}

function FeatureCard({
  title,
  description,
  accent,
}: {
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className={`text-xs font-bold uppercase tracking-[0.14em] ${accent}`}>
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
    </div>
  );
}

function TrustBadgePreview() {
  return (
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
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  accent,
}: {
  step: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${accent}`}>
        {step}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-sm leading-7 text-slate-700">{description}</p>
    </div>
  );
}

function SimpleListPanel({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
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

function LeaderboardCard({
  name,
  score,
  summary,
}: {
  name: string;
  score: string;
  summary: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-sm font-semibold text-slate-600">{name}</div>
      <div className="mt-2 text-3xl font-extrabold text-indigo-600">{score}</div>
      <div className="mt-1 text-sm text-slate-500">{summary}</div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function InputBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
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
    <InfoCard title={title}>
      {items?.length ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="leading-7 text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="leading-7 text-slate-500">
          No additional information returned.
        </p>
      )}
    </InfoCard>
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
    <InfoCard title={title}>
      {items?.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.text}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="leading-7 text-slate-700">{item.text}</p>
              {item.level || item.impact ? (
                <div className="mt-3">
                  <ImpactBadge level={(item.level || item.impact)!} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="leading-7 text-slate-500">No items returned.</p>
      )}
    </InfoCard>
  );
}

function ClaimReviewList({ items }: { items: ClaimReview[] }) {
  if (!items?.length) {
    return (
      <p className="leading-7 text-slate-500">
        No claim-level concerns returned.
      </p>
    );
  }

  return (
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
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${styles}`}>
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
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${styles}`}>
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

function NavLink({ href, label }: { href: string; label: string }) {
  return <a href={href} className="hover:text-slate-900">{label}</a>;
}

function ResultParagraph({ text }: { text: string }) {
  return <p className="leading-7 text-slate-700">{text}</p>;
}

function DemoIssue({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-700">
      <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></div>
      {text}
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
    <div className="space-y-3">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="max-w-3xl text-lg leading-8 text-slate-600">
        {description}
      </p>
    </div>
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

function buildImprovedPromptFromQuestion(
  question: string,
  result: SingleResult
) {
  const assumption =
    result.stress_test.weakest_assumptions?.[0]?.text || "unclear assumptions";
  const risk =
    result.stress_test.missing_risks?.[0]?.text ||
    "missing risks or constraints";
  const gap =
    result.stress_test.reasoning_gaps?.[0]?.text ||
    "insufficient reasoning depth";

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

function isCompareResult(result: Result): result is CompareResult {
  return "comparison" in result;
}

function normalizeLevel(value: unknown): Level | undefined {
  if (value === "high" || value === "medium" || value === "low") return value;
  return undefined;
}

function normalizeWeightedItems(items: any[] | undefined): WeightedItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    text: typeof item?.text === "string" ? item.text : "No detail provided.",
    impact: normalizeLevel(item?.impact),
    level: normalizeLevel(item?.level),
    weight: typeof item?.weight === "number" ? item.weight : undefined,
  }));
}

function normalizeClaimReviews(items: any[] | undefined): ClaimReview[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    claim: typeof item?.claim === "string" ? item.claim : "Unspecified claim",
    concern:
      typeof item?.concern === "string"
        ? item.concern
        : "No concern provided.",
    severity: normalizeLevel(item?.severity),
  }));
}

function normalizeSingleResult(raw: any): SingleResult {
  return {
    reconstruction: {
      main_conclusion:
        raw?.reconstruction?.main_conclusion || "No main conclusion provided.",
      supporting_claims: Array.isArray(raw?.reconstruction?.supporting_claims)
        ? raw.reconstruction.supporting_claims
        : [],
      assumptions: Array.isArray(raw?.reconstruction?.assumptions)
        ? raw.reconstruction.assumptions
        : [],
      uncertain_or_context_dependent_claims: Array.isArray(
        raw?.reconstruction?.uncertain_or_context_dependent_claims
      )
        ? raw.reconstruction.uncertain_or_context_dependent_claims
        : [],
    },
    stress_test: {
      summary: raw?.stress_test?.summary || "No summary provided.",
      reliability_score: Number(raw?.stress_test?.reliability_score ?? 0),
      reliability_explanation:
        raw?.stress_test?.reliability_explanation ||
        "No reliability explanation provided.",
      best_follow_up_question:
        raw?.stress_test?.best_follow_up_question ||
        "No follow-up question provided.",
      alternative_perspective:
        raw?.stress_test?.alternative_perspective ||
        "No alternative perspective provided.",
      weakest_assumptions: normalizeWeightedItems(
        raw?.stress_test?.weakest_assumptions
      ),
      missing_risks: normalizeWeightedItems(raw?.stress_test?.missing_risks),
      reasoning_gaps: normalizeWeightedItems(raw?.stress_test?.reasoning_gaps),
      failure_scenarios: normalizeWeightedItems(
        raw?.stress_test?.failure_scenarios
      ),
      claim_reviews: normalizeClaimReviews(raw?.stress_test?.claim_reviews),
    },
  };
}

function normalizeResult(raw: any): Result {
  if (raw?.comparison) {
    return {
      comparison: {
        winner: raw.comparison?.winner || "tie",
        winner_rationale:
          raw.comparison?.winner_rationale || "No winner rationale provided.",
        key_reasoning_difference:
          raw.comparison?.key_reasoning_difference || "",
        score_rationale: raw.comparison?.score_rationale || "",
        when_other_is_better:
          raw.comparison?.when_other_is_better ||
          "No alternate use case provided.",
        decision_takeaway:
          raw.comparison?.decision_takeaway || "No practical takeaway provided.",
      },
      answerA: normalizeSingleResult(raw.answerA || raw.answer_a || {}),
      answerB: normalizeSingleResult(raw.answerB || raw.answer_b || {}),
    };
  }

  return normalizeSingleResult(raw);
}
