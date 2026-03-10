cat > app/api/analyze-lite/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  return NextResponse.json({
    reliability_score: 6,
    label: "Moderately reliable",
    summary: "Test route is working.",
    top_risk_hint: "⚠ Missing context",
    better_prompt: "Rewrite the answer with clearer assumptions and stronger evidence."
  });
}
EOF