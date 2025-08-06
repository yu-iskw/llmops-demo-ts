import path, { dirname } from "path";
import { fileURLToPath } from "url";

export function getPackageRootPath(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  let currentDir = __dirname;
  return path.resolve(currentDir, "..", "..");
}

export function getProjectRootPath(): string {
  let packageRootPath = getPackageRootPath();
  return path.resolve(packageRootPath, "..", "..");
}
