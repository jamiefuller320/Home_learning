import type { NextConfig } from "next";

const pagesEnabled = process.env.GITHUB_PAGES === "true";
const repoName =
  process.env.PAGES_REPO_NAME || process.env.GITHUB_REPOSITORY?.split("/")[1] || "Home_learning";
const basePath = pagesEnabled ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(basePath
    ? {
        basePath,
        assetPrefix: `${basePath}/`,
      }
    : {}),
};

export default nextConfig;
