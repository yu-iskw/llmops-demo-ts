import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { createAndAddExamples } from "../../../../../eval/langsmith/datasets/outputSanitizerDataset";
import { targetFunction } from "./targetFunction";
import {
  correctnessEvaluatorGenAI,
  isSensitiveAccuracy,
  outputSanitizedMessageAccuracy,
} from "../../../../../../secure_agent/subagents/output_sanitizer/eval/langsmith/llm_judge/evaluator";

export async function runLlmJudgeEvaluation() {
  const datasetId = await createAndAddExamples();
  await evaluate(targetFunction, {
    data: datasetId,
    evaluators: [
      correctnessEvaluatorGenAI,
      isSensitiveAccuracy,
      outputSanitizedMessageAccuracy,
    ],
    experimentPrefix: "routed-agent-output-sanitizer-evaluation",
    maxConcurrency: 2,
  } as EvaluateOptions);
  console.log(
    "Routed agent output sanitizer evaluation run initiated. Check LangSmith UI for results.",
  );
}
