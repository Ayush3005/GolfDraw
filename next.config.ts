import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  devIndicators: false,
};

export default nextConfig;
