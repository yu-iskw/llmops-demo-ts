import { Annotation } from "@langchain/langgraph";
import { OutputSanitizerStateAnnotation } from "./subagents/output_sanitizer/outputSanitizerState";

/** Routing domain selected after classification. */
export type RoutedDomain = "trip" | "finance" | "general";

const RoutedAgentSpecificAnnotations = {
  route: Annotation<RoutedDomain | undefined>(),
  retry_count: Annotation<number>({
    default: () => 0,
    reducer: (a, b) => b,
  }),
  max_retries: Annotation<number>({
    default: () => 3,
    reducer: (a, b) => b,
  }),
};

/** Includes common agent fields, output-sanitizer fields, and route. */
export const RoutedAgentStateAnnotation = Annotation.Root({
  ...OutputSanitizerStateAnnotation.spec,
  ...RoutedAgentSpecificAnnotations,
});

export type RoutedAgentState = typeof RoutedAgentStateAnnotation.State;
