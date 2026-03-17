"use client";

import { FormEvent } from "react";
import type { Mode } from "./types";

const CHROME_WEB_STORE_URL = "YOUR_CHROME_WEB_STORE_URL";

export function HeaderNav() {
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
          <a href="#how-it-works" className="hover:text-slate-900">
            How it works
          </a>
          <a href="#trust-badge" className="hover:text-slate-900">
            Trust badge
          </a>
          <a href="#model-snapshot" className="hover:text-slate-900">
            Model snapshot
          </a>
         <a href="/#live-demo" className="hover:text-slate-900">
            Live demo
          </a>
          <a href="#install-extension" className="hover:text-slate-900">
            Add to Chrome
          </a>
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

export function HeroSection() {
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
              href={CHROME_WEB_STORE_URL}
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
          
            <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
                Better Prompt
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                Revise the answer with clearer assumptions, missing constraints,
                and stronger reasoning.
              </p>
            </div>
          
            <div className="mt-4 text-sm font-semibold text-indigo-600">
              Analyze reasoning →
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}

export function TrustBadgeSection() {
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
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
              What you get
            </div>

            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <li>✦ AI Answer Score badge inside ChatGPT</li>
              <li>Primary risk surfaced instantly</li>
              <li>Open full audit for deep reasoning analysis</li>
              <li>Generate a stronger follow-up prompt in one click</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={CHROME_WEB_STORE_URL}
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
  );
}

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-3"
    >
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
    </section>
  );
}

export function ModelSnapshotSection() {
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

export function InstallExtensionSection() {
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

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={CHROME_WEB_STORE_URL}
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
    </section>
  );
}

type LiveDemoPanelProps = {
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
};

export function LiveDemoPanel({
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
}: LiveDemoPanelProps) {
  const sampleQuestion =
    "Does the ACT provide an objective measure of college readiness?";

  const sampleAnswer =
    "Yes. The ACT provides an objective measure of college readiness because it uses a standardized test format to evaluate all students equally. Since every student takes the same exam under similar conditions, the results offer a fair and reliable indicator of whether a student is prepared for college-level work.";

  const usingSample =
    !compare &&
    question.trim() === sampleQuestion &&
    answer.trim() === sampleAnswer &&
    !answerB.trim();

  const hasAnyInput =
    question.trim().length > 0 ||
    answer.trim().length > 0 ||
    answerB.trim().length > 0;

  function loadSample() {
    setCompare(false);
    setMode("blind_spots");
    setQuestion(sampleQuestion);
    setAnswer(sampleAnswer);
    setAnswerB("");
  }

  function clearSample() {
    setQuestion("");
    setAnswer("");
    setAnswerB("");
  }

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
          Try a sample analysis or paste your own question and answer to see
          where reasoning is strong, where it breaks down, and how to improve
          it.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
              Suggested demo
            </div>
            <p className="text-sm leading-6 text-slate-700">
              Start with a prefilled example to see the trust score, risks, and
              stronger follow-up prompt instantly.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Start here
            </div>
          
            <button
              type="button"
              onClick={loadSample}
              className="group relative inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              <span>Run sample demo</span>
          
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          
            <p className="text-xs text-slate-500">
              Instantly see scoring, risks, and a stronger prompt
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <ModeButton
            active={!compare}
            onClick={() => setCompare(false)}
            label="Single answer"
          />
          <ModeButton
            active={compare}
            onClick={() => setCompare(true)}
            label="Compare two answers"
          />
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
              className={`min-h-[110px] w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                usingSample
                  ? "border-indigo-300 bg-indigo-50/40 focus:border-indigo-400 focus:bg-white"
                  : "border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white"
              }`}
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
              className={`min-h-[180px] w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                usingSample
                  ? "border-indigo-300 bg-indigo-50/40 focus:border-indigo-400 focus:bg-white"
                  : "border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white"
              }`}
            />
          </div>

          {compare ? (
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
          ) : null}

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
            className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              usingSample
                ? "animate-pulse bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500"
            }`}
          >
            {loading ? "Analyzing..." : usingSample ? "Run demo" : "Run analysis"}
          </button>

          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}
        </div>

        {usingSample ? (
          <p className="text-sm font-medium text-indigo-600">
            This sample is designed to reveal assumptions, missing constraints,
            and reasoning gaps quickly.
          </p>
        ) : null}

        {loading ? (
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
        ) : null}

        <p className="text-sm text-slate-500">{getModeDescription(mode)}</p>
      </form>
    </section>
  );
}
function getModeDescription(mode: Mode) {
  switch (mode) {
    case "blind_spots":
      return "Surface missing assumptions, risks, and overlooked gaps.";
    case "reasoning":
      return "Focus on logic quality, structure, and inferential strength.";
    case "accuracy":
      return "Emphasize factual trustworthiness and uncertainty handling.";
    case "decision_quality":
      return "Inspect whether the answer supports sound decision-making.";
    default:
      return "";
  }
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
    <div className="space-y-3">
      <div
        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${accent}`}
      >
        {step}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-sm leading-7 text-slate-700">{description}</p>
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

function ModeButton({
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

function DemoIssue({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-700">
      <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></div>
      {text}
    </div>
  );
}
