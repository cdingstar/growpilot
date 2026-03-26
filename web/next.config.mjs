/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Docker 部署所需

  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? "0.1.0",
    NEXT_PUBLIC_BUILD_TIME:
      process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString(),
    NEXT_PUBLIC_BUILD_HHMM: (() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      return `${hh}${mm}`;
    })(),
  },

  // 开发时代理到 Go 后端（可选，也可以直接用环境变量）
  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
