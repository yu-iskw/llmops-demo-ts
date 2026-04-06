import { z } from "zod";

const exampleSchema = z.object({
  inputs: z.record(z.string(), z.unknown()),
  outputs: z.record(z.string(), z.unknown()),
});

export const routedEvalDatasetSchema = z.object({
  datasetName: z.string(),
  description: z.string(),
  defaultProject: z.string(),
  examples: z.array(exampleSchema),
});

export type RoutedEvalDataset = z.infer<typeof routedEvalDatasetSchema>;
