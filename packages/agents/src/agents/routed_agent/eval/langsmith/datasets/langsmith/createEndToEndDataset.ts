import { loadRoutedEvalDataset } from "./loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangSmith } from "./pushRoutedEvalDatasetToLangSmith";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("end_to_end");
  return pushRoutedEvalDatasetToLangSmith(
    spec,
    "Routed agent E2E dataset examples created successfully.",
  );
}
