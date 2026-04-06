/**
 * Default Vertex model for route classification. Override with env
 * `ROUTED_AGENT_ROUTER_MODEL`. This preview ID is **global**; use
 * `GOOGLE_CLOUD_LOCATION=global` with Vertex (see routed agent README).
 */
const DEFAULT_ROUTED_AGENT_ROUTER_MODEL = "gemini-3.1-flash-lite-preview";

/**
 * Default Vertex model for the output sanitizer (`checkOutput`). Override with env
 * `ROUTED_AGENT_SANITIZER_MODEL`. Same global preview as the router by default.
 */
const DEFAULT_ROUTED_AGENT_SANITIZER_MODEL = "gemini-3.1-flash-lite-preview";

/** Model for route classification (cheap / fast). */
export const ROUTED_AGENT_ROUTER_MODEL =
  process.env.ROUTED_AGENT_ROUTER_MODEL?.trim() ||
  DEFAULT_ROUTED_AGENT_ROUTER_MODEL;

/** Model for final output safety check (fixed per product requirements). */
export const ROUTED_AGENT_SANITIZER_MODEL =
  process.env.ROUTED_AGENT_SANITIZER_MODEL?.trim() ||
  DEFAULT_ROUTED_AGENT_SANITIZER_MODEL;

const DEFAULT_ROUTED_AGENT_SPECIALIST_EVAL_MODEL = "gemini-2.5-flash";

/** Model for trip/finance/general specialists in runtime and LangSmith specialist eval. */
export const ROUTED_AGENT_SPECIALIST_EVAL_MODEL =
  process.env.ROUTED_AGENT_SPECIALIST_EVAL_MODEL?.trim() ||
  DEFAULT_ROUTED_AGENT_SPECIALIST_EVAL_MODEL;
