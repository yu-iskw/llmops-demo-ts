import { loadRoutedEvalDataset } from "./loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangSmith } from "./pushRoutedEvalDatasetToLangSmith";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("finance_specialist");
  return pushRoutedEvalDatasetToLangSmith(
    spec,
    "Finance specialist dataset examples created successfully.",
  );
}
