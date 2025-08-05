import path from "path";
import fs from "fs";

export function getPackageRootPath(): string {
  let currentDir = __dirname;
  return path.resolve(currentDir, "..", "..");
}

export function getProjectRootPath(): string {
  let packageRootPath = getPackageRootPath();
  return path.resolve(packageRootPath, "..", "..");
}
