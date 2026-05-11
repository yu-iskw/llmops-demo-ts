import { loadRoutedEvalDataset } from "../../../datasets/loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangSmith } from "./pushRoutedEvalDatasetToLangSmith";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("trip_specialist");
  return pushRoutedEvalDatasetToLangSmith(
    spec,
    "Trip specialist dataset examples created successfully.",
  );
}
