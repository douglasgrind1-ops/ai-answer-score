import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type LiteResponse = {
  reliability_score: number;
  label: string;
  summary: string;
  top_risk_hint: string;
  quick_fix_prompt: string;
  deep_reasoning_prompt: string;
};

function clampScore(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.max(0, Math.min(10, Math.round(n)));
}

function scoreToLabel(score: number): string {
  if (score >= 9) return "Highly reliable";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Moderately reliable";
  if (score >= 3) return "Use caution";
  return "Low reliability";
}

function safeString(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function parseJson(text: string): Partial<LiteResponse> {
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("Model did not return valid JSON.");
  }
}

function fallbackQuickFixPrompt(topRiskHint: string): string {
  return `Answer the question again, but improve the answer by addressing this issue: ${topRiskHint} Keep the response concise, clearer, and better supported.`;
}

function fallbackDeepPrompt(question: string, topRiskHint: string): string {
  return `Answer the question again with stronger reasoning. Address this issue: ${topRiskHint} Define the criteria you are using, account for important uncertainty, and provide a more structured and complete answer to: ${question}`;
}

function sanitizeResponse(
  question: string,
  data: Partial<LiteResponse>
): LiteResponse {
  const reliability_score = clampScore(data.reliability_score);
  const label = safeString(data.label, scoreToLabel(reliability_score));
  const summary = safeString(
    data.summary,
    "The answer is directionally useful but may be missing important context."
  );
  const top_risk_hint = safeString(
    data.top_risk_hint,
    "Missing context or unclear assumptions."
  );
  const quick_fix_prompt = safeString(
    data.quick_fix_prompt,
    fallbackQuickFixPrompt(top_risk_hint)
  );
  const deep_reasoning_prompt = safeString(
    data.deep_reasoning_prompt,
    fallbackDeepPrompt(question, top_risk_hint)
  );

  return {
    reliability_score,
    label,
    summary,
    top_risk_hint,
    quick_fix_prompt,
    deep_reasoning_prompt,
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "analyze-lite route is live",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question =
      typeof body.question === "string" ? body.question.trim() : "";
    const answer =
      typeof body.answer === "string" ? body.answer.trim() : "";

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const systemPrompt = `
You evaluate the reliability of AI-generated answers.

Return STRICT JSON only.
No markdown.
No extra commentary.

Return exactly this shape:
{
  "reliability_score": 0,
  "label": "",
  "summary": "",
  "top_risk_hint": "",
  "quick_fix_prompt": "",
  "deep_reasoning_prompt": ""
}

Rules:
- reliability_score must be an integer from 0 to 10
- label must be short
- summary must be one sentence
- top_risk_hint must be short and specific
- quick_fix_prompt must be compact, actionable, and focused on the most important missing improvement
- deep_reasoning_prompt must be more structured and should force a better second-pass answer
- do not repeat the original question unnecessarily
- preserve the user's original intent, but focus on what should be added or fixed
`.trim();

    const userPrompt = `
Question:
${question}

Answer:
${answer}

Evaluate the answer quickly.

Build two improved prompts:
1. quick_fix_prompt = short and low-friction, optimized for immediate improvement
2. deep_reasoning_prompt = more structured, optimized for accuracy and completeness

Focus on the single biggest weakness, but also strengthen the reasoning where needed.

Return only the JSON object.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = completion.choices?.[0]?.message?.content || "{}";
    const parsed = parseJson(text);
    const sanitized = sanitizeResponse(question, parsed);

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("analyze-lite error:", error);

    return NextResponse.json(
      {
        reliability_score: 0,
        label: "Unavailable",
        summary: "The analysis service failed to respond.",
        top_risk_hint: "Unable to determine the main issue.",
        quick_fix_prompt:
          "Answer the question again, but make the response clearer and better supported.",
        deep_reasoning_prompt:
          "Answer the question again with stronger reasoning, clearer criteria, and a more complete explanation.",
      },
      { status: 500 }
    );
  }
}
