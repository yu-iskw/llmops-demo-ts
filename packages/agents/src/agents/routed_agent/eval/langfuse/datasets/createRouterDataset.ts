import { loadRoutedEvalDataset } from "../../datasets/loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangfuse } from "./pushRoutedEvalDatasetToLangfuse";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("router");
  return pushRoutedEvalDatasetToLangfuse(
    spec,
    "Router dataset examples synced to Langfuse.",
  );
}
