import type { Metadata, Viewport } from "next";
import { siteConfig } from "./site-data";
import "./globals.css";

export const metadata: Metadata = {
  ...(siteConfig.origin && { metadataBase: new URL(siteConfig.origin) }),
  title: siteConfig.siteName,
  description: siteConfig.home[siteConfig.defaultLanguage].description,
  ...(siteConfig.isPreview && { robots: { index: false, follow: false } }),
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f2ec",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.lang=location.pathname.split('/')[1]==='en'?'en':'ja';",
          }}
        />
        {children}
      </body>
    </html>
  );
}
