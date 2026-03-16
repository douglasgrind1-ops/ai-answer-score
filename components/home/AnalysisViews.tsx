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

