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

function fallbackDeepPrompt(question: string, topRiskHint: string): string {
  return `Provide a stronger answer to this question:

${question}

Improve the answer by specifically addressing this issue:
${topRiskHint}

Requirements:
• clarify assumptions
• address missing risks
• strengthen reasoning
• give a clear, structured answer`;
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
  const deep_reasoning_prompt = safeString(
    data.deep_reasoning_prompt,
    fallbackDeepPrompt(question, top_risk_hint)
  );

  return {
    reliability_score,
    label,
    summary,
    top_risk_hint,
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
  "deep_reasoning_prompt": ""
}

Rules:
- reliability_score must be an integer from 0 to 10
- label must be short
- summary must be one sentence
- top_risk_hint must be short and specific
- deep_reasoning_prompt must be a standalone reusable prompt
- it should work even outside the current conversation
- include the original question only as needed for clarity
- focus on what should be added, clarified, or fixed
- do NOT say "answer again"
- do NOT rely on prior conversation context
`.trim();

    const userPrompt = `
Question:
${question}

Answer:
${answer}

Evaluate the answer quickly.

Generate one improved prompt:

deep_reasoning_prompt
- a self-contained prompt that will produce a stronger answer
- it should incorporate the most important missing assumption, risk, or reasoning gap
- it must be usable on its own without prior context

Return only the JSON object.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 260,
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
        deep_reasoning_prompt:
          "Provide a stronger answer with clearer assumptions, stronger reasoning, and a more structured response.",
      },
      { status: 500 }
    );
  }
}
