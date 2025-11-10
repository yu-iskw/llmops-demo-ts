import path from "path";

export function getProjectRootPath(): string {
  // This will navigate up from `packages/common/dist/utils` to the project root
  return path.resolve(__dirname, "../../../..");
}

export function getPackageRootPath(): string {
  // This will navigate up from `packages/common/dist/utils` to `packages/common`
  return path.resolve(__dirname, "../..");
}
