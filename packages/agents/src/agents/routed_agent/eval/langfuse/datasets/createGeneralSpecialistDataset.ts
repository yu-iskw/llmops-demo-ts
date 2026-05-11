import { loadRoutedEvalDataset } from "../../datasets/loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangfuse } from "./pushRoutedEvalDatasetToLangfuse";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("general_specialist");
  return pushRoutedEvalDatasetToLangfuse(
    spec,
    "General specialist dataset examples synced to Langfuse.",
  );
}
