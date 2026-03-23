"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  HeaderNav,
  HeroSection,
  HowItWorksSection,
  InstallExtensionSection,
  LiveDemoPanel,
  ModelSnapshotSection,
  TrustBadgeSection,
} from "@/components/home/MarketingSections";
import { CompareView, SingleAnswerView } from "@/components/home/AnalysisViews";
import type {
  CompareResult,
  Mode,
  Result,
  SingleResult,
} from "@/components/home/types";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerB, setAnswerB] = useState("");
  const [mode, setMode] = useState<Mode>("blind_spots");
  const [compare, setCompare] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }

    window.scrollTo(0, 0);
  }, []);

  async function runSingleAnalysis(q: string, a: string, selectedMode: Mode) {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: q,
        answer: a,
        mode: selectedMode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Failed to analyze answer.");
    }

    return data as SingleResult;
  }

  async function runCompareAnalysis(
    q: string,
    a: string,
    b: string,
    selectedMode: Mode
  ) {
    const response = await fetch("/api/compare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: q,
        answerA: a,
        answerB: b,
        mode: selectedMode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Failed to compare answers.");
    }

    return data as CompareResult;
  }

  async function runAnalysis(
    q: string,
    a: string,
    b: string,
    selectedMode: Mode,
    isCompare: boolean
  ) {
    if (!q.trim()) {
      throw new Error("Please enter a question.");
    }

    if (!a.trim()) {
      throw new Error(isCompare ? "Please enter Answer A." : "Please enter an answer.");
    }

    if (isCompare && !b.trim()) {
      throw new Error("Please enter Answer B.");
    }

    if (isCompare) {
      return await runCompareAnalysis(q.trim(), a.trim(), b.trim(), selectedMode);
    }

    return await runSingleAnalysis(q.trim(), a.trim(), selectedMode);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await runAnalysis(question, answer, answerB, mode, compare);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function runSampleDemo() {
    const sampleQuestion =
      "Does the ACT provide an objective measure of college readiness?";
    const sampleAnswer =
      "Yes. The ACT provides an objective measure of college readiness because it uses a standardized test format to evaluate all students equally. Since every student takes the same exam under similar conditions, the results offer a fair and reliable indicator of whether a student is prepared for college-level work.";

    setCompare(false);
    setMode("blind_spots");
    setQuestion(sampleQuestion);
    setAnswer(sampleAnswer);
    setAnswerB("");
    setError("");
    setResult(null);

    setTimeout(() => {
      const form = document.querySelector(
        "#live-demo form"
      ) as HTMLFormElement | null;

      if (form) {
        form.requestSubmit();
      }
    }, 75);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <HeaderNav />

        <div className="space-y-10 md:space-y-14">
          <HeroSection />
          <TrustBadgeSection />
          <HowItWorksSection />
          <ModelSnapshotSection />
          <InstallExtensionSection />

          <LiveDemoPanel
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
            onRunSampleDemo={runSampleDemo}
          />

          {result ? (
            <section className="space-y-6">
              {"comparison" in result ? (
                <CompareView result={result as CompareResult} />
              ) : (
                <SingleAnswerView
                  result={result as SingleResult}
                  question={question}
                />
              )}
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
