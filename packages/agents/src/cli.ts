import type { Command } from "commander";
import dotenv from "dotenv";
import { getProjectRootPath } from "./utils/utilities";
import path from "path";

// Load environment variables from the root of the package before any agent module loads.
dotenv.config({
  path: path.resolve(getProjectRootPath(), ".env"),
  debug: true,
});

const CLI_VERSION = "1.0.0";

const AGENT_LOADERS: Record<string, () => Promise<Command>> = {
  "default-agent": async () =>
    (await import("./agents/default_agent/cli.js")).defaultAgentProgram,
  "research-agent": async () =>
    (await import("./agents/research_agent/cli.js")).researchAgentProgram,
  "secure-agent": async () =>
    (await import("./agents/secure_agent/cli.js")).secureAgentProgram,
  "routed-agent": async () =>
    (await import("./agents/routed_agent/cli.js")).routedAgentProgram,
};

function printRootUsage(): void {
  console.log(`llmops-demo-ts ${CLI_VERSION}
CLI for interacting with the LLMOps Demo application

Usage:
  pnpm --filter @llmops-demo-ts/agents cli <agent> [options] [commands]

Agents:
  default-agent    Run the default agent
  research-agent   Run the research agent
  secure-agent     Run the secure agent
  routed-agent     Run the routed multi-specialist agent

Examples:
  pnpm --filter @llmops-demo-ts/agents cli routed-agent --help
`);
}

function isRootHelp(first: string | undefined): boolean {
  return first === undefined || first === "--help" || first === "-h";
}

async function main(): Promise<void> {
  const argv = process.argv;
  const first = argv[2];

  if (first === "--version" || first === "-V") {
    console.log(CLI_VERSION);
    return;
  }

  if (isRootHelp(first)) {
    printRootUsage();
    return;
  }

  const loader = AGENT_LOADERS[first];
  if (!loader) {
    console.error(`Unknown command: ${first}`);
    printRootUsage();
    process.exitCode = 1;
    return;
  }

  const subProgram = await loader();
  await subProgram.parseAsync(argv.slice(1));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
