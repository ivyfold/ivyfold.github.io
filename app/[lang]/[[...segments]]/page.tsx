import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AppPage, HomePage, LegalPage, SupportPage } from "../../site-ui";
import {
  apps,
  isAppSlug,
  isLanguage,
  siteConfig,
  supportedLanguages,
  type Language,
} from "../../site-data";

type RouteParams = {
  lang: string;
  segments?: string[];
};

const routeSegments = [
  [],
  ["apps", "leafia"],
  ["apps", "widgetplay"],
  ["support", "leafia"],
  ["support", "widgetplay"],
  ["privacy", "leafia"],
  ["privacy", "widgetplay"],
  ["terms", "leafia"],
  ["terms", "widgetplay"],
];

export function generateStaticParams() {
  return supportedLanguages.flatMap((lang) =>
    routeSegments.map((segments) => ({ lang, segments })),
  );
}

async function requestOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  if (!host) return siteConfig.origin;
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}`;
}

function pageIdentity(language: Language, segments: string[]) {
  const isJapanese = language === "ja";
  if (segments.length === 0) {
    return {
      title: isJapanese
        ? `${siteConfig.siteName} — 暮らしと遊びに、小さな心地よさを。`
        : `${siteConfig.siteName} — Small moments of ease, for life and play.`,
      description: isJapanese
        ? "Leafia、WidgetPlayなど、個人開発のiOSアプリを紹介する公式サイトです。"
        : "The official home of independent iOS apps including Leafia and WidgetPlay.",
    };
  }

  const [section, appSlug] = segments;
  if (!isAppSlug(appSlug ?? "")) return null;
  const app = apps[appSlug as keyof typeof apps];
  if (section === "apps") {
    return {
      title: `${app.name} — ${app.tagline[language]}`,
      description: app.summary[language],
    };
  }
  if (section === "support") {
    return {
      title: `${app.name} ${isJapanese ? "サポート" : "Support"} — ${siteConfig.siteName}`,
      description: isJapanese
        ? `${app.name}のよくある質問、購入復元、データ管理に関するサポート情報です。`
        : `Support for ${app.name}, including common questions, purchase restoration and data management.`,
    };
  }
  if (section === "privacy" || section === "terms") {
    const label =
      section === "privacy"
        ? isJapanese
          ? "プライバシーポリシー"
          : "Privacy Policy"
        : isJapanese
          ? "利用規約"
          : "Terms of Service";
    return {
      title: `${app.name} ${label} — ${siteConfig.siteName}`,
      description: `${app.name} ${label}`,
    };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { lang, segments = [] } = await params;
  if (!isLanguage(lang)) return {};
  const identity = pageIdentity(lang, segments);
  if (!identity) return {};

  const origin = await requestOrigin();
  const pathname = `/${lang}${segments.length ? `/${segments.join("/")}` : ""}`;
  const otherLanguage = lang === "ja" ? "en" : "ja";
  const otherPath = `/${otherLanguage}${segments.length ? `/${segments.join("/")}` : ""}`;

  return {
    title: identity.title,
    description: identity.description,
    alternates: {
      canonical: `${origin}${pathname}`,
      languages: {
        ja: `${origin}${lang === "ja" ? pathname : otherPath}`,
        en: `${origin}${lang === "en" ? pathname : otherPath}`,
      },
    },
    openGraph: {
      title: identity.title,
      description: identity.description,
      type: "website",
      locale: lang === "ja" ? "ja_JP" : "en_US",
      url: `${origin}${pathname}`,
      siteName: siteConfig.siteName,
      images: [
        {
          url: `${origin}/og-ivyfold-v3.png`,
          width: 1200,
          height: 630,
          alt: siteConfig.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: identity.title,
      description: identity.description,
      images: [`${origin}/og-ivyfold-v3.png`],
    },
  };
}

export default async function LocalizedRoute({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { lang, segments = [] } = await params;
  if (!isLanguage(lang)) notFound();
  const language = lang as Language;

  if (segments.length === 0) {
    return <HomePage language={language} />;
  }

  const [section, appSlug, ...rest] = segments;
  if (rest.length || !isAppSlug(appSlug ?? "")) notFound();
  const app = apps[appSlug as keyof typeof apps];

  if (section === "apps") return <AppPage language={language} app={app} />;
  if (section === "support") return <SupportPage language={language} app={app} />;
  if (section === "privacy" || section === "terms") {
    return <LegalPage language={language} app={app} kind={section} />;
  }

  notFound();
}
