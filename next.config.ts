import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // test trên điện thoại qua LAN khi dev
  allowedDevOrigins: ["192.168.137.1"],
};

export default nextConfig;
