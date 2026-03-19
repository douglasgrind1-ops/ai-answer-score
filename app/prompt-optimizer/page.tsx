"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function PromptBuilderPage() {
  const variant = "prompt_builder";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-10">
        <header className="sticky top-4 z-30 mb-10">
          <nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/assets/logo/ai-answer-score-mark.svg"
                alt="AI Answer Score"
                className="h-9 w-9"
              />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-900 md:text-base">
                  AI Prompt Builder
                </div>
                <div className="text-xs text-slate-500">
                  by AI Answer Score
                </div>
              </div>
            </Link>

            <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
              <a href="#how-it-works" className="hover:text-slate-900">
                How it works
              </a>
              <a href="#examples" className="hover:text-slate-900">
                Examples
              </a>
              <a href="#live-demo" className="hover:text-slate-900">
                Live demo
              </a>
              <a href="#install" className="hover:text-slate-900">
                Add to Chrome
              </a>
            </div>

            <a
              href="#live-demo"
              onClick={() =>
                trackEvent("cta_click", {
                  variant,
                  location: "nav",
                  cta: "build_better_prompt",
                })
              }
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-blue-500"
            >
              Build a better prompt
            </a>
          </nav>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm">
              Turn weak answers into reusable prompts
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
                Build better prompts from weak AI answers instantly.
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-slate-700 md:text-xl">
                AI Prompt Builder takes a weak answer, identifies what is
                missing, and gives you a stronger prompt you can paste back into
                ChatGPT right away.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#live-demo"
                onClick={() =>
                  trackEvent("cta_click", {
                    variant,
                    location: "hero",
                    cta: "build_better_prompt",
                  })
                }
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-blue-500"
              >
                Build a better prompt
              </a>

              <a
                href="#install"
                onClick={() =>
                  trackEvent("cta_click", {
                    variant,
                    location: "hero_secondary",
                    cta: "add_to_chrome",
                  })
                }
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Add to Chrome
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureCard
                eyebrow="Extract gaps"
                text="Find what the answer missed, assumed, or overstated."
              />
              <FeatureCard
                eyebrow="Build prompt"
                text="Turn weak reasoning into a stronger prompt automatically."
              />
              <FeatureCard
                eyebrow="Reuse instantly"
                text="Paste the improved prompt back into ChatGPT and get a better answer."
              />
            </div>
          </div>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                  Prompt Builder Preview
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-600">
                  What users get instantly
                </div>
              </div>

              <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                Live concept
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                Weak AI answer
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                “Yes. The ACT provides an objective measure of college readiness
                because it evaluates all students equally.”
              </p>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                  What’s missing
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Limitations of standardized testing, unsupported fairness
                  claims, and weak reasoning about what “objective” actually
                  means.
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
                  Built prompt
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Revise the answer with clearer assumptions, evidence about ACT
                  predictive validity, limitations of standardized testing, and
                  fairness concerns across student groups.
                </p>
              </div>

              <div className="mt-4 text-sm font-semibold text-indigo-600">
                Copy prompt →
              </div>
            </div>
          </section>
        </section>

        <section
          id="how-it-works"
          className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-8 space-y-3">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
              How it works
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Build a stronger prompt from any weak answer
            </h2>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              Instead of manually rewriting prompts, AI Prompt Builder turns weak
              AI output into a better next-step instruction for you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StepCard
              step="1. Inspect"
              title="Spot what is weak"
              description="Surface missing risks, unsupported claims, and weak assumptions."
              accent="bg-indigo-50 text-indigo-700"
            />
            <StepCard
              step="2. Build"
              title="Generate a better prompt"
              description="Convert critique into a reusable prompt automatically."
              accent="bg-amber-50 text-amber-700"
            />
            <StepCard
              step="3. Reuse"
              title="Get a better answer"
              description="Paste the prompt back into ChatGPT and improve the next response."
              accent="bg-emerald-50 text-emerald-700"
            />
          </div>
        </section>

        <section id="examples" className="mt-16 grid gap-6 lg:grid-cols-3">
          <ExampleCard
            title="Weak assumption"
            original="The answer assumes the test measures all relevant readiness factors."
            improved="Revise the answer by separating academic test performance from broader college readiness factors like writing, persistence, and support systems."
          />
          <ExampleCard
            title="Missing risk"
            original="The answer ignores possible bias across different student groups."
            improved="Revise the answer to address whether ACT scores predict college success consistently across demographic and socioeconomic groups."
          />
          <ExampleCard
            title="Overstated conclusion"
            original="The conclusion is stronger than the evidence provided."
            improved="Rewrite the answer so the conclusion matches the available evidence and clearly states what remains uncertain."
          />
        </section>

        <section
          id="install"
          className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-4">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Chrome extension
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Build better prompts directly inside ChatGPT
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Install the extension to turn weak answers into stronger
                reusable prompts without leaving the conversation.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="#"
                  onClick={() =>
                    trackEvent("cta_click", {
                      variant,
                      location: "install_section",
                      cta: "add_to_chrome",
                    })
                  }
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-blue-500"
                >
                  Add to Chrome
                </a>

                <Link
                  href="/privacy"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                Extension preview
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                  Built prompt
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Revise this answer with clearer assumptions, explicit
                  limitations, missing risks, and evidence that matches the
                  strength of the conclusion.
                </p>
                <div className="mt-4 text-sm font-semibold text-indigo-600">
                  Copy prompt →
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="live-demo"
          className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-8 space-y-3">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Live demo
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Try the prompt builder on a sample answer
            </h2>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              Start with a sample or use your own answer to see how the prompt
              gets built.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <DemoCard
              title="Sample question"
              text="Does the ACT provide an objective measure of college readiness?"
            />
            <DemoCard
              title="Built prompt"
              text="Revise the answer with clearer assumptions, limitations of standardized testing, and evidence about fairness and predictive validity across student groups."
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="/#live-demo"
              onClick={() =>
                trackEvent("cta_click", {
                  variant,
                  location: "live_demo",
                  cta: "try_live_demo",
                })
              }
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-blue-500"
            >
              Try the live demo
            </a>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              See the full AI Answer Score site
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  eyebrow,
  text,
}: {
  eyebrow: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
        {eyebrow}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
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

function ExampleCard({
  title,
  original,
  improved,
}: {
  title: string;
  original: string;
  improved: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </div>

      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
          Weak answer
        </div>
        <p className="mt-2 text-sm leading-7 text-slate-700">{original}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
          Better prompt
        </div>
        <p className="mt-2 text-sm leading-7 text-slate-700">{improved}</p>
      </div>
    </div>
  );
}

function DemoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-700">{text}</p>
    </div>
  );
}
