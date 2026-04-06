import { loadRoutedEvalDataset } from "./loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangSmith } from "./pushRoutedEvalDatasetToLangSmith";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("general_specialist");
  return pushRoutedEvalDatasetToLangSmith(
    spec,
    "General specialist dataset examples created successfully.",
  );
}
