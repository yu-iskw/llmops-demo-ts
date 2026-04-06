# Routed agent

Routes each user turn to a **trip**, **finance**, or **general** specialist (LangChain `createAgent`), then runs an output check using `ROUTED_AGENT_SANITIZER_MODEL`. Route classification uses `ROUTED_AGENT_ROUTER_MODEL`. Specialist agents and subgraphs live under [`subagents/`](subagents/) (mirroring [`secure_agent/subagents`](../secure_agent/subagents)): [`router/routerNodes.ts`](subagents/router/routerNodes.ts) for `classify_route`, [`trip_agent`](subagents/trip_agent/), [`finance_agent`](subagents/finance_agent/), [`general_agent`](subagents/general_agent/), [`output_sanitizer/`](subagents/output_sanitizer/) for the safety check, and shared [`common/routedSpecialistChatModel.ts`](subagents/common/routedSpecialistChatModel.ts) (uses [`resolveGenAIAuth`](../../utils/genai.ts) from [`utils/genai.ts`](../../utils/genai.ts), same rules as `initializeGenAIClient`). Defaults and optional env overrides are defined in [`routedAgentConstants.ts`](routedAgentConstants.ts).

## Graph Architecture

The graph implements a "classify-then-specialist-then-sanitize" pipeline:

1. **`classify_route`**: Classifies the user message into `trip`, `finance`, or `general` domains using `ROUTED_AGENT_ROUTER_MODEL` (Gemini 3.1 Flash-Lite). It uses structured output (JSON mode) for reliable routing decisions.
2. **Specialist Call**: Routes the message to the corresponding specialist (LangChain `createAgent` with ReAct runtime). Specialists are cached in `SpecialistAgentCache` to avoid graph recompilation.
3. **`output_sanitizer`**: Runs a safety/sanitization check on the generated response using a dedicated subgraph and `ROUTED_AGENT_SANITIZER_MODEL`.
4. **`extract_final_response`**: Finalizes the `ai_response` for the user.

```mermaid
graph TD
    START((START)) --> classifyRoute[classify_route]
    classifyRoute -->|route=trip| tripSpecialist[trip_specialist]
    classifyRoute -->|route=finance| financeSpecialist[finance_specialist]
    classifyRoute -->|route=general| generalSpecialist[general_specialist]
    tripSpecialist --> outputSanitizer[output_sanitizer]
    financeSpecialist --> outputSanitizer[output_sanitizer]
    generalSpecialist --> outputSanitizer[output_sanitizer]
    outputSanitizer --> extractFinalResponse[extract_final_response]
    extractFinalResponse --> END((END))
```

## Vertex AI: location and model IDs

**Router** (`ROUTED_AGENT_ROUTER_MODEL`) and **output sanitizer** (`ROUTED_AGENT_SANITIZER_MODEL`) default to **`gemini-3.1-flash-lite-preview`** ([Gemini 3.1 Flash-Lite](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-1-flash-lite)), which is **global** on Vertex. Use **`GOOGLE_CLOUD_LOCATION=global`** with Vertex for those defaults; a regional location (e.g. `us-central1`) can return **404** (`Publisher Model ... was not found`). Override with `ROUTED_AGENT_ROUTER_MODEL` / `ROUTED_AGENT_SANITIZER_MODEL` if you need a model that publishes in your region.

**Specialists** still default to **`gemini-2.5-flash`** via the CLI `-m` / `RoutedAgent` base model unless you pass another ID.

**LangChain specialists (trip / finance / general):** Model construction uses **`resolveGenAIAuth`** from [`utils/genai.ts`](../../utils/genai.ts): Vertex when `GOOGLE_GENAI_USE_VERTEXAI` is set with `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION`; otherwise **`GOOGLE_API_KEY`** for the Gemini Developer API (`ChatGoogleGenerativeAI` / `ChatVertexAI`).

## Offline evaluation (LangSmith)

Evaluations follow the same pattern as the [Secure agent](../secure_agent/README.md): LangSmith datasets, `evaluate()` with a `targetFunction`, and LLM-as-judge where noted.

**Architecture:**

- **Canonical data:** Example inputs/outputs live in YAML files under [`eval/langsmith/datasets/data/`](eval/langsmith/datasets/data/) (e.g., `router.yaml`, `trip_specialist.yaml`). These are framework-neutral and can be reused by other adapters (e.g., LangFuse).
- **Adapters:** LangSmith-specific logic for dataset creation and upload lives in [`eval/langsmith/datasets/langsmith/`](eval/langsmith/datasets/langsmith/).
- **Suites:** **Router**, **output_sanitizer**, and **specialists** keep their evaluation code (target functions and judges) under their respective `subagents/<name>/eval/langsmith/llm_judge/` directories. **End-to-end** evaluation lives under [`eval/langsmith/end_to_end/llm_judge/`](eval/langsmith/end_to_end/llm_judge/).

### Run all suites

Runs router, output sanitizer, trip, finance, general specialists, then end-to-end (in that order).

```bash
pnpm --filter @llmops-demo-ts/agents cli routed-agent eval
```

### Specialist Evaluation

Each specialist agent (trip, finance, general) can be evaluated in isolation.

Example for **trip** specialist:

1. Create or refresh the dataset:

   ```bash
   pnpm --filter @llmops-demo-ts/agents cli routed-agent trip langsmith create-dataset-llm-as-judge
   ```

2. Run the evaluation:
   ```bash
   pnpm --filter @llmops-demo-ts/agents cli routed-agent trip langsmith eval-llm-as-judge
   ```

Replace `trip` with `finance` or `general` for other specialists.

### Router (`classify_route`)

Evaluates domain classification only (trip / finance / general).

1. Create or refresh the dataset:

   ```bash
   pnpm --filter @llmops-demo-ts/agents cli routed-agent router langsmith create-dataset-llm-as-judge
   ```

2. Run the evaluation:
   ```bash
   pnpm --filter @llmops-demo-ts/agents cli routed-agent router langsmith eval-llm-as-judge
   ```

### Output sanitizer

Evaluates the safety check logic in isolation.

1. Create or refresh the dataset:

   ```bash
   pnpm --filter @llmops-demo-ts/agents cli routed-agent output-sanitizer langsmith create-dataset-llm-as-judge
   ```

2. Run the evaluation:
   ```bash
   pnpm --filter @llmops-demo-ts/agents cli routed-agent output-sanitizer langsmith eval-llm-as-judge
   ```

### End-to-end

Evaluates the full graph (router → specialist → output sanitizer).

1. Create or refresh the dataset:

   ```bash
   pnpm --filter @llmops-demo-ts/agents cli routed-agent end-to-end langsmith create-dataset-llm-as-judge
   ```

2. Run the evaluation:
   ```bash
   pnpm --filter @llmops-demo-ts/agents cli routed-agent end-to-end langsmith eval-llm-as-judge
   ```

Set `LANGSMITH_API_KEY` and optionally `LANGCHAIN_PROJECT` / `LANGSMITH_ENDPOINT` as for other agent evals.

### Troubleshooting LangSmith dataset commands

- Use **LANGSMITH_API_KEY** or **LANGCHAIN_API_KEY** (either is accepted; eval dataset scripts normalize both and never clear a valid key).
- **403 Forbidden** on dataset APIs: the key needs permission to list and create datasets in that workspace; verify **LANGSMITH_ENDPOINT** matches your deployment (e.g. regional host). For self-hosted LangSmith, check organization RBAC.

## Run the agent (CLI)

```bash
pnpm --filter @llmops-demo-ts/agents cli routed-agent run -t "Plan a day in Kyoto"
```
