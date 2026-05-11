import { loadRoutedEvalDataset } from "../../datasets/loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangfuse } from "./pushRoutedEvalDatasetToLangfuse";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("output_sanitizer");
  return pushRoutedEvalDatasetToLangfuse(
    spec,
    "Output sanitizer dataset examples synced to Langfuse.",
  );
}
