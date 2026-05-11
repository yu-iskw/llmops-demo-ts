import type { Example, Run } from "langsmith";

/**
 * Shared exact-match on route for LangSmith evaluators (router + E2E YAML shapes).
 */
export function routedAgentRouteExactMatchLangSmith(
  run: Run,
  example?: Example,
): { key: string; score: number; comment: string } {
  const actual = (run.outputs as { route?: unknown } | undefined)?.route;
  const reference = example?.outputs as
    | { route?: unknown; expected_route?: unknown }
    | undefined;
  const expected = reference?.expected_route ?? reference?.route;
  const score = actual === expected ? 1 : 0;
  const comment = `Expected route: ${expected}, Actual route: ${actual}`;
  return { key: "route_exact_match", score, comment };
}
