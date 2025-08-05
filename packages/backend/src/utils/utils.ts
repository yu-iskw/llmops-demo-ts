import path from "path";
import fs from "fs";

export function getPackageRootPath(): string {
  let currentDir = __dirname;
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  throw new Error("Could not find package.json in parent directories.");
}
