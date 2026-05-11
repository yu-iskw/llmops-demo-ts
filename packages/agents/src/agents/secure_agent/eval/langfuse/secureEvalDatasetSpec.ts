export interface SecureEvalDatasetExample {
  id?: string;
  input: Record<string, unknown>;
  expectedOutput?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface SecureEvalDatasetSpec {
  datasetName: string;
  description: string;
  metadata?: Record<string, unknown>;
  examples: ReadonlyArray<SecureEvalDatasetExample>;
}
