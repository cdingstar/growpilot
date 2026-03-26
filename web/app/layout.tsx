import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: `GrowPilot${process.env.NEXT_PUBLIC_BUILD_HHMM ? `(${process.env.NEXT_PUBLIC_BUILD_HHMM})` : ""} MVP`,
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
