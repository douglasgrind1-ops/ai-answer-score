import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { question, answer } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Missing question or answer." },
        { status: 400 }
      );
    }

    const prompt = `
You are evaluating the reliability of an AI answer.

Question:
${question}

Answer:
${answer}

Return ONLY valid JSON with this structure:

{
 "reliability_score": number (0-10),
 "label": short rating like "Strong", "Moderately reliable", etc,
 "summary": one paragraph explaining the reliability,
 "top_risk_hint": the single most important missing risk or assumption,
 "better_prompt": a stronger follow-up prompt to improve the answer
}

Respond with JSON only.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are a critical reasoning evaluator.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices?.[0]?.message?.content || "{}";

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        reliability_score: 0,
        label: "Unavailable",
        summary: "The analysis response could not be parsed.",
        top_risk_hint: "Unable to determine risk.",
        better_prompt:
          "Rewrite the answer with clearer assumptions and supporting evidence.",
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("analyze-lite error:", error);

    return NextResponse.json(
      {
        reliability_score: 0,
        label: "Unavailable",
        summary: "The analysis service failed to respond.",
        top_risk_hint: "Unable to determine risk.",
        better_prompt:
          "Rewrite the answer with clearer assumptions and stronger evidence.",
      },
      { status: 500 }
    );
  }
}