import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export function getPackageRootPath(): string {
  let currentDir = __dirname;
  return path.resolve(currentDir, "..", "..");
}

export function getProjectRootPath(): string {
  let packageRootPath = getPackageRootPath();
  return path.resolve(packageRootPath, "..", "..");
}
