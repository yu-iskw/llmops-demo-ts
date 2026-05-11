import { spawn } from "node:child_process";
import path from "node:path";
import { getPackageRootPath } from "../../../../utils/utilities";
import { runLlmJudgeEvaluation as runRouterLangfuseEvaluation } from "../../subagents/router/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runOutputSanitizerLangfuseEvaluation } from "../../subagents/output_sanitizer/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runTripSpecialistLangfuseEvaluation } from "../../subagents/trip_agent/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runFinanceSpecialistLangfuseEvaluation } from "../../subagents/finance_agent/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runGeneralSpecialistLangfuseEvaluation } from "../../subagents/general_agent/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runE2ELangfuseEvaluation } from "./end_to_end/llm_judge/runEvaluation";

/** Identifiers for routed-agent Langfuse offline LLM-judge suites (CLI + parallel runner). */
export const LANGFUSE_OFFLINE_EVAL_SUITE_IDS = [
  "router",
  "output-sanitizer",
  "trip",
  "finance",
  "general",
  "end-to-end",
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
    case "router":
      await runRouterLangfuseEvaluation();
      break;
    case "output-sanitizer":
      await runOutputSanitizerLangfuseEvaluation();
      break;
    case "trip":
      await runTripSpecialistLangfuseEvaluation();
      break;
    case "finance":
      await runFinanceSpecialistLangfuseEvaluation();
      break;
    case "general":
      await runGeneralSpecialistLangfuseEvaluation();
      break;
    case "end-to-end":
      await runE2ELangfuseEvaluation();
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
                "routed-agent",
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
