import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Include engine spec files and exercise library JSON in the serverless bundle.
  // outputFileTracingRoot = repo root so paths like packages/engine/ are traced correctly.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  experimental: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outputFileTracingIncludes: {
      "/api/generate": [
        "../../packages/engine/*.md",
        "../../apps/api/data/*.json",
      ],
    },
  } as any,
};

export default nextConfig;
