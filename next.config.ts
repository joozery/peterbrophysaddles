import type { NextConfig } from "next";

// Allow optimised images from the R2 public bucket URL (e.g. https://pub-xxxx.r2.dev or https://images.example.com).
const r2Host = (() => { try { return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null; } catch { return null; } })();

const nextConfig: NextConfig = {
  images: { remotePatterns: r2Host ? [{ protocol: "https", hostname: r2Host }] : [] },
  /* config options here */
  cacheComponents: true,
  experimental: {
    agentUpgrade: "security",
  },
  // The old demo inventory page moved into the admin panel.
  async redirects() {
    return [{ source: "/admin/inventory", destination: "/admin/products", permanent: false }];
  },
  partialPrefetching: true,
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
