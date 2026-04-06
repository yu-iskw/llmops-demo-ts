import { loadRoutedEvalDataset } from "./loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangSmith } from "./pushRoutedEvalDatasetToLangSmith";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("router");
  return pushRoutedEvalDatasetToLangSmith(
    spec,
    "Router dataset examples created successfully.",
  );
}
