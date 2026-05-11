# Langfuse offline evaluation: LangSmith parity matrix

Langfuse `dataset.runExperiment` uses `adaptLangSmithEvaluator` ([implementation](../../../../eval/langfuse/adaptLangSmithEvaluator.ts)) so each LangSmith-style evaluator return `{ key, score, comment? }` becomes a Langfuse score with **`name === key`** and **`value` normalized to a number in `[0, 1]`**.

## Routed agent (`routed_agent`)

| Suite              | LangSmith `runEvaluation`                                              | Langfuse `runExperiment`                                              | Score keys (`name` in Langfuse)                                                  | Needs Gemini for full signal                    |
| ------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| Router             | `subagents/router/eval/langsmith/llm_judge/runEvaluation.ts`           | `subagents/router/eval/langfuse/llm_judge/runEvaluation.ts`           | `correctness_genAI`, `route_exact_match`                                         | `correctness_genAI` yes; `route_exact_match` no |
| Output sanitizer   | `subagents/output_sanitizer/eval/langsmith/llm_judge/runEvaluation.ts` | `subagents/output_sanitizer/eval/langfuse/llm_judge/runEvaluation.ts` | `correctness_genAI`, `is_sensitive_accuracy`, `output_sanitized_reason_accuracy` | `correctness_genAI` yes; programmatic pair no   |
| Trip specialist    | `subagents/trip_agent/eval/langsmith/llm_judge/runEvaluation.ts`       | `subagents/trip_agent/eval/langfuse/llm_judge/runEvaluation.ts`       | `specialist_quality_genAI`                                                       | yes                                             |
| Finance specialist | `subagents/finance_agent/eval/langsmith/llm_judge/runEvaluation.ts`    | `subagents/finance_agent/eval/langfuse/llm_judge/runEvaluation.ts`    | `specialist_quality_genAI`                                                       | yes                                             |
| General specialist | `subagents/general_agent/eval/langsmith/llm_judge/runEvaluation.ts`    | `subagents/general_agent/eval/langfuse/llm_judge/runEvaluation.ts`    | `specialist_quality_genAI`                                                       | yes                                             |
| End-to-end         | `eval/langsmith/end_to_end/llm_judge/runEvaluation.ts`                 | `eval/langfuse/end_to_end/llm_judge/runEvaluation.ts`                 | `e2e_quality_genAI`, `route_exact_match`                                         | `e2e_quality_genAI` yes; `route_exact_match` no |

Evaluators arrays use the **same functions** as LangSmith, wrapped with `adaptLangSmithEvaluator(...)`.

## Secure agent (`secure_agent`)

| Suite              | LangSmith entry                                                        | Langfuse entry                                                        | Score keys (`name` in Langfuse)                                                  | Needs Gemini for full signal                                                    |
| ------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Input sanitizer    | `subagents/input_sanitizer/eval/langsmith/llm_judge/runEvaluation.ts`  | `subagents/input_sanitizer/eval/langfuse/llm_judge/runEvaluation.ts`  | `correctness_genAI`, `is_suspicious_accuracy`, `sanitized_message_accuracy`      | `correctness_genAI` yes; programmatic pair no                                   |
| Output sanitizer   | `subagents/output_sanitizer/eval/langsmith/llm_judge/runEvaluation.ts` | `subagents/output_sanitizer/eval/langfuse/llm_judge/runEvaluation.ts` | `correctness_genAI`, `is_sensitive_accuracy`, `output_sanitized_reason_accuracy` | `correctness_genAI` yes; programmatic pair no                                   |
| Answer (LLM judge) | `subagents/answer_agent/eval/langsmith/llm_judge/runEvaluation.ts`     | `subagents/answer_agent/eval/langfuse/llm_judge/runEvaluation.ts`     | `correctness`                                                                    | Evaluator is currently a placeholder (returns `0`); no live Gemini call in-repo |
| Answer multi-turn  | `subagents/answer_agent/eval/langsmith/multi_turn/runEvaluation.ts`    | `subagents/answer_agent/eval/langfuse/multi_turn/runEvaluation.ts`    | `satisfaction_and_helpfulness`                                                   | yes                                                                             |

## Environment

- **Langfuse**: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, optional `LANGFUSE_BASE_URL`.
- **Gemini / Vertex** (for LLM-as-judge and `targetFunction` where applicable): same as agent runtime (`GOOGLE_API_KEY` or Vertex env vars per `utils/genai.ts`). When a judge’s GenAI call fails, evaluators typically return score `0` and `comment: "Evaluator error"`; programmatic scores still run.

## Operator verification (May 2026)

- **Unit tests**: `pnpm --filter @llmops-demo-ts/agents test -- adaptLangSmithEvaluator` exercises score coercion, clamping, and adapter mapping without Langfuse network calls.
- **Router suite CLI** (`pnpm --filter @llmops-demo-ts/agents cli routed-agent router langfuse eval-llm-as-judge`): with valid Langfuse keys, the dataset syncs and `runExperiment` completes; with missing or invalid GenAI auth, the **task** (`targetFunction`) and **LLM judges** log initialization errors. The adapter maps thrown evaluators to a **non-empty** Langfuse score `name` (preferably the JS function `name`, e.g. `correctnessEvaluatorGenAI`) and `value: 0` with an explanatory `comment`, so the Langfuse UI still shows a numeric column instead of an empty evaluator label.
- **Langfuse UI**: open the experiment run for the suite and confirm one column per score key above (plus any throw fallback names when auth is broken); aggregates should reflect `0`/`1` once the task produces valid `output` for programmatic metrics.
