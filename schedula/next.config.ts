import type { NextConfig } from "next";

const nextConfig = {
  async redirects() {
    return [
      {
        source: "/(.*)",
        destination: "https://schedula-kig2.onrender.com/$1",
        permanent: true,
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
