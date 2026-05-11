import { loadRoutedEvalDataset } from "../../datasets/loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangfuse } from "./pushRoutedEvalDatasetToLangfuse";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("finance_specialist");
  return pushRoutedEvalDatasetToLangfuse(
    spec,
    "Finance specialist dataset examples synced to Langfuse.",
  );
}
