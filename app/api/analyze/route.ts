import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Mode =
  | "blind_spots"
  | "risk_review"
  | "devils_advocate"
  | "alternative_strategy";

type WeightedItem = {
  text: string;
  impact: "high" | "medium" | "low";
};

type ClaimReview = {
  claim: string;
  concern: string;
  severity: "high" | "medium" | "low";
};

type Reconstruction = {
  main_conclusion: string;
  supporting_claims: string[];
  assumptions: string[];
  uncertain_or_context_dependent_claims: string[];
};

type Critique = {
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

function getModeInstructions(mode: Mode) {
  switch (mode) {
    case "blind_spots":
      return `
Prioritize what the answer overlooked.
Focus on missing context, hidden assumptions, and blind spots.
`;
    case "risk_review":
      return `
Focus on real-world downside and execution risk.

Prioritize:
- wasted engineering effort
- delayed market learning
- adoption friction
- runway burn
- competitive disadvantage
- operational complexity

Avoid generic critiques about missing ideas.
Instead describe how the recommendation could realistically fail in practice.
`;
    case "devils_advocate":
      return `
Argue against the answer's recommendation as if you were debating it.

Focus on why the recommendation itself may be flawed or inferior.

Prioritize:
- strong counterarguments
- evidence or well-known frameworks that contradict the claim
- cases where the opposite strategy works better

Do not simply list missing considerations.
Instead construct the strongest reasonable argument against the answer's conclusion.
`;
    case "alternative_strategy":
      return `
Propose a better strategy than the one suggested in the answer.

Provide a lower-risk or faster-learning path that could outperform the original recommendation.
Focus on sequencing, MVP design, and practical execution.
`;
    default:
      return "";
  }
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function reconstructAnswer(question: string, answer: string) {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are an AI reasoning reconstruction assistant.

Your job is to extract the logical structure of an AI answer.

Return ONLY valid JSON.
Do not include markdown or code fences.

User question:
${question}

AI answer:
${answer}

Return exactly this structure:
{
  "main_conclusion": "string",
  "supporting_claims": ["string"],
  "assumptions": ["string"],
  "uncertain_or_context_dependent_claims": ["string"]
}
`,
  });

  const text = response.output_text?.trim();
  if (!text) throw new Error("Empty reconstruction response");

  const parsed = safeJsonParse<Reconstruction>(text);
  if (!parsed) {
    throw new Error(`Reconstruction invalid JSON: ${text}`);
  }

  return parsed;
}

async function critiqueAnswer(
  question: string,
  answer: string,
  reconstruction: Reconstruction,
  mode: Mode
) {
  const modeInstructions = getModeInstructions(mode);

  const pass2Response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are an AI answer auditor.

You are given:
1. The original question
2. The AI answer
3. A reconstructed reasoning map

Your job is NOT to disagree automatically.
You must critique the reasoning fairly and specifically.

Every critique MUST reference one of these:
- a supporting claim
- an assumption
- a missing step in the reasoning

When writing a critique bullet:
1. Identify the specific claim or assumption
2. Explain why it may be weak or incomplete
3. Describe how that weakness could change the conclusion

Do NOT produce generic criticism.
Each bullet must clearly reference a specific element of the reasoning reconstruction.

Prioritize critiques that could change the decision outcome.

Also perform a counterfactual stress test.

Select the 1–2 most important assumptions from the reasoning reconstruction.
For each one, briefly describe a realistic scenario where that assumption is false and explain how the conclusion would change.

${modeInstructions}

For each critique bullet assign an impact level:
high = could invalidate the recommendation
medium = meaningful weakness or missing factor
low = minor improvement or edge case

Important scoring rule:

Evaluate the core recommendation before considering limitations.

Do not penalize answers simply for having caveats, nuance, or missing detail.

Use these guidelines:

9–10 = Strong reasoning aligned with established practice
7–8 = Good advice with minor caveats
5–6 = Partially reliable or context dependent
3–4 = Weak reasoning or significant gaps
1–2 = Incorrect or misleading advice

Return ONLY valid JSON.
Do not include markdown or code fences.

User question:
${question}

AI answer:
${answer}

Reasoning reconstruction:
${JSON.stringify(reconstruction, null, 2)}

Return exactly this shape:
{
  "weakest_assumptions": [
    {"text": "string", "impact": "high|medium|low"}
  ],
  "missing_risks": [
    {"text": "string", "impact": "high|medium|low"}
  ],
  "reasoning_gaps": [
    {"text": "string", "impact": "high|medium|low"}
  ],
  "failure_scenarios": [
    {"text": "string", "impact": "high|medium|low"}
  ],
  "alternative_perspective": "string",
  "best_follow_up_question": "string",
  "summary": "string",
  "reliability_score": 1,
  "reliability_explanation": "string",
  "claim_reviews": [
    {
      "claim": "string",
      "concern": "string",
      "severity": "high|medium|low"
    }
  ]
}
`,
  });

  const pass2Text = pass2Response.output_text?.trim();
  if (!pass2Text) throw new Error("Empty critique response");

  const pass2 = safeJsonParse<Critique>(pass2Text);
  if (!pass2) {
    throw new Error(`Critique invalid JSON: ${pass2Text}`);
  }

  const pass3Response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are reviewing an AI-generated critique for fairness and quality.

Your job is to refine the critique itself.

Check for:
- overstatement
- unfair criticism
- weak or generic objections
- duplicated points
- reliability scoring that is too harsh or too generous

Keep the strongest points.
Rewrite weak points so they are sharper and fairer.
Remove low-value repetition.
Adjust the reliability score only if the critique overreached or missed nuance.

Important scoring rule:

Evaluate the core recommendation before considering limitations.

Do not penalize answers simply for having caveats, nuance, or missing detail.

Use these guidelines:

9–10 = Strong reasoning aligned with established practice
7–8 = Good advice with minor caveats
5–6 = Partially reliable or context dependent
3–4 = Weak reasoning or significant gaps
1–2 = Incorrect or misleading advice

Return ONLY valid JSON.
Do not include markdown or code fences.

Original user question:
${question}

Original AI answer:
${answer}

Reasoning reconstruction:
${JSON.stringify(reconstruction, null, 2)}

Initial critique:
${JSON.stringify(pass2, null, 2)}

Also review the supporting claims individually.

For the 2 to 4 most important supporting claims, return:
- the claim
- the main concern or limitation
- a severity level: high, medium, or low

Only include claims where the concern meaningfully affects the conclusion.

Return exactly this shape:
{
  "weakest_assumptions": [
    {"text": "string", "impact": "high|medium|low"}
  ],
  "missing_risks": [
    {"text": "string", "impact": "high|medium|low"}
  ],
  "reasoning_gaps": [
    {"text": "string", "impact": "high|medium|low"}
  ],
  "failure_scenarios": [
    {"text": "string", "impact": "high|medium|low"}
  ],
  "alternative_perspective": "string",
  "best_follow_up_question": "string",
  "summary": "string",
  "reliability_score": 1,
  "reliability_explanation": "string",
  "claim_reviews": [
    {
      "claim": "string",
      "concern": "string",
      "severity": "high|medium|low"
    }
  ]
}
`,
  });

  const pass3Text = pass3Response.output_text?.trim();
  if (!pass3Text) throw new Error("Empty refinement response");

  const pass3 = safeJsonParse<Critique>(pass3Text);
  if (!pass3) {
    throw new Error(`Refinement invalid JSON: ${pass3Text}`);
  }

  return pass3;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      question,
      answer,
      answerB,
      mode = "blind_spots",
      compare = false,
    } = body as {
      question: string;
      answer: string;
      answerB?: string;
      mode?: Mode;
      compare?: boolean;
    };

    if (!question?.trim() || !answer?.trim()) {
      return Response.json(
        { error: "Question and answer are required." },
        { status: 400 }
      );
    }

    if (!compare) {
      const reconstruction = await reconstructAnswer(question, answer);
      const critique = await critiqueAnswer(question, answer, reconstruction, mode);

      return Response.json({
        type: "single",
        reconstruction,
        stress_test: critique,
      });
    }

    if (!answerB?.trim()) {
      return Response.json(
        { error: "Second answer is required for comparison." },
        { status: 400 }
      );
    }

    const reconstructionA = await reconstructAnswer(question, answer);
    const reconstructionB = await reconstructAnswer(question, answerB);

    const critiqueA = await critiqueAnswer(question, answer, reconstructionA, mode);
    const critiqueB = await critiqueAnswer(question, answerB, reconstructionB, mode);

    const compareResponse = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
You are comparing two AI answers to the same question.

Your task:
- compare reasoning quality
- compare practical usefulness
- compare which answer is more reliable
- explain the tradeoff fairly

Important scoring rule:

Evaluate the core recommendation before considering limitations.

Do not penalize answers simply for having caveats, nuance, or missing detail.

Use these guidelines:

9–10 = Strong reasoning aligned with established practice
7–8 = Good advice with minor caveats
5–6 = Partially reliable or context dependent
3–4 = Weak reasoning or significant gaps
1–2 = Incorrect or misleading advice

When comparing answers:

Identify the single most important reasoning mistake made by the weaker answer.

Explain the key reasoning difference between the two answers.

Avoid saying both answers are equally good unless they truly are.

Prefer a decisive judgment when supported by reasoning.

Do not include markdown or code fences.

Question:
${question}

Answer A:
${answer}

Answer A reconstruction:
${JSON.stringify(reconstructionA, null, 2)}

Answer A critique:
${JSON.stringify(critiqueA, null, 2)}

Answer B:
${answerB}

Answer B reconstruction:
${JSON.stringify(reconstructionB, null, 2)}

Answer B critique:
${JSON.stringify(critiqueB, null, 2)}

Return exactly this shape:
{
  "winner": "A|B|tie",
  "winner_rationale": "1–2 sentence explanation of why the winning answer is better overall.",
    "key_reasoning_difference": "Explain the fundamental difference in how the two answers reason about the problem.",
  "score_rationale": "Brief explanation of why one answer received a higher reliability score.",
  "when_other_is_better": "Explain the context where the losing answer could actually be the better strategy.",
  "decision_takeaway": "Short practical guidance the reader should follow.",
  "comparison_summary": "Short neutral overview of the tradeoffs.",
  "answer_a_score": 1,
  "answer_b_score": 1,
  "answer_a_strengths": ["string"],
  "answer_b_strengths": ["string"],
  "answer_a_weaknesses": ["string"],
  "answer_b_weaknesses": ["string"]
}
`,
    });

    const compareText = compareResponse.output_text?.trim();
    if (!compareText) {
      throw new Error("Empty comparison response");
    }

    const comparison = safeJsonParse<{
      winner: "A" | "B" | "tie";
      reason: string;
      decision_takeaway: string;
      comparison_summary: string;
      answer_a_score: number;
      answer_b_score: number;
      answer_a_strengths: string[];
      answer_b_strengths: string[];
      answer_a_weaknesses: string[];
      answer_b_weaknesses: string[];
    }>(compareText);

    if (!comparison) {
      throw new Error(`Comparison invalid JSON: ${compareText}`);
    }

    return Response.json({
      type: "compare",
      answerA: {
        reconstruction: reconstructionA,
        stress_test: critiqueA,
      },
      answerB: {
        reconstruction: reconstructionB,
        stress_test: critiqueB,
      },
      comparison,
    });
  } catch (err: any) {
    console.error("ROUTE ERROR:", err);
    return Response.json(
      { error: err?.message || "analysis failed" },
      { status: 500 }
    );
  }
}