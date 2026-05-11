import type { Evaluation } from "@langfuse/client";
import type { Example, Run } from "langsmith";
import {
  adaptLangSmithEvaluator,
  clampScoreToUnitInterval,
  toLangfuseScore,
} from "./adaptLangSmithEvaluator";

function assertSingleEvaluation(
  row: Evaluation | ReadonlyArray<Evaluation>,
): asserts row is Evaluation {
  if (Array.isArray(row)) {
    throw new Error("Expected a single evaluation row");
  }
}

describe("toLangfuseScore", () => {
  test("preserves finite numbers", () => {
    expect(toLangfuseScore(0.5)).toBe(0.5);
    expect(toLangfuseScore(1)).toBe(1);
  });

  test("maps NaN and non-numeric to 0", () => {
    expect(toLangfuseScore(Number.NaN)).toBe(0);
    expect(toLangfuseScore("1")).toBe(0);
    expect(toLangfuseScore(undefined)).toBe(0);
  });

  test("maps booleans to 0 or 1", () => {
    expect(toLangfuseScore(true)).toBe(1);
    expect(toLangfuseScore(false)).toBe(0);
  });
});

describe("clampScoreToUnitInterval", () => {
  test("clamps to unit interval", () => {
    expect(clampScoreToUnitInterval(-1)).toBe(0);
    expect(clampScoreToUnitInterval(2)).toBe(1);
    expect(clampScoreToUnitInterval(0.25)).toBe(0.25);
  });
});

describe("adaptLangSmithEvaluator", () => {
  test("maps LangSmith result to Langfuse evaluator shape", async () => {
    const adapted = adaptLangSmithEvaluator(async () => ({
      key: "metric_a",
      score: 1,
      comment: "ok",
    }));
    const row = await adapted({
      input: { q: "hi" },
      output: { a: "there" },
      expectedOutput: { route: "general" },
    });
    assertSingleEvaluation(row);
    expect(row).toEqual({
      name: "metric_a",
      value: 1,
      comment: "ok",
    });
  });

  test("normalizes non-numeric score and preserves key", async () => {
    const adapted = adaptLangSmithEvaluator(async () => ({
      key: "metric_b",
      score: true as unknown as number,
    }));
    const row = await adapted({
      input: {},
      output: {},
    });
    assertSingleEvaluation(row);
    expect(row.name).toBe("metric_b");
    expect(row.value).toBe(1);
  });

  test("returns fallback when evaluator throws", async () => {
    async function throwingEvaluator(): Promise<{
      key: string;
      score: number;
    }> {
      throw new Error("boom");
    }
    const adapted = adaptLangSmithEvaluator(throwingEvaluator);
    const row = await adapted({ input: {}, output: {} });
    assertSingleEvaluation(row);
    expect(row.name).toBe("throwingEvaluator");
    expect(row.value).toBe(0);
    expect(row.comment).toContain("boom");
  });

  test("uses function name when key is empty", async () => {
    async function namedEvaluator(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- LangSmith evaluator arity
      run: Run,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- LangSmith evaluator arity
      example?: Example,
    ): Promise<{ key: string; score: number }> {
      return { key: "", score: 0 };
    }
    const adapted = adaptLangSmithEvaluator(namedEvaluator);
    const row = await adapted({ input: {}, output: {} });
    assertSingleEvaluation(row);
    expect(row.name).toBe("namedEvaluator");
    expect(row.value).toBe(0);
  });
});
