import type { Metadata } from "next";
import "./globals.css";

const now = new Date();
const pad = (n: number) => n.toString().padStart(2, "0");
const HHMM = `${pad(now.getHours())}${pad(now.getMinutes())}`;

export const metadata: Metadata = {
  title: `GrowPilot (${HHMM})`,
  description: "Build Growth Once, Scale Everywhere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
