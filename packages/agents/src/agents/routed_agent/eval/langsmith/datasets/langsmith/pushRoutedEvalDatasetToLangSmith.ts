import { Dataset } from "langsmith";
import {
  createLangSmithEvalClient,
  runLangSmithDatasetOperation,
} from "../../../../../../utils/langsmithEvalClient";
import type { RoutedEvalDataset } from "./routedEvalDatasetSchema";

/**
 * Creates or reuses a LangSmith dataset and uploads examples from a validated spec.
 */
export async function pushRoutedEvalDatasetToLangSmith(
  spec: RoutedEvalDataset,
  successLogMessage: string,
): Promise<string> {
  return runLangSmithDatasetOperation(async () => {
    const client = createLangSmithEvalClient({
      defaultProject:
        process.env.LANGCHAIN_PROJECT?.trim() || spec.defaultProject,
    });

    let dataset: Dataset | undefined;
    const datasetName = spec.datasetName;

    for await (const existingDataset of client.listDatasets({ datasetName })) {
      dataset = existingDataset;
      console.log(
        `Dataset "${datasetName}" already exists with ID: ${existingDataset.id}. Reusing existing dataset.`,
      );
      break;
    }

    if (!dataset) {
      dataset = await client.createDataset(datasetName, {
        description: spec.description,
      });
      console.log(`Dataset "${datasetName}" created with ID: ${dataset.id}.`);
    }

    await client.createExamples(
      spec.examples.map((ex) => ({ ...ex, dataset_id: dataset!.id })),
    );
    console.log(successLogMessage);
    return dataset.id;
  });
}
