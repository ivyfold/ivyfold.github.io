import type { Metadata } from "next";
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
  ["apps", "studyseed"],
  ["support", "leafia"],
  ["support", "widgetplay"],
  ["support", "studyseed"],
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

function pageIdentity(language: Language, segments: string[]) {
  const isJapanese = language === "ja";
  if (segments.length === 0) {
    const { title, description } = siteConfig.home[language];
    return { title: `${siteConfig.siteName} | ${title}`, description };
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
    if (!app[section]) return null;
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

  const { origin } = siteConfig;
  const sectionPath = segments.length ? `/${segments.join("/")}` : "";
  const trailingSlash = process.env.GITHUB_PAGES === "1" ? "/" : "";
  const pathname = `/${lang}${sectionPath}${trailingSlash}`;
  const otherLanguage = lang === "ja" ? "en" : "ja";
  const otherPath = `/${otherLanguage}${sectionPath}${trailingSlash}`;
  const socialImage = origin ? `${origin}/assets/museum/ivy-rotunda.jpg` : null;

  return {
    title: identity.title,
    description: identity.description,
    ...(origin && {
      alternates: {
        canonical: `${origin}${pathname}`,
        languages: {
          ja: `${origin}${lang === "ja" ? pathname : otherPath}`,
          en: `${origin}${lang === "en" ? pathname : otherPath}`,
        },
      },
    }),
    openGraph: {
      title: identity.title,
      description: identity.description,
      type: "website",
      locale: lang === "ja" ? "ja_JP" : "en_US",
      siteName: siteConfig.siteName,
      ...(origin && { url: `${origin}${pathname}` }),
      ...(socialImage && {
        images: [{
          url: socialImage,
          width: 1536,
          height: 1024,
          alt: siteConfig.siteName,
        }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: identity.title,
      description: identity.description,
      ...(socialImage && { images: [socialImage] }),
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
    if (!app[section]) notFound();
    return <LegalPage language={language} app={app} kind={section} />;
  }

  notFound();
}
