import path from "path";
import { fileURLToPath } from "url";

export function getProjectRootPath(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // This will navigate up from `packages/agents/src/utils` to the project root
  return path.resolve(__dirname, "../../../..");
}

export function getPackageRootPath(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // This will navigate up from `packages/agents/src/utils` to `packages/agents`
  return path.resolve(__dirname, "../..");
}
