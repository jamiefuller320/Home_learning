import { cpSync, mkdirSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";

const repoName = process.env.PAGES_REPO_NAME || "Home_learning";
const previewRoot = "pages-preview";

rmSync(previewRoot, { recursive: true, force: true });
mkdirSync(`${previewRoot}/${repoName}`, { recursive: true });
cpSync("out", `${previewRoot}/${repoName}`, { recursive: true });

const port = process.env.PORT || "4173";
const child = spawn("npx", ["serve", previewRoot, "-p", port], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
