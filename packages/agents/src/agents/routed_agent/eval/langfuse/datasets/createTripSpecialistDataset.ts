import { loadRoutedEvalDataset } from "../../datasets/loadRoutedEvalDataset";
import { pushRoutedEvalDatasetToLangfuse } from "./pushRoutedEvalDatasetToLangfuse";

export async function createAndAddExamples(): Promise<string> {
  const spec = loadRoutedEvalDataset("trip_specialist");
  return pushRoutedEvalDatasetToLangfuse(
    spec,
    "Trip specialist dataset examples synced to Langfuse.",
  );
}
