import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "双人健身打卡",
  description: "双人互相监督健身打卡记录 Web App"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
