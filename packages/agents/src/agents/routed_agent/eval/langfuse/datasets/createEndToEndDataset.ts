import { loadRoutedEvalDataset } from "../../datasets/loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangfuse } from "./pushRoutedEvalDatasetToLangfuse";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("end_to_end");
  return pushRoutedEvalDatasetToLangfuse(
    spec,
    "Routed agent E2E dataset examples synced to Langfuse.",
  );
}
