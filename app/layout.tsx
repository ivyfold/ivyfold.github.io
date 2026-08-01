import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ivyfold",
  description:
    "Leafia、WidgetPlayなど、個人開発のiOSアプリを紹介する公式サイトです。",
  icons: {
    icon: "/assets/widgetplay/icon.png",
    apple: "/assets/widgetplay/icon.png",
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
