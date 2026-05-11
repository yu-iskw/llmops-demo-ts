import type { Evaluator } from "@langfuse/client";
import type { Example, Run } from "langsmith";

export type LangSmithEvaluatorResult = {
  key: string;
  score: number;
  comment?: string;
};

/**
 * Coerces LangSmith `score` values to a finite number for Langfuse experiment `value`.
 * Non-numeric values become `0`; booleans become `0` or `1`.
 */
export function toLangfuseScore(raw: unknown): number {
  if (typeof raw === "number") {
    if (Number.isNaN(raw)) {
      return 0;
    }
    return raw;
  }
  if (typeof raw === "boolean") {
    return raw ? 1 : 0;
  }
  return 0;
}

/**
 * Clamps a numeric score to the closed unit interval Langfuse dashboards expect for these suites.
 */
export function clampScoreToUnitInterval(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function evaluatorFallbackName(evaluatorFunction: Function): string {
  if (
    typeof evaluatorFunction.name === "string" &&
    evaluatorFunction.name.length > 0
  ) {
    return evaluatorFunction.name;
  }
  return "evaluator";
}

function resolveScoreName(
  result: LangSmithEvaluatorResult,
  evaluatorFunction: (
    run: Run,
    example?: Example,
  ) => Promise<LangSmithEvaluatorResult>,
): string {
  if (typeof result.key === "string" && result.key.length > 0) {
    return result.key;
  }
  return evaluatorFallbackName(evaluatorFunction);
}

/**
 * Wraps a LangSmith-style evaluator so it can be used as a Langfuse experiment evaluator.
 *
 * Contract: the LangSmith evaluator must only depend on `run.inputs`, `run.outputs`, and
 * `example?.outputs` (the adapter supplies `example` as `{ outputs: expectedOutput }` when
 * Langfuse provides an expected output). If an evaluator needs other fields, wrap it locally
 * and project onto this shape instead of weakening the adapter.
 *
 * If the evaluator throws before returning `{ key, score }`, the adapter records score `0` and
 * uses the function’s non-empty `name` property when available (named `async function` or
 * `const foo = async () =>` infers `foo`), otherwise `"evaluator"`, so Langfuse never receives an
 * empty score dimension name.
 */
export function adaptLangSmithEvaluator(
  langSmithEvaluator: (
    run: Run,
    example?: Example,
  ) => Promise<LangSmithEvaluatorResult>,
): Evaluator {
  return async ({ input, output, expectedOutput }) => {
    const run = { inputs: input, outputs: output } as Run;
    const example =
      expectedOutput !== undefined
        ? ({ outputs: expectedOutput } as Example)
        : undefined;
    try {
      const result = await langSmithEvaluator(run, example);
      const name = resolveScoreName(result, langSmithEvaluator);
      const value = clampScoreToUnitInterval(toLangfuseScore(result.score));
      return {
        name,
        value,
        ...(result.comment ? { comment: result.comment } : {}),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        name: evaluatorFallbackName(langSmithEvaluator),
        value: 0,
        comment: `Evaluator threw before returning a result: ${message}`,
      };
    }
  };
}
