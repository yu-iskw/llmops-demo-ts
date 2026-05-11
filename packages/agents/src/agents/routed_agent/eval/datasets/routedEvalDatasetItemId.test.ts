import {
  routedEvalDatasetItemId,
  slugDatasetNameForItemId,
} from "./routedEvalDatasetItemId";

describe("routedEvalDatasetItemId", () => {
  it("slugifies dataset names for ids", () => {
    expect(slugDatasetNameForItemId("Routed Agent Router Dataset")).toBe(
      "routed-agent-router-dataset",
    );
  });

  it("uses explicit id when provided", () => {
    expect(
      routedEvalDatasetItemId("Routed Agent Router Dataset", "case-a", 0),
    ).toBe("routed-agent-router-dataset:case-a");
  });

  it("falls back to index when id omitted", () => {
    expect(routedEvalDatasetItemId("My Dataset", undefined, 2)).toBe(
      "my-dataset:item-3",
    );
  });
});
