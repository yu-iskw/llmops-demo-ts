import path from "path";
import { fileURLToPath } from "url";

export function getProjectRootPath(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // This will navigate up from `packages/common/src/utils` to the project root
  return path.resolve(__dirname, "../../../..");
}

export function getPackageRootPath(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // This will navigate up from `packages/common/src/utils` to `packages/common`
  return path.resolve(__dirname, "../..");
}
