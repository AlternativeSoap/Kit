import type { NextConfig } from "next";

/** Set by the GitHub Pages workflow so local `next dev` stays on `/`. */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath: "/Kit",
        assetPrefix: "/Kit/",
        trailingSlash: true,
        // Static export cannot use the Cache Components runtime.
        cacheComponents: false,
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
