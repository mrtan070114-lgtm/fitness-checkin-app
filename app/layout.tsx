import type { Metadata, Viewport } from "next";
import { getThemeBootstrapScript } from "@/lib/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "TnT健身日记",
  description: "TnT健身日记，双人互相监督健身记录 Web App",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "TnT健身日记",
    statusBarStyle: "default"
  },
  icons: {
    shortcut: [{ url: "/favicon.ico" }],
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#126b42"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <script dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
        {children}
      </body>
    </html>
  );
}
