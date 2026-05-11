function trimEdgeHyphens(slug: string): string {
  let start = 0;
  let end = slug.length;
  while (start < end && slug[start] === "-") {
    start++;
  }
  while (end > start && slug[end - 1] === "-") {
    end--;
  }
  return slug.slice(start, end);
}

/**
 * Stable slug for embedding in Langfuse dataset item IDs (project-unique).
 */
export function slugDatasetNameForItemId(datasetName: string): string {
  const dashed = datasetName.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  return trimEdgeHyphens(dashed);
}

/**
 * Langfuse dataset item IDs must be unique at the project level.
 * Prefer explicit `id` from YAML; otherwise fall back to index-based ids namespaced by dataset.
 */
export function routedEvalDatasetItemId(
  datasetName: string,
  explicitId: string | undefined,
  index: number,
): string {
  const slug = slugDatasetNameForItemId(datasetName);
  return explicitId ? `${slug}:${explicitId}` : `${slug}:item-${index + 1}`;
}
