import { spawn } from "node:child_process";
import path from "node:path";
import { getPackageRootPath } from "../../../../utils/utilities";
import { runLlmJudgeEvaluation as runInputSanitizerLangfuseEvaluation } from "../../subagents/input_sanitizer/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runOutputSanitizerLangfuseEvaluation } from "../../subagents/output_sanitizer/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runAnswerLlmJudgeLangfuseEvaluation } from "../../subagents/answer_agent/eval/langfuse/llm_judge/runEvaluation";
import { runEvaluation as runAnswerMultiTurnLangfuseEvaluation } from "../../subagents/answer_agent/eval/langfuse/multi_turn/runEvaluation";

/** Identifiers for secure-agent Langfuse offline eval suites (CLI + parallel runner). */
export const LANGFUSE_OFFLINE_EVAL_SUITE_IDS = [
  "input-sanitizer",
  "output-sanitizer",
  "answer-llm-judge",
  "answer-multi-turn",
] as const;

export type LangfuseOfflineEvalSuiteId =
  (typeof LANGFUSE_OFFLINE_EVAL_SUITE_IDS)[number];

export function isLangfuseOfflineEvalSuiteId(
  value: string,
): value is LangfuseOfflineEvalSuiteId {
  return (LANGFUSE_OFFLINE_EVAL_SUITE_IDS as ReadonlyArray<string>).includes(
    value,
  );
}

/** Runs one suite in-process (single OTEL lifecycle). */
export async function runLangfuseOfflineEvalSuite(
  suiteId: LangfuseOfflineEvalSuiteId,
): Promise<void> {
  switch (suiteId) {
    case "input-sanitizer":
      await runInputSanitizerLangfuseEvaluation();
      break;
    case "output-sanitizer":
      await runOutputSanitizerLangfuseEvaluation();
      break;
    case "answer-llm-judge":
      await runAnswerLlmJudgeLangfuseEvaluation();
      break;
    case "answer-multi-turn":
      await runAnswerMultiTurnLangfuseEvaluation();
      break;
    default: {
      const exhaustive: never = suiteId;
      throw new Error(`Unhandled suite: ${String(exhaustive)}`);
    }
  }
}

/** Runs all suites sequentially in the current process. */
export async function runAllLangfuseOfflineEvalSuitesSequential(): Promise<void> {
  for (const id of LANGFUSE_OFFLINE_EVAL_SUITE_IDS) {
    await runLangfuseOfflineEvalSuite(id);
  }
}

/**
 * Runs each suite in an isolated Node subprocess (via `pnpm exec tsx`), so each
 * process owns its own OTEL / Langfuse singleton state.
 */
export async function runAllLangfuseOfflineEvalSuitesParallel(): Promise<void> {
  const packageRoot = getPackageRootPath();
  const tsxCli = path.join(
    packageRoot,
    "node_modules",
    "tsx",
    "dist",
    "cli.mjs",
  );
  const cliEntry = path.join(packageRoot, "src", "cli.ts");
  const results = await Promise.all(
    LANGFUSE_OFFLINE_EVAL_SUITE_IDS.map(
      (suiteId) =>
        new Promise<{ suiteId: LangfuseOfflineEvalSuiteId; exitCode: number }>(
          (resolve, reject) => {
            const child = spawn(
              process.execPath,
              [
                tsxCli,
                cliEntry,
                "secure-agent",
                "eval-langfuse-suite",
                suiteId,
              ],
              {
                cwd: packageRoot,
                stdio: "inherit",
              },
            );
            child.on("error", reject);
            child.on("close", (code) => {
              resolve({ suiteId, exitCode: code ?? 1 });
            });
          },
        ),
    ),
  );

  const failed = results.filter((r) => r.exitCode !== 0);
  if (failed.length > 0) {
    const detail = failed
      .map((f) => `${f.suiteId} (exit ${f.exitCode})`)
      .join(", ");
    throw new Error(`One or more Langfuse eval subprocesses failed: ${detail}`);
  }
}
