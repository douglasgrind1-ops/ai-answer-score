"use client";

import { FormEvent, , useEffect, useState } from "react";
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
import type { CompareResult, Mode, Result, SingleResult } from "@/components/home/types";

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
      reliability_score: Number(raw?.stress_test?.reliability_score ?? 0),
      summary: raw?.stress_test?.summary || "No summary provided.",
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
      answerA: normalizeSingleResult(raw.answerA || raw.answer_a || {}),
      answerB: normalizeSingleResult(raw.answerB || raw.answer_b || {}),
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

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
  
    window.scrollTo(0, 0);
  }, []);
  
function runSampleDemo() {
  const q =
    "Does the ACT provide an objective measure of college readiness?";
  const a =
    "Yes. The ACT provides an objective measure of college readiness because it uses a standardized test format to evaluate all students equally. Since every student takes the same exam under similar conditions, the results offer a fair and reliable indicator of whether a student is prepared for college-level work.";

  setCompare(false);
  setMode("blind_spots");
  setQuestion(q);
  setAnswer(a);
  setAnswerB("");

  setTimeout(() => {
    const form = document.querySelector("#live-demo form") as HTMLFormElement | null;
    form?.requestSubmit();
  }, 50);
}
  
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
        <HeaderNav />
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
