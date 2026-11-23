import Link from "next/link";
import { apps, siteConfig, type AppProfile, type Language, type LegalDocument } from "./site-data";
import { LeafiaScrollMotion } from "./leafia-scroll-motion";
import { MuseumExperience } from "./museum/MuseumExperience";

const copy = {
  ja: {
    apps: "アプリ",
    support: "サポート",
    menu: "メニュー",
    comingSoon: "近日公開",
    nextTitle: "次のアプリも、ここに。",
    nextBody:
      "新しいアイデアを形にするたび、この場所に追加していきます。異なるアプリを、ひとつの丁寧な体験でつなぎます。",
    appOverview: "OVERVIEW",
    features: "FEATURES",
    gallery: "IN THE APP",
    details: "AT A GLANCE",
    getApp: "App Storeでダウンロード",
    marketingNotice: "App Storeでの公開準備中です",
    supportLink: "サポートを見る",
    privacy: "プライバシー",
    terms: "利用規約",
    supportEyebrow: "SUPPORT",
    supportTitle: "よくある質問とサポート",
    supportIntro:
      "まずは下の項目をご確認ください。サポートメールの公開後は、このページから直接お問い合わせいただけます。",
    supportIntroAvailable:
      "まずは下の項目をご確認ください。解決しない場合は、ページ下部のメールからお問い合わせいただけます。",
    contactUnavailable: "お問い合わせ窓口は現在準備中です。",
    contactTitle: "お問い合わせ",
    legalUpdated: "最終更新日：2026年7月29日",
    allApps: "すべてのアプリ",
  },
  en: {
    apps: "Apps",
    support: "Support",
    menu: "Menu",
    comingSoon: "Coming soon",
    nextTitle: "The next app will live here, too.",
    nextBody:
      "As new ideas become real, they will join this collection—different products connected by one thoughtful experience.",
    appOverview: "OVERVIEW",
    features: "FEATURES",
    gallery: "IN THE APP",
    details: "AT A GLANCE",
    getApp: "Download on the App Store",
    marketingNotice: "Preparing for App Store release",
    supportLink: "View support",
    privacy: "Privacy",
    terms: "Terms",
    supportEyebrow: "SUPPORT",
    supportTitle: "Questions and support",
    supportIntro:
      "Start with the answers below. Once the public support email is ready, you will be able to contact us directly from this page.",
    supportIntroAvailable:
      "Start with the answers below. If you still need help, contact us using the email at the bottom of this page.",
    contactUnavailable: "The contact channel is currently being prepared.",
    contactTitle: "Contact",
    legalUpdated: "Last updated: July 29, 2026",
    allApps: "All apps",
  },
} as const;

function otherLanguage(language: Language): Language {
  return language === "ja" ? "en" : "ja";
}

function screenshotSrc(shot: AppProfile["screenshots"][number], language: Language) {
  return language === "en" ? (shot.srcEn ?? shot.src) : shot.src;
}

function switchLanguagePath(language: Language, segments: string[] = []) {
  return `/${otherLanguage(language)}${segments.length ? `/${segments.join("/")}` : ""}`;
}

type BackdropVariant = "hero" | "product" | "quiet";

const backdropSources: Record<BackdropVariant, string> = {
  hero: "/assets/brand/hero-paper-light-v2.webp",
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
        <Link href={`/${language}#exhibition`}>{t.apps}</Link>
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
    <footer className="site-footer" id="support">
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
            {app.privacy && <Link href={`/${language}/privacy/${app.slug}`}>{t.privacy}</Link>}
            {app.terms && <Link href={`/${language}/terms/${app.slug}`}>{t.terms}</Link>}
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

function museumProfile(app: AppProfile, language: Language) {
  return {
    name: app.name,
    slug: app.slug,
    store: app.appStoreUrl,
    supportPath: `/${language}/support/${app.slug}`,
    privacyPath: app.privacy ? `/${language}/privacy/${app.slug}` : null,
    termsPath: app.terms ? `/${language}/terms/${app.slug}` : null,
  };
}

function museumDocuments(app: AppProfile, language: Language) {
  function legal(kind: "privacy" | "terms") {
    const document = app[kind]?.[language];
    return document ? (
      <>
        <LegalIntro language={language} document={document} />
        <LegalContent document={document} />
      </>
    ) : null;
  }

  return {
    support: (
      <>
        <SupportIntro language={language} />
        <SupportContent language={language} app={app} inDialog />
      </>
    ),
    privacy: legal("privacy"),
    terms: legal("terms"),
  };
}

export function HomePage({ language }: { language: Language }) {
  const t = copy[language];
  return (
    <main>
      <MuseumExperience
        key={language}
        language={language}
        alternateLanguagePath={switchLanguagePath(language, [])}
        nextNotice={{ title: t.nextTitle, body: t.nextBody }}
        profiles={{
          leafia: museumProfile(apps.leafia, language),
          widgetgame: museumProfile(apps.widgetplay, language),
          studyseed: museumProfile(apps.studyseed, language),
        }}
        documents={{
          leafia: museumDocuments(apps.leafia, language),
          widgetgame: museumDocuments(apps.widgetplay, language),
          studyseed: museumDocuments(apps.studyseed, language),
        }}
      />
    </main>
  );
}

export function AppPage({ language, app }: { language: Language; app: AppProfile }) {
  const t = copy[language];
  const segments = ["apps", app.slug];
  return (
    <>
      <SiteHeader language={language} segments={segments} />
      <main className={`app-page app-page-${app.accent}`}>
        {app.slug === "leafia" && <LeafiaScrollMotion />}
        <section className="product-hero section-shell">
          <div className="product-copy reveal">
            <span className="eyebrow">{app.eyebrow[language]}</span>
            <div className="product-name">
              <img className="app-icon app-icon-large" src={app.icon} alt="" width="120" height="120" />
              <h1>{app.name}</h1>
            </div>
            <h2>{app.slug === "leafia" && language === "ja" ? <>植物の毎日を、<br />もっと心地よく。</> : app.tagline[language]}</h2>
            <p>{app.summary[language]}</p>
            <div className="product-actions">
              {app.appStoreUrl ? (
                <a className="button button-primary" href={app.appStoreUrl}>
                  {t.getApp}
                </a>
              ) : app.status ? (
                <span className="app-status">{app.status[language]}</span>
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
            {app.slug === "leafia" && (
              <div className="leafia-room" aria-hidden="true">
                <img src="/assets/leafia/interior/room-day.png" alt="" />
              </div>
            )}
            <div className="product-halo" />
            <div className="phone product-phone product-phone-main">
              <img src={screenshotSrc(app.screenshots[0], language)} alt={app.screenshots[0].alt[language]} />
            </div>
            <div className="phone product-phone product-phone-side">
              <img src={screenshotSrc(app.screenshots[1], language)} alt={app.screenshots[1].alt[language]} />
            </div>
            {app.slug === "leafia" && (
              <span className="leafia-room-caption" aria-hidden="true">A QUIET PLACE TO GROW</span>
            )}
          </div>
        </section>

        <section className="feature-section section-shell">
          <div className="section-heading compact" data-leafia-reveal={app.slug === "leafia" ? "" : undefined}>
            <span className="section-index">01</span>
            <p>{t.features}</p>
            <h2>
              {language === "ja" ? "毎日の中で、\nちゃんと役立つ。" : "Designed to feel useful,\nevery single day."}
            </h2>
          </div>
          <div className="feature-grid">
            {app.features.map((feature) => (
              <article key={feature.title.en} data-leafia-reveal={app.slug === "leafia" ? "" : undefined}>
                <span className="feature-mark">{feature.mark}</span>
                <h3>{feature.title[language]}</h3>
                <p>{feature.body[language]}</p>
              </article>
            ))}
          </div>
        </section>

        {app.slug === "leafia" && (
          <section className="leafia-story section-shell" aria-label={language === "ja" ? "植物と暮らす時間" : "Life with plants"}>
            <div className="leafia-story-stage" aria-hidden="true">
              <img className="leafia-story-stage-image leafia-story-stage-image-first" src="/assets/leafia/interior/room-editorial-morning.jpg" alt="" loading="lazy" />
              <img className="leafia-story-stage-image leafia-story-stage-image-second" src="/assets/leafia/interior/room-editorial-care.jpg" alt="" loading="lazy" />
              <span className="leafia-story-stage-label">{language === "ja" ? "イメージビジュアル" : "Illustrative imagery"}</span>
              <span className="leafia-story-stage-count">
                <span className="leafia-story-count-first">01</span>
                <span className="leafia-story-count-second">02</span>
                <span> / 02</span>
              </span>
            </div>
            <div className="leafia-story-steps">
              <article className="leafia-story-step" data-leafia-reveal>
                <img className="leafia-story-mobile-image" src="/assets/leafia/interior/room-editorial-morning.jpg" alt="" loading="lazy" />
                <span className="leafia-story-step-index">01 / A PLACE TO GROW</span>
                <h2>{language === "ja" ? <>植物を飾るように、<br />毎日を見つめる。</> : "Keep your plants close to everyday life."}</h2>
                <p>{language === "ja" ? "部屋に馴染むような穏やかな画面で、一鉢ずつの様子を見渡せます。お気に入りの植物と過ごす時間が、もっと自然に。" : "A calm view of every plant brings their small changes into focus and makes caring for them feel at home."}</p>
              </article>
              <article className="leafia-story-step leafia-story-step-second" data-leafia-reveal>
                <img className="leafia-story-mobile-image" src="/assets/leafia/interior/room-editorial-care.jpg" alt="" loading="lazy" />
                <span className="leafia-story-step-index">02 / A GENTLER ROUTINE</span>
                <h2>{language === "ja" ? <>小さなお世話が、<br />心地よい習慣に。</> : "Make small acts of care feel natural."}</h2>
                <p>{language === "ja" ? "次の水やりやこれまでの記録を、必要なときにすぐ確認。変化に気づく余白を、毎日の中に。" : "See upcoming watering and past care when you need them, with more room to notice how your plants grow."}</p>
              </article>
            </div>
          </section>
        )}

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
          <div className="gallery-heading" data-leafia-reveal={app.slug === "leafia" ? "" : undefined}>
            <span className="section-index">02</span>
            <p>{t.gallery}</p>
          </div>
          {app.screenshotNotice && <p className="screenshot-notice">{app.screenshotNotice[language]}</p>}
          <div className={`screenshot-gallery gallery-${app.slug}`}>
            {app.screenshots.map((shot, index) => (
              <figure key={shot.src} className={`gallery-shot gallery-shot-${(index % 3) + 1}`} data-leafia-reveal={app.slug === "leafia" ? "" : undefined}>
                <div className="phone">
                  <img src={screenshotSrc(shot, language)} alt={shot.alt[language]} loading="lazy" />
                </div>
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")} / {String(app.screenshots.length).padStart(2, "0")}</span>
                  {app.slug === "leafia" && <strong>{shot.alt[language]}</strong>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="facts-section section-shell">
          <div className="facts-intro" data-leafia-reveal={app.slug === "leafia" ? "" : undefined}>
            <span className="section-index">03</span>
            <p>{t.details}</p>
            <h2>{app.name}</h2>
          </div>
          <ul>
            {app.facts.map((fact) => (
              <li key={fact.en} data-leafia-reveal={app.slug === "leafia" ? "" : undefined}>
                <span>{fact[language]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="product-closing section-shell">
          <img className="app-icon" src={app.icon} alt="" width="96" height="96" />
          <h2>{app.slug === "leafia" && language === "ja" ? <>植物の毎日を、<br />もっと心地よく。</> : app.tagline[language]}</h2>
          <p>{app.summary[language]}</p>
          <div className="product-actions">
            {app.appStoreUrl ? (
              <a className="button button-primary" href={app.appStoreUrl}>{t.getApp}</a>
            ) : (
              <Link className="button button-primary" href={`/${language}/support/${app.slug}`}>
                {t.supportLink}
              </Link>
            )}
            <Link className="button button-secondary" href={`/${language}`}>
              {t.allApps}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter language={language} />
    </>
  );
}

function SupportIntro({ language }: { language: Language }) {
  const t = copy[language];
  return <p className="support-intro">{siteConfig.supportEmail ? t.supportIntroAvailable : t.supportIntro}</p>;
}

function SupportContent({
  language,
  app,
  inDialog = false,
}: {
  language: Language;
  app: AppProfile;
  inDialog?: boolean;
}) {
  const t = copy[language];
  const ContactHeading = inDialog ? "h3" : "h2";
  return (
    <>
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
          {!inDialog && <span className="eyebrow">CONTACT</span>}
          <ContactHeading>
            {inDialog && siteConfig.supportEmail ? t.contactTitle : siteConfig.supportEmail ?? t.contactUnavailable}
          </ContactHeading>
        </div>
        {siteConfig.supportEmail && (
          <a className="button button-primary" href={`mailto:${siteConfig.supportEmail}?subject=${app.name}%20Support`}>
            {siteConfig.supportEmail}
          </a>
        )}
      </section>
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
      <main className={`support-page support-page-${app.accent} section-shell`}>
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
          <SupportIntro language={language} />
        </header>
        <SupportContent language={language} app={app} />
        {(app.privacy || app.terms) && <nav className="support-legal-links" aria-label={`${app.name} legal`}>
          {app.privacy && <Link href={`/${language}/privacy/${app.slug}`}>
            {t.privacy}
          </Link>}
          {app.terms && <Link href={`/${language}/terms/${app.slug}`}>
            {t.terms}
          </Link>}
        </nav>}
      </main>
      <SiteFooter language={language} />
    </>
  );
}

function LegalIntro({ language, document }: { language: Language; document: LegalDocument }) {
  return (
    <>
      <p className="legal-date">{copy[language].legalUpdated}</p>
      <p className="legal-intro">{document.introduction}</p>
    </>
  );
}

function LegalContent({ document }: { document: LegalDocument }) {
  return (
    <article className="legal-document">
      {document.sections.map((section) => (
        <section key={section.title}>
          <h3>{section.title}</h3>
          <p>{section.body}</p>
        </section>
      ))}
    </article>
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
  const document = app[kind]?.[language];
  if (!document) return null;
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
          <LegalIntro language={language} document={document} />
        </header>
        <LegalContent document={document} />
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
