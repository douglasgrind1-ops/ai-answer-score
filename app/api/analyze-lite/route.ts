import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type LiteResponse = {
  reliability_score: number;
  label: string;
  summary: string;
  top_risk_hint: string;
  better_prompt: string;
};

function scoreToLabel(score: number): string {
  if (score >= 9) return "Highly reliable";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Moderately reliable";
  if (score >= 3) return "Use caution";
  return "Low reliability";
}

function extractJson(text: string): LiteResponse {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const maybeJson = trimmed.slice(firstBrace, lastBrace + 1);
      return JSON.parse(maybeJson);
    }

    throw new Error("Model did not return valid JSON.");
  }
}

function sanitizeLiteResponse(
  question: string,
  data: Partial<LiteResponse>
): LiteResponse {
  const rawScore =
    typeof data.reliability_score === "number"
      ? data.reliability_score
      : Number(data.reliability_score);

  const reliability_score = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(10, Math.round(rawScore)))
    : 5;

  const label =
    typeof data.label === "string" && data.label.trim().length > 0
      ? data.label.trim()
      : scoreToLabel(reliability_score);

  const summary =
    typeof data.summary === "string" && data.summary.trim().length > 0
      ? data.summary.trim()
      : "Reasonably useful answer, but it may be missing important context.";

  const top_risk_hint =
    typeof data.top_risk_hint === "string" && data.top_risk_hint.trim().length > 0
      ? data.top_risk_hint.trim()
      : "⚠ Missing context";

  const better_prompt =
    typeof data.better_prompt === "string" && data.better_prompt.trim().length > 0
      ? data.better_prompt.trim()
      : `Rewrite the answer to this question with clearer assumptions, stronger evidence, and missing context addressed:\n\n${question}`;

  return {
    reliability_score,
    label,
    summary,
    top_risk_hint,
    better_prompt,
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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const systemPrompt = `
You evaluate the reliability of AI-generated answers.

Return STRICT JSON only.

Return exactly:
{
  "reliability_score": 0,
  "label": "",
  "summary": "",
  "top_risk_hint": "",
  "better_prompt": ""
}

Constraints:
- reliability_score: integer 0 to 10
- label: max 3 words
- summary: max 14 words
- top_risk_hint: max 6 words
- better_prompt: max 70 words
`.trim();

    const userPrompt = `
Question:
${question}

Answer:
${answer}

Score the answer quickly.
Focus on the single biggest weakness that most affects answer quality.
Return only the JSON object.
`.trim();
    
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "gpt-4.1-mini",
    temperature: 0.1,
    max_tokens: 220,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  }),
});

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      return NextResponse.json(
        { error: `OpenAI request failed: ${errorText}` },
        { status: 500 }
      );
    }

    const openaiJson = await openaiRes.json();
    const content = openaiJson?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "No model output returned." },
        { status: 500 }
      );
    }

    const parsed = extractJson(content);
    const sanitized = sanitizeLiteResponse(question, parsed);

    return NextResponse.json(sanitized);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
