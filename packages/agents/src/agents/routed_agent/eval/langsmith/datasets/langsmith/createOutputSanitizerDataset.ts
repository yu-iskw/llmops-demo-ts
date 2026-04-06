import { loadRoutedEvalDataset } from "./loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangSmith } from "./pushRoutedEvalDatasetToLangSmith";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("output_sanitizer");
  return pushRoutedEvalDatasetToLangSmith(
    spec,
    "Routed agent output sanitizer dataset examples created successfully.",
  );
}
