import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://ipl-v2-dev-operator.nuratech.id/api/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
