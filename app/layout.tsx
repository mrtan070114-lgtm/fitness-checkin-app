import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { getThemeBootstrapScript, getThemeCssVariables, themeCookieName } from "@/lib/themes";
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
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#126b42"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeColor = cookieStore.get(themeCookieName)?.value;

  return (
    <html lang="zh-CN" style={getThemeCssVariables(themeColor)}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
        {children}
      </body>
    </html>
  );
}
