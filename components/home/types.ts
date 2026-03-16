export type Mode =
  | "blind_spots"
  | "reasoning"
  | "accuracy"
  | "decision_quality";

export type Level = "high" | "medium" | "low";

export type WeightedItem = {
  text: string;
  level?: Level;
  impact?: Level;
};

export type ClaimReview = {
  claim: string;
  concern: string;
  severity?: Level;
};

export type Reconstruction = {
  main_conclusion: string;
  supporting_claims: string[];
  assumptions: string[];
  uncertain_or_context_dependent_claims: string[];
};

export type StressTest = {
  reliability_score: number;
  summary: string;
  reliability_explanation: string;
  best_follow_up_question: string;
  alternative_perspective: string;
  weakest_assumptions: WeightedItem[];
  missing_risks: WeightedItem[];
  reasoning_gaps: WeightedItem[];
  failure_scenarios: WeightedItem[];
  claim_reviews: ClaimReview[];
};

export type SingleResult = {
  reconstruction: Reconstruction;
  stress_test: StressTest;
};

export type CompareResult = {
  comparison: {
    winner: "A" | "B" | "tie" | string;
    winner_rationale: string;
    key_reasoning_difference?: string;
    score_rationale?: string;
    when_other_is_better: string;
    decision_takeaway: string;
  };
  answerA: SingleResult;
  answerB: SingleResult;
};

export type Result = SingleResult | CompareResult;
