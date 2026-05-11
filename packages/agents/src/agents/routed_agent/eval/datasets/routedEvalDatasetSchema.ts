import { z } from "zod";

const exampleSchema = z.object({
  id: z.string().optional(),
  inputs: z.record(z.string(), z.unknown()),
  outputs: z.record(z.string(), z.unknown()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const routedEvalDatasetSchema = z.object({
  datasetName: z.string(),
  description: z.string(),
  defaultProject: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  examples: z.array(exampleSchema),
});

export type RoutedEvalDataset = z.infer<typeof routedEvalDatasetSchema>;
export type RoutedEvalDatasetExample = RoutedEvalDataset["examples"][number];
