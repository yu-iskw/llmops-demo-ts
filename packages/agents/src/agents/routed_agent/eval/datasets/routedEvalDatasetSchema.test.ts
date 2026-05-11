import { parse } from "yaml";
import { routedEvalDatasetSchema } from "./routedEvalDatasetSchema";

describe("routedEvalDatasetSchema", () => {
  it("accepts a minimal valid dataset document", () => {
    const raw = parse(`
datasetName: Test Dataset
description: Test
defaultProject: Test Project
examples:
  - inputs: { q: "hi" }
    outputs: { a: "ok" }
`);
    const result = routedEvalDatasetSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.datasetName).toBe("Test Dataset");
      expect(result.data.examples).toHaveLength(1);
    }
  });

  it("rejects invalid documents", () => {
    const raw = parse(`
datasetName: X
description: Y
defaultProject: Z
examples: not-an-array
`);
    const result = routedEvalDatasetSchema.safeParse(raw);
    expect(result.success).toBe(false);
  });
});
