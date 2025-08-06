import path from "path";

export function getPackageRootPath(): string {
  return path.resolve(__dirname, "..", "..");
}

export function getProjectRootPath(): string {
  let packageRootPath = getPackageRootPath();
  return path.resolve(packageRootPath, "..", "..");
}
