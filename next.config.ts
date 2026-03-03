import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow Teams to embed this app in an iframe
          {
            key: "Content-Security-Policy",
            value: [
              "frame-ancestors 'self' https://teams.microsoft.com https://*.teams.microsoft.com https://*.office.com https://*.office365.com https://outlook.live.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
  // Required to allow @react-pdf/renderer to work server-side
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
