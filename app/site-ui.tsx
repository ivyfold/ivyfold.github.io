import Link from "next/link";
import { apps, siteConfig, type AppProfile, type Language } from "./site-data";

const copy = {
  ja: {
    apps: "アプリ",
    philosophy: "つくる理由",
    support: "サポート",
    menu: "メニュー",
    homeEyebrow: "INDEPENDENT APPS FOR EVERYDAY LIFE",
    homeTitleLead: "暮らしと遊びに、",
    homeTitleAccent: "小さな心地よさを。",
    homeIntro:
      "毎日の植物との時間も、ホーム画面のちょっとした遊びも。使うたびに手になじむ、静かで楽しいアプリをつくっています。",
    viewApp: "アプリを見る",
    comingSoon: "近日公開",
    featured: "FEATURED APPS",
    principles: "DESIGN PRINCIPLES",
    principlesTitle: "機能だけではなく、\n触れる時間まで設計する。",
    principleItems: [
      ["01", "毎日に自然に入る", "目立ちすぎず、必要な瞬間にすぐ使えること。"],
      ["02", "情報をきれいに整える", "迷いを減らし、いま大切なことが見えること。"],
      ["03", "長く使える品質", "アクセシビリティと細部を、最初から大切にすること。"],
    ],
    next: "NEXT",
    nextTitle: "次のアプリも、ここに。",
    nextBody:
      "新しいアイデアを形にするたび、この場所に追加していきます。異なるアプリを、ひとつの丁寧な体験でつなぎます。",
    appOverview: "OVERVIEW",
    features: "FEATURES",
    gallery: "IN THE APP",
    details: "AT A GLANCE",
    getApp: "App Storeで見る",
    marketingNotice: "App Storeでの公開準備中です",
    supportLink: "サポートを見る",
    privacy: "プライバシー",
    terms: "利用規約",
    supportEyebrow: "SUPPORT",
    supportTitle: "よくある質問とサポート",
    supportIntro:
      "まずは下の項目をご確認ください。サポートメールの公開後は、このページから直接お問い合わせいただけます。",
    contactUnavailable: "お問い合わせ窓口は現在準備中です。",
    legalUpdated: "最終更新日：2026年7月29日",
    allApps: "すべてのアプリ",
  },
  en: {
    apps: "Apps",
    philosophy: "Our approach",
    support: "Support",
    menu: "Menu",
    homeEyebrow: "INDEPENDENT APPS FOR EVERYDAY LIFE",
    homeTitleLead: "Small moments of ease,",
    homeTitleAccent: "for life and play.",
    homeIntro:
      "From caring for plants to a quick game on your Home Screen, we make calm, playful apps that feel more natural every time you use them.",
    viewApp: "Explore app",
    comingSoon: "Coming soon",
    featured: "FEATURED APPS",
    principles: "DESIGN PRINCIPLES",
    principlesTitle: "We design more than features.\nWe design the time you spend.",
    principleItems: [
      ["01", "A natural part of the day", "Present when needed, quiet when not."],
      ["02", "Clarity over noise", "Less searching, with the right detail in view."],
      ["03", "Quality that lasts", "Accessibility and thoughtful details from day one."],
    ],
    next: "NEXT",
    nextTitle: "The next app will live here, too.",
    nextBody:
      "As new ideas become real, they will join this collection—different products connected by one thoughtful experience.",
    appOverview: "OVERVIEW",
    features: "FEATURES",
    gallery: "IN THE APP",
    details: "AT A GLANCE",
    getApp: "View on the App Store",
    marketingNotice: "Preparing for App Store release",
    supportLink: "View support",
    privacy: "Privacy",
    terms: "Terms",
    supportEyebrow: "SUPPORT",
    supportTitle: "Questions and support",
    supportIntro:
      "Start with the answers below. Once the public support email is ready, you will be able to contact us directly from this page.",
    contactUnavailable: "The contact channel is currently being prepared.",
    legalUpdated: "Last updated: July 29, 2026",
    allApps: "All apps",
  },
} as const;

function otherLanguage(language: Language): Language {
  return language === "ja" ? "en" : "ja";
}

function switchLanguagePath(language: Language, segments: string[] = []) {
  return `/${otherLanguage(language)}${segments.length ? `/${segments.join("/")}` : ""}`;
}

type BackdropVariant = "hero" | "collection" | "product" | "quiet";

const backdropSources: Record<BackdropVariant, string> = {
  hero: "/assets/brand/hero-paper-light-v2.webp",
  collection: "/assets/brand/collection-paper-light-v2.webp",
  product: "/assets/brand/product-paper-light-v2.webp",
  quiet: "/assets/brand/quiet-paper-light-v2.webp",
};

export function DecorativeBackdrop({
  variant,
  priority = false,
}: {
  variant: BackdropVariant;
  priority?: boolean;
}) {
  return (
    <div className={`decorative-backdrop backdrop-${variant}`} aria-hidden="true">
      <img
        src={backdropSources[variant]}
        alt=""
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}

export function SiteHeader({
  language,
  segments = [],
}: {
  language: Language;
  segments?: string[];
}) {
  const t = copy[language];

  return (
    <header className="site-header">
      <Link className="brand" href={`/${language}`} aria-label={`${siteConfig.siteName} home`}>
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>{siteConfig.siteName}</span>
      </Link>
      <nav className="main-nav" aria-label={t.menu}>
        <Link href={`/${language}#apps`}>{t.apps}</Link>
        <Link href={`/${language}#approach`}>{t.philosophy}</Link>
        <Link href={`/${language}/support/leafia`}>{t.support}</Link>
      </nav>
      <Link
        className="language-switch"
        href={switchLanguagePath(language, segments)}
        hrefLang={otherLanguage(language)}
        aria-label={language === "ja" ? "Switch to English" : "日本語に切り替え"}
      >
        {language === "ja" ? "EN" : "JA"}
      </Link>
    </header>
  );
}

export function SiteFooter({ language }: { language: Language }) {
  const t = copy[language];
  return (
    <footer className="site-footer">
      <div className="footer-lead">
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>{siteConfig.siteName}</span>
        </div>
        <p>
          {language === "ja"
            ? "暮らしと遊びに、小さな心地よさを。"
            : "Small moments of ease, for life and play."}
        </p>
      </div>
      <div className="footer-links">
        {(Object.values(apps) as AppProfile[]).map((app) => (
          <div key={app.slug}>
            <strong>{app.name}</strong>
            <Link href={`/${language}/apps/${app.slug}`}>{t.apps}</Link>
            <Link href={`/${language}/support/${app.slug}`}>{t.support}</Link>
            <Link href={`/${language}/privacy/${app.slug}`}>{t.privacy}</Link>
            <Link href={`/${language}/terms/${app.slug}`}>{t.terms}</Link>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© 2026 {siteConfig.siteName}</span>
        <span>Designed with care in Japan.</span>
      </div>
    </footer>
  );
}

function AppPreviewCard({
  app,
  language,
  featured = false,
}: {
  app: AppProfile;
  language: Language;
  featured?: boolean;
}) {
  const t = copy[language];
  return (
    <article className={`app-preview app-${app.accent} ${featured ? "app-preview-featured" : ""}`}>
      <div className="preview-topline">
        <span>{app.eyebrow[language]}</span>
        <span>{app.platform[language]}</span>
      </div>
      <div className="preview-copy">
        <img className="app-icon" src={app.icon} alt="" width="96" height="96" />
        <div>
          <h3>{app.name}</h3>
          <p>{app.tagline[language]}</p>
        </div>
      </div>
      <div className="preview-visual" aria-hidden="true">
        {app.slug === "leafia" ? (
          <>
            <div className="preview-orb preview-orb-leaf" />
            <div className="phone phone-preview phone-preview-left">
              <img src={app.screenshots[0].src} alt="" />
            </div>
            <div className="phone phone-preview phone-preview-right">
              <img src={app.screenshots[1].src} alt="" />
            </div>
          </>
        ) : (
          <>
            <div className="preview-grid">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="phone phone-preview phone-preview-center">
              <img src={app.screenshots[0].src} alt="" />
            </div>
          </>
        )}
      </div>
      <Link className="text-link" href={`/${language}/apps/${app.slug}`}>
        {t.viewApp}
        <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}

export function HomePage({ language }: { language: Language }) {
  const t = copy[language];
  return (
    <>
      <SiteHeader language={language} />
      <main>
        <section className="home-hero section-shell">
          <DecorativeBackdrop variant="hero" priority />
          <div className="hero-kicker reveal">
            <span className="kicker-line" />
            {t.homeEyebrow}
          </div>
          <h1 className="display-title reveal reveal-delay-1">
            <span>{t.homeTitleLead}</span>
            <em>{t.homeTitleAccent}</em>
          </h1>
          <div className="hero-bottom reveal reveal-delay-2">
            <p>{t.homeIntro}</p>
            <div className="hero-signature" aria-hidden="true">
              <span>CARE</span>
              <i />
              <span>PLAY</span>
            </div>
          </div>
        </section>

        <section className="apps-section section-shell" id="apps">
          <DecorativeBackdrop variant="collection" />
          <div className="section-heading">
            <span className="section-index">01</span>
            <p>{t.featured}</p>
            <h2>
              {language === "ja" ? "ふたつのアプリ、\nふたつの過ごし方。" : "Two apps.\nTwo kinds of everyday moments."}
            </h2>
          </div>
          <div className="app-preview-grid">
            <AppPreviewCard app={apps.leafia} language={language} featured />
            <AppPreviewCard app={apps.widgetplay} language={language} />
          </div>
        </section>

        <section className="approach-section section-shell" id="approach">
          <div className="approach-intro">
            <span className="section-index">02</span>
            <p>{t.principles}</p>
            <h2>{t.principlesTitle}</h2>
          </div>
          <div className="principle-list">
            {t.principleItems.map(([number, title, body]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="next-section section-shell">
          <div className="next-card">
            <div>
              <span className="eyebrow">{t.next}</span>
              <h2>{t.nextTitle}</h2>
              <p>{t.nextBody}</p>
            </div>
            <div className="next-symbol" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter language={language} />
    </>
  );
}

export function AppPage({ language, app }: { language: Language; app: AppProfile }) {
  const t = copy[language];
  const segments = ["apps", app.slug];
  return (
    <>
      <SiteHeader language={language} segments={segments} />
      <main className={`app-page app-page-${app.accent}`}>
        <section className="product-hero section-shell">
          <DecorativeBackdrop variant="product" priority />
          <div className="product-copy reveal">
            <span className="eyebrow">{app.eyebrow[language]}</span>
            <div className="product-name">
              <img className="app-icon app-icon-large" src={app.icon} alt="" width="120" height="120" />
              <h1>{app.name}</h1>
            </div>
            <h2>{app.tagline[language]}</h2>
            <p>{app.summary[language]}</p>
            <div className="product-actions">
              {app.appStoreUrl ? (
                <a className="button button-primary" href={app.appStoreUrl}>
                  {t.getApp}
                </a>
              ) : (
                <span className="button button-disabled" aria-label={t.marketingNotice}>
                  {t.comingSoon}
                </span>
              )}
              <Link className="button button-secondary" href={`/${language}/support/${app.slug}`}>
                {t.supportLink}
              </Link>
            </div>
          </div>
          <div className="product-visual" aria-label={`${app.name} screenshots`}>
            <div className="product-halo" />
            <div className="phone product-phone product-phone-main">
              <img src={app.screenshots[0].src} alt={app.screenshots[0].alt[language]} />
            </div>
            <div className="phone product-phone product-phone-side">
              <img src={app.screenshots[1].src} alt={app.screenshots[1].alt[language]} />
            </div>
          </div>
        </section>

        <section className="feature-section section-shell">
          <div className="section-heading compact">
            <span className="section-index">01</span>
            <p>{t.features}</p>
            <h2>
              {language === "ja" ? "毎日の中で、\nちゃんと役立つ。" : "Designed to feel useful,\nevery single day."}
            </h2>
          </div>
          <div className="feature-grid">
            {app.features.map((feature) => (
              <article key={feature.title.en}>
                <span className="feature-mark">{feature.mark}</span>
                <h3>{feature.title[language]}</h3>
                <p>{feature.body[language]}</p>
              </article>
            ))}
          </div>
        </section>

        {app.slug === "widgetplay" && (
          <section className="theme-ribbon section-shell" aria-label={language === "ja" ? "テーマ見本" : "Theme samples"}>
            <div className="theme-copy">
              <span className="eyebrow">THEMES</span>
              <h2>{language === "ja" ? "ゲームの空気まで、着せ替える。" : "Change the entire atmosphere."}</h2>
            </div>
            <div className="theme-samples" aria-hidden="true">
              <i className="theme-cosmos" />
              <i className="theme-minimal" />
              <i className="theme-pastel" />
              <i className="theme-wood" />
              <i className="theme-drawn" />
            </div>
          </section>
        )}

        <section className="gallery-section section-shell">
          <div className="gallery-heading">
            <span className="section-index">02</span>
            <p>{t.gallery}</p>
          </div>
          <div className={`screenshot-gallery gallery-${app.slug}`}>
            {app.screenshots.map((shot, index) => (
              <figure key={shot.src} className={`gallery-shot gallery-shot-${(index % 3) + 1}`}>
                <div className="phone">
                  <img src={shot.src} alt={shot.alt[language]} loading="lazy" />
                </div>
                <figcaption>{String(index + 1).padStart(2, "0")} / {String(app.screenshots.length).padStart(2, "0")}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="facts-section section-shell">
          <div className="facts-intro">
            <span className="section-index">03</span>
            <p>{t.details}</p>
            <h2>{app.name}</h2>
          </div>
          <ul>
            {app.facts.map((fact) => (
              <li key={fact.en}>
                <span>{fact[language]}</span>
                <i aria-hidden="true">↗</i>
              </li>
            ))}
          </ul>
        </section>

        <section className="product-closing section-shell">
          <img className="app-icon" src={app.icon} alt="" width="96" height="96" />
          <h2>{app.tagline[language]}</h2>
          <p>{app.summary[language]}</p>
          <div className="product-actions">
            <Link className="button button-primary" href={`/${language}/support/${app.slug}`}>
              {t.supportLink}
            </Link>
            <Link className="text-link" href={`/${language}`}>
              {t.allApps} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter language={language} />
    </>
  );
}

export function SupportPage({
  language,
  app,
}: {
  language: Language;
  app: AppProfile;
}) {
  const t = copy[language];
  const segments = ["support", app.slug];
  return (
    <>
      <SiteHeader language={language} segments={segments} />
      <main className="support-page section-shell">
        <DecorativeBackdrop variant="quiet" />
        <header className="page-intro">
          <Link className="breadcrumb" href={`/${language}/apps/${app.slug}`}>
            ← {app.name}
          </Link>
          <span className="eyebrow">{t.supportEyebrow}</span>
          <div className="support-title-row">
            <img className="app-icon" src={app.icon} alt="" width="88" height="88" />
            <div>
              <h1>{app.name}</h1>
              <h2>{t.supportTitle}</h2>
            </div>
          </div>
          <p>{t.supportIntro}</p>
        </header>
        <section className="faq-list" aria-label={t.supportTitle}>
          {app.faq.map((item, index) => (
            <details key={item.question.en} open={index === 0}>
              <summary>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.question[language]}
                <i aria-hidden="true">＋</i>
              </summary>
              <p>{item.answer[language]}</p>
            </details>
          ))}
        </section>
        <section className="contact-card">
          <div>
            <span className="eyebrow">CONTACT</span>
            <h2>{siteConfig.supportEmail ?? t.contactUnavailable}</h2>
          </div>
          {siteConfig.supportEmail && (
            <a className="button button-primary" href={`mailto:${siteConfig.supportEmail}?subject=${app.name}%20Support`}>
              {siteConfig.supportEmail}
            </a>
          )}
        </section>
        <nav className="support-legal-links" aria-label={`${app.name} legal`}>
          <Link href={`/${language}/privacy/${app.slug}`}>
            {t.privacy} <span aria-hidden="true">↗</span>
          </Link>
          <Link href={`/${language}/terms/${app.slug}`}>
            {t.terms} <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </main>
      <SiteFooter language={language} />
    </>
  );
}

export function LegalPage({
  language,
  app,
  kind,
}: {
  language: Language;
  app: AppProfile;
  kind: "privacy" | "terms";
}) {
  const t = copy[language];
  const document = app[kind][language];
  const title = kind === "privacy" ? t.privacy : t.terms;
  const segments = [kind, app.slug];
  return (
    <>
      <SiteHeader language={language} segments={segments} />
      <main className="legal-page section-shell">
        <DecorativeBackdrop variant="quiet" />
        <header className="legal-header">
          <Link className="breadcrumb" href={`/${language}/support/${app.slug}`}>
            ← {app.name} {t.support}
          </Link>
          <span className="eyebrow">{kind.toUpperCase()}</span>
          <h1>{app.name}</h1>
          <h2>{title}</h2>
          <p className="legal-date">{t.legalUpdated}</p>
          <p className="legal-intro">{document.introduction}</p>
        </header>
        <article className="legal-document">
          {document.sections.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter language={language} />
    </>
  );
}

export function NotFoundPage({ language }: { language: Language }) {
  return (
    <>
      <SiteHeader language={language} />
      <main className="not-found section-shell">
        <DecorativeBackdrop variant="quiet" />
        <span className="eyebrow">404</span>
        <h1>{language === "ja" ? "ページが見つかりません。" : "This page could not be found."}</h1>
        <Link className="button button-primary" href={`/${language}`}>
          {language === "ja" ? "ホームへ戻る" : "Back home"}
        </Link>
      </main>
      <SiteFooter language={language} />
    </>
  );
}
