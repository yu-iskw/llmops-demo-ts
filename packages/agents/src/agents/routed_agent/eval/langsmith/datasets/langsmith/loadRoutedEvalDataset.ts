import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import {
  routedEvalDatasetSchema,
  type RoutedEvalDataset,
} from "./routedEvalDatasetSchema";

const dataDirectory = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
);

const datasetYamlFiles = {
  router: "router.yaml",
  output_sanitizer: "output_sanitizer.yaml",
  end_to_end: "end_to_end.yaml",
  trip_specialist: "trip_specialist.yaml",
  finance_specialist: "finance_specialist.yaml",
  general_specialist: "general_specialist.yaml",
} as const;

export type RoutedEvalDatasetId = keyof typeof datasetYamlFiles;

/** Loads and validates a routed-agent eval dataset from YAML next to this package. */
export function loadRoutedEvalDataset(
  id: RoutedEvalDatasetId,
): RoutedEvalDataset {
  const fileName = datasetYamlFiles[id];
  const filePath = join(dataDirectory, fileName);
  const raw = readFileSync(filePath, "utf8");
  const parsed: unknown = parse(raw);
  const result = routedEvalDatasetSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Invalid dataset YAML (${id} / ${fileName}): ${result.error.message}`,
    );
  }
  return result.data;
}
