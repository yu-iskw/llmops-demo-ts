import { getPackageRootPath, getProjectRootPath } from "./utils";
import path from "path";
import fs from "fs";

describe("getPackageRootPath", () => {
  it("should return the correct package root path", () => {
    const packageRootPath = getPackageRootPath();
    expect(packageRootPath).toContain(path.join("packages", "backend"));
  });
});

describe("getProjectRootPath", () => {
  it("should return the correct project root path", () => {
    const projectRootPath = getProjectRootPath();
    expect(fs.existsSync(path.join(projectRootPath, "pnpm-workspace.yaml"))).toBeTruthy();
  });
});
