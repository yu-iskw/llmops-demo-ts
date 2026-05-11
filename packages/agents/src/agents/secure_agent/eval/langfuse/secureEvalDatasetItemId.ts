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
export function slugSecureDatasetNameForItemId(datasetName: string): string {
  const dashed = datasetName.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  return trimEdgeHyphens(dashed);
}

/**
 * Langfuse dataset item IDs must be unique at the project level.
 * Prefer explicit `id` when provided; otherwise index-based ids namespaced by dataset.
 */
export function secureEvalDatasetItemId(
  datasetName: string,
  explicitId: string | undefined,
  index: number,
): string {
  const slug = slugSecureDatasetNameForItemId(datasetName);
  return explicitId ? `${slug}:${explicitId}` : `${slug}:item-${index + 1}`;
}
