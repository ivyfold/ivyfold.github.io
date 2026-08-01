import leafiaLegal from "./leafia-legal.json";

export type Language = "ja" | "en";
export type AppSlug = "leafia" | "widgetplay";

export type LocalizedText = Record<Language, string>;

export type LegalDocument = {
  introduction: string;
  sections: Array<{ title: string; body: string }>;
};

export type AppProfile = {
  slug: AppSlug;
  name: string;
  eyebrow: LocalizedText;
  tagline: LocalizedText;
  summary: LocalizedText;
  platform: LocalizedText;
  icon: string;
  accent: "leafia" | "widgetplay";
  appStoreUrl: string | null;
  screenshots: Array<{ src: string; alt: LocalizedText }>;
  features: Array<{ title: LocalizedText; body: LocalizedText; mark: string }>;
  facts: Array<LocalizedText>;
  faq: Array<{ question: LocalizedText; answer: LocalizedText }>;
  privacy: Record<Language, LegalDocument>;
  terms: Record<Language, LegalDocument>;
};

export const siteConfig = {
  siteName: "Ivyfold",
  supportEmail: null as string | null,
  defaultLanguage: "ja" as Language,
  origin: "https://ryo-apps.ivy-tsuta.chatgpt.site",
};

const widgetPrivacy: Record<Language, LegalDocument> = {
  ja: {
    introduction:
      "WidgetPlayの開発者（以下「開発者」といいます。）は、ゲームアプリ「WidgetPlay」（以下「本アプリ」といいます。）における情報の取扱いについて、以下のとおり定めます。",
    sections: [
      {
        title: "第1条 取得・処理する情報",
        body: "本アプリは、選択したゲーム・テーマ・言語、ゲーム進行、スコア・記録、Widget設定、WidgetPlay Proの購入状態を処理します。分析を有効にした場合、ゲーム・テーマ・画面・操作元・正規化した結果・購入処理の成否など、個人を直接識別しない利用イベントを処理します。",
      },
      {
        title: "第2条 利用目的",
        body: "情報は、ゲームとWidgetの提供、進行・記録の保持、購入状態の確認・復元、機能と購入体験の改善、不具合の調査に利用します。第三者広告、広告のパーソナライズ、他社のアプリやWebサイトを横断したトラッキングには利用しません。",
      },
      {
        title: "第3条 保存場所",
        body: "ゲーム進行、記録、テーマ、言語、Widget設定は原則として端末内に保存されます。アプリとWidgetの間ではAppleのApp Groupを通じて必要な状態を共有します。本アプリにユーザーアカウント登録機能や独自クラウド同期機能はありません。",
      },
      {
        title: "第4条 外部サービス",
        body: "Apple StoreKit / App Storeを、WidgetPlay Proの購入、購入状態の確認および復元に利用します。決済はAppleが処理し、開発者はクレジットカード番号を取得しません。設定されている場合、TelemetryDeckを匿名の利用分析に利用します。",
      },
      {
        title: "第5条 分析データ",
        body: "TelemetryDeckへ送信するイベントは、イベント名とゲーム、テーマ、操作元、正規化した結果などの列挙値に限定します。取引ID、価格、自由入力のエラー、ユーザー入力コンテンツ、氏名、メールアドレスその他の個人識別子は分析イベントとして送信しません。",
      },
      {
        title: "第6条 広告とトラッキング",
        body: "本アプリは第三者広告を表示せず、Advertising Identifierを広告目的で利用せず、AppTrackingTransparencyの許可を要求しません。",
      },
      {
        title: "第7条 データの削除",
        body: "本アプリを削除すると、端末およびApp Group内に保存された本アプリのデータは削除される場合があります。App Storeの購入履歴はAppleが管理し、同じApple IDで確認できる購入は復元できる場合があります。",
      },
      {
        title: "第8条 安全管理",
        body: "開発者は情報の漏えい、改ざん、消失を防止するため合理的な措置を講じますが、端末、OS、外部サービスまたは電子的保存の完全な安全性を保証するものではありません。",
      },
      {
        title: "第9条 変更",
        body: "機能、外部サービスまたは法令の変更に応じて本ポリシーを変更する場合があります。重要な変更は本アプリ、App Storeの商品ページまたは本サイトで案内します。",
      },
      {
        title: "第10条 お問い合わせ",
        body: "本アプリに関するお問い合わせは、本サイトのWidgetPlayサポートページから受け付けます。",
      },
    ],
  },
  en: {
    introduction:
      "The developer of WidgetPlay (the “Developer”) establishes this Privacy Policy for information handled by the WidgetPlay game application (the “App”).",
    sections: [
      {
        title: "1. Information We Process",
        body: "The App processes the selected game, theme and language; game progress, scores and records; Widget settings; and WidgetPlay Pro purchase status. When analytics are enabled, it processes non-identifying usage events such as games, themes, screens, sources, normalised results and purchase outcomes.",
      },
      {
        title: "2. How We Use Information",
        body: "Information is used to provide games and Widgets, retain progress and records, verify and restore purchases, improve features and the purchase experience, and investigate defects. It is not used for third-party advertising, ad personalisation or tracking across other companies’ apps or websites.",
      },
      {
        title: "3. Storage",
        body: "Game progress, records, themes, language and Widget settings are generally stored on your device. The App and Widget share required state through an Apple App Group. The App has no user-account registration or independent cloud-sync service.",
      },
      {
        title: "4. Third-Party Services",
        body: "Apple StoreKit / App Store is used for WidgetPlay Pro purchases, entitlement checks and restoration. Apple processes payment and the Developer does not receive card numbers. When configured, TelemetryDeck is used for anonymous product analytics.",
      },
      {
        title: "5. Analytics Data",
        body: "TelemetryDeck events are limited to event names and enumerated values such as game, theme, source and normalised result. Transaction IDs, prices, free-form errors, user-entered content, names, email addresses and other personal identifiers are not sent as analytics events.",
      },
      {
        title: "6. Advertising and Tracking",
        body: "The App displays no third-party advertising, does not use the Advertising Identifier for advertising and does not request AppTrackingTransparency permission.",
      },
      {
        title: "7. Deleting Data",
        body: "Deleting the App may remove data stored on the device and in its App Group. Apple manages App Store purchase history, and a purchase may be restorable when it can be verified under the same Apple ID.",
      },
      {
        title: "8. Security",
        body: "The Developer takes reasonable measures against disclosure, alteration and loss, but cannot guarantee complete security of devices, operating systems, external services or electronic storage.",
      },
      {
        title: "9. Changes",
        body: "This Policy may change when features, providers or laws change. Material changes will be announced in the App, on the App Store product page or on this site.",
      },
      {
        title: "10. Contact",
        body: "For questions about the App, use the WidgetPlay support page on this site.",
      },
    ],
  },
};

const widgetTerms: Record<Language, LegalDocument> = {
  ja: {
    introduction:
      "本利用規約は、開発者が提供する「WidgetPlay」の利用条件を定めます。本アプリを利用することにより、本規約に同意したものとみなされます。",
    sections: [
      {
        title: "第1条 本アプリの内容",
        body: "本アプリは、アプリ内および対応するiOS Widgetで遊べるゲーム集です。ゲームの進行、スコア、記録、Widget更新は端末、OS、バックグラウンド実行制限等の影響を受けます。",
      },
      {
        title: "第2条 利用環境",
        body: "利用者は、対応するApple端末、OS、Apple ID、通信環境その他必要な環境を自己の責任で準備します。OSやApp Store等の仕様変更により一部機能が利用できなくなる場合があります。",
      },
      {
        title: "第3条 利用者の責任",
        body: "利用者は自己の責任で本アプリを利用し、端末およびゲームデータを管理します。ゲーム記録、進行またはWidget状態の完全な保存・復元は保証されません。",
      },
      {
        title: "第4条 禁止事項",
        body: "法令や公序良俗への違反、権利侵害、運営妨害、不正アクセス、不具合の意図的な悪用、適用法令で認められない解析・改変、不正な購入・返金・復元の試みを禁止します。",
      },
      {
        title: "第5条 WidgetPlay Pro",
        body: "WidgetPlay Proは、購入画面に表示されるPremiumゲーム、テーマおよびWidget背景等を解放する買い切り型のアプリ内課金です。価格と対象機能は購入時のApp Storeおよび購入画面の表示を優先します。サブスクリプションや自動更新ではありません。",
      },
      {
        title: "第6条 購入・復元・返金",
        body: "購入、請求、領収書、返金および購入履歴はAppleの規約と仕組みに従います。同一Apple IDでAppleが購入を確認できる場合は復元できることがあります。返金の可否はAppleが判断します。",
      },
      {
        title: "第7条 知的財産権",
        body: "本アプリ、ゲーム、デザイン、画像、ロゴ、文章およびプログラムに関する知的財産権は、開発者または正当な権利者に帰属します。",
      },
      {
        title: "第8条 変更・中断・終了",
        body: "開発者は、保守、障害対応、外部サービスの変更、法令対応その他合理的な理由により、本アプリの全部または一部を変更、中断または終了できます。",
      },
      {
        title: "第9条 保証の否認",
        body: "本アプリは現状有姿で提供されます。継続的な利用可能性、エラーがないこと、ゲーム記録の保存、Widgetの即時更新または特定の結果を保証しません。",
      },
      {
        title: "第10条 責任制限",
        body: "適用法令で認められる範囲で、開発者は本アプリの利用・利用不能、データ消失、通知・Widget更新の不達、逸失利益または間接損害について責任を負いません。強行法規により制限できない場合はこの限りではありません。",
      },
      {
        title: "第11条 規約の変更",
        body: "法令、機能またはサービス内容の変更に応じて本規約を変更する場合があります。重要な変更は本アプリ、App Storeの商品ページまたは本サイトで案内します。",
      },
      {
        title: "第12条 準拠法・お問い合わせ",
        body: "本規約は日本法を準拠法とします。お問い合わせは、本サイトのWidgetPlayサポートページから受け付けます。",
      },
    ],
  },
  en: {
    introduction:
      "These Terms govern use of WidgetPlay provided by the Developer. By using the App, you agree to these Terms.",
    sections: [
      {
        title: "1. What the App Does",
        body: "The App is a collection of games playable in the App and compatible iOS Widgets. Progress, scores, records and Widget refreshes depend on the device, OS and background-execution limits.",
      },
      {
        title: "2. Requirements",
        body: "You are responsible for obtaining a compatible Apple device, OS, Apple ID, connectivity and other required environment. Changes to the OS, App Store or other services may make features unavailable.",
      },
      {
        title: "3. Your Responsibilities",
        body: "You use the App at your own responsibility and manage your device and game data. Complete preservation or recovery of records, progress and Widget state is not guaranteed.",
      },
      {
        title: "4. Prohibited Conduct",
        body: "You must not violate law or public order, infringe rights, disrupt operation, gain unauthorised access, intentionally exploit defects, analyse or modify the App where not permitted by law, or attempt fraudulent purchases, refunds or restorations.",
      },
      {
        title: "5. WidgetPlay Pro",
        body: "WidgetPlay Pro is a one-time in-app purchase that unlocks the Premium games, themes, Widget backgrounds and other items shown on the purchase screen. The App Store and purchase screen at the time of purchase control the current price and included features. It is not a subscription and does not auto-renew.",
      },
      {
        title: "6. Purchase, Restoration and Refunds",
        body: "Apple’s terms and systems govern purchases, billing, receipts, refunds and purchase history. Restoration may be available when Apple can verify a purchase under the same Apple ID. Apple decides refund eligibility.",
      },
      {
        title: "7. Intellectual Property",
        body: "Intellectual-property rights in the App, games, designs, images, logos, text and software belong to the Developer or lawful rights holders.",
      },
      {
        title: "8. Changes, Suspension and Discontinuation",
        body: "The Developer may change, suspend or discontinue all or part of the App for maintenance, incident response, provider changes, legal compliance or another reasonable reason.",
      },
      {
        title: "9. Disclaimer",
        body: "The App is provided “as is”. The Developer does not warrant uninterrupted availability, freedom from errors, preservation of game records, immediate Widget refreshes or any particular outcome.",
      },
      {
        title: "10. Limitation of Liability",
        body: "To the extent permitted by law, the Developer is not liable for loss from use or inability to use the App, lost data, missed notifications or Widget refreshes, lost profits or indirect damages. This does not apply where mandatory law does not permit the limitation.",
      },
      {
        title: "11. Changes to These Terms",
        body: "These Terms may change when laws, features or services change. Material changes will be announced in the App, on the App Store product page or on this site.",
      },
      {
        title: "12. Governing Law and Contact",
        body: "Japanese law governs these Terms. For questions, use the WidgetPlay support page on this site.",
      },
    ],
  },
};

export const apps: Record<AppSlug, AppProfile> = {
  leafia: {
    slug: "leafia",
    name: "Leafia",
    eyebrow: { ja: "PLANT CARE, MADE CALM", en: "PLANT CARE, MADE CALM" },
    tagline: {
      ja: "植物の毎日を、もっと心地よく。",
      en: "A calmer rhythm for every plant.",
    },
    summary: {
      ja: "写真、水やり予定、成長の記録をひとつの場所に。植物をよく見る習慣を、やさしい画面で支えます。",
      en: "Keep photos, watering schedules and growth records together—designed to support a thoughtful plant-care routine.",
    },
    platform: { ja: "iPhone・Widget", en: "iPhone · Widgets" },
    icon: "/assets/leafia/icon.png",
    accent: "leafia",
    appStoreUrl: null,
    screenshots: [
      {
        src: "/assets/leafia/plants.jpg",
        alt: { ja: "Leafiaの植物一覧", en: "Leafia plant library" },
      },
      {
        src: "/assets/leafia/today.jpg",
        alt: { ja: "今日の水やり画面", en: "Today’s watering screen" },
      },
      {
        src: "/assets/leafia/detail.jpg",
        alt: { ja: "植物の詳細画面", en: "Plant detail screen" },
      },
      {
        src: "/assets/leafia/growth.jpg",
        alt: { ja: "成長記録画面", en: "Growth record screen" },
      },
      {
        src: "/assets/leafia/stats.jpg",
        alt: { ja: "水やり統計画面", en: "Watering statistics screen" },
      },
      {
        src: "/assets/leafia/widget.jpg",
        alt: { ja: "Leafia Widget", en: "Leafia Widget" },
      },
    ],
    features: [
      {
        mark: "01",
        title: { ja: "次の水やりが見える", en: "See what needs water" },
        body: {
          ja: "植物ごとの周期と履歴から、今日確認したい植物を分かりやすく整理します。",
          en: "Organise what to check today from each plant’s schedule and history.",
        },
      },
      {
        mark: "02",
        title: { ja: "写真で成長を残す", en: "Keep a visual growth journal" },
        body: {
          ja: "植物の写真、メモ、育成日数をひとつのタイムラインに記録できます。",
          en: "Save photos, notes and growing days in one quiet timeline.",
        },
      },
      {
        mark: "03",
        title: { ja: "ホーム画面から確認", en: "Glance from the Home Screen" },
        body: {
          ja: "Widgetと通知で、アプリを開かない時間も植物の状態を身近に保ちます。",
          en: "Widgets and notifications keep plant care close without opening the App.",
        },
      },
      {
        mark: "04",
        title: { ja: "履歴を振り返る", en: "Understand your routine" },
        body: {
          ja: "水やり履歴と統計で、これまでのお世話のペースを振り返れます。",
          en: "Review watering history and statistics to understand your care rhythm.",
        },
      },
    ],
    facts: [
      { ja: "植物ごとの水やり予定", en: "Per-plant watering schedules" },
      { ja: "写真・メモ・成長記録", en: "Photos, notes and growth records" },
      { ja: "通知・Widget・ショートカット", en: "Notifications, Widgets and Shortcuts" },
      { ja: "任意のiCloudバックアップ", en: "Optional iCloud backup" },
    ],
    faq: [
      {
        question: {
          ja: "水やり予定は必ず守る必要がありますか？",
          en: "Should I always follow the watering date?",
        },
        answer: {
          ja: "予定は確認のきっかけです。土、葉、季節、室温など実際の状態を確認して判断してください。",
          en: "Treat it as a prompt to check. Look at the soil, leaves, season and environment before deciding.",
        },
      },
      {
        question: {
          ja: "データはどこに保存されますか？",
          en: "Where is my data stored?",
        },
        answer: {
          ja: "原則として端末内に保存されます。iCloud同期を有効にすると、写真を含む植物データをiCloudへバックアップできます。",
          en: "Data is stored on your device by default. When iCloud sync is enabled, plant data including photos can be backed up to iCloud.",
        },
      },
      {
        question: {
          ja: "Leafia Proはサブスクリプションですか？",
          en: "Is Leafia Pro a subscription?",
        },
        answer: {
          ja: "いいえ。植物登録上限の解除と統計機能を利用できる買い切り型のアプリ内課金です。",
          en: "No. It is a one-time in-app purchase that removes the plant limit and unlocks statistics.",
        },
      },
      {
        question: {
          ja: "購入を復元できますか？",
          en: "Can I restore my purchase?",
        },
        answer: {
          ja: "同じApple IDで購入情報を確認できる場合、アプリ内の購入復元から復元できることがあります。",
          en: "When Apple can verify the purchase under the same Apple ID, it may be restored from Restore Purchases in the App.",
        },
      },
      {
        question: {
          ja: "機種変更前に何をすればよいですか？",
          en: "What should I do before changing devices?",
        },
        answer: {
          ja: "iCloud同期を利用する場合は、旧端末で最新のバックアップ状態を確認し、新端末でも同じApple IDを使用してください。",
          en: "If you use iCloud sync, confirm the latest backup on the old device and use the same Apple ID on the new device.",
        },
      },
    ],
    privacy: leafiaLegal.privacy,
    terms: leafiaLegal.terms,
  },
  widgetplay: {
    slug: "widgetplay",
    name: "WidgetPlay",
    eyebrow: { ja: "PLAY, RIGHT FROM HOME", en: "PLAY, RIGHT FROM HOME" },
    tagline: {
      ja: "ホーム画面で、そのまま遊ぶ。",
      en: "Quick games, right on your Home Screen.",
    },
    summary: {
      ja: "ナンプレ、リバーシ、2048など9つのゲームを、アプリでもインタラクティブWidgetでも。気分に合わせてテーマも選べます。",
      en: "Nine quick games—from Sudoku and Reversi to 2048—made for both the App and interactive Widgets.",
    },
    platform: { ja: "iPhone・iPad・Widget", en: "iPhone · iPad · Widgets" },
    icon: "/assets/widgetplay/icon.png",
    accent: "widgetplay",
    appStoreUrl: null,
    screenshots: [
      {
        src: "/assets/widgetplay/library.jpg",
        alt: { ja: "WidgetPlayのゲーム一覧", en: "WidgetPlay game library" },
      },
      {
        src: "/assets/widgetplay/game.jpg",
        alt: { ja: "WidgetPlayのナンプレ", en: "Sudoku in WidgetPlay" },
      },
      {
        src: "/assets/widgetplay/widget-guide.jpg",
        alt: { ja: "Widget追加ガイド", en: "Widget setup guide" },
      },
    ],
    features: [
      {
        mark: "09",
        title: { ja: "9つのクイックゲーム", en: "Nine quick games" },
        body: {
          ja: "数字当て、リバーシ、ナンプレ、2048、マインスイーパーなどをひとつに。",
          en: "Number Clash, Reversi, Sudoku, 2048, Minesweeper and more in one place.",
        },
      },
      {
        mark: "W",
        title: { ja: "Widgetで直接プレイ", en: "Play in an interactive Widget" },
        body: {
          ja: "ホーム画面からゲームを開き、短い空き時間にすぐ続きを遊べます。",
          en: "Start from the Home Screen and jump back into a game in a spare moment.",
        },
      },
      {
        mark: "∞",
        title: { ja: "アプリと進行を共有", en: "Progress stays in sync" },
        body: {
          ja: "アプリとWidgetで同じゲーム状態を共有し、記録も端末内に保存します。",
          en: "The App and Widget share game state, with records saved locally on your device.",
        },
      },
      {
        mark: "◐",
        title: { ja: "世界観を着せ替える", en: "Change the whole mood" },
        body: {
          ja: "ミニマル、和モダン、パステル、宇宙など、ゲームとWidgetを同じテーマで彩れます。",
          en: "Style the App and Widgets with minimal, modern, pastel, cosmic and other themes.",
        },
      },
    ],
    facts: [
      { ja: "9種類のゲーム", en: "Nine games" },
      { ja: "インタラクティブWidget", en: "Interactive Widget" },
      { ja: "端末内・App Group保存", en: "On-device App Group storage" },
      { ja: "買い切りのWidgetPlay Pro", en: "One-time WidgetPlay Pro" },
    ],
    faq: [
      {
        question: {
          ja: "Widgetはどう追加しますか？",
          en: "How do I add the Widget?",
        },
        answer: {
          ja: "ホーム画面を長押しして編集を選び、WidgetギャラリーからWidgetPlayを追加します。その後「ウィジェットを編集」からゲームを選べます。",
          en: "Long-press the Home Screen, choose edit, add WidgetPlay from the Widget gallery, then use Edit Widget to select a game.",
        },
      },
      {
        question: {
          ja: "ゲームの進行はどこに保存されますか？",
          en: "Where is game progress stored?",
        },
        answer: {
          ja: "端末内に保存され、App Groupを通じてアプリとWidgetの間で共有されます。独自アカウントやクラウド同期はありません。",
          en: "Progress is stored on your device and shared between the App and Widget through an App Group. There is no separate account or cloud-sync service.",
        },
      },
      {
        question: {
          ja: "WidgetPlay Proはサブスクリプションですか？",
          en: "Is WidgetPlay Pro a subscription?",
        },
        answer: {
          ja: "いいえ。Premiumゲーム、テーマ、Widget背景などを解放する買い切り型のアプリ内課金です。",
          en: "No. It is a one-time in-app purchase that unlocks Premium games, themes, Widget backgrounds and more.",
        },
      },
      {
        question: {
          ja: "購入を復元できますか？",
          en: "Can I restore my purchase?",
        },
        answer: {
          ja: "同じApple IDで購入を確認できる場合、購入画面またはテーマ画面の「購入を復元」から復元できます。",
          en: "When Apple can verify the purchase under the same Apple ID, use Restore Purchases from the purchase or theme screen.",
        },
      },
      {
        question: {
          ja: "分析データに個人情報は含まれますか？",
          en: "Does analytics include personal information?",
        },
        answer: {
          ja: "分析が有効な場合も、イベント名とゲーム・テーマ等の列挙値に限定し、氏名、メールアドレス、自由入力データ、取引IDは送信しません。",
          en: "When enabled, analytics is limited to event names and enumerated game or theme values. It does not send names, email addresses, free-form content or transaction IDs.",
        },
      },
    ],
    privacy: widgetPrivacy,
    terms: widgetTerms,
  },
};

export const supportedLanguages: Language[] = ["ja", "en"];

export function isLanguage(value: string): value is Language {
  return supportedLanguages.includes(value as Language);
}

export function isAppSlug(value: string): value is AppSlug {
  return value === "leafia" || value === "widgetplay";
}
