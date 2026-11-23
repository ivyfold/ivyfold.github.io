import type { AppProfile } from "./site-data";

export const studySeed: AppProfile = {
  slug: "studyseed",
  name: "書斎のたね",
  eyebrow: { ja: "READING GROWS YOUR ROOM", en: "READING GROWS YOUR ROOM" },
  tagline: {
    ja: "読んだ本とともに育つ、あなたの部屋。",
    en: "A little room that grows with every book.",
  },
  summary: {
    ja: "読書の記録と、小さな書斎づくりを楽しむiPhoneアプリです。本を登録し、読書時間や読了で集めた「たね」で家具を選び、部屋を少しずつ育てます。お気に入りの本を飾った書斎は、画像として保存・共有できます。",
    en: "An iPhone app for recording your reading and growing a small study. Add books, earn seeds through reading time and finished books, then choose furniture and expand your room. Save and share an image of your study with your favourite books on display.",
  },
  platform: { ja: "iPhone・開発中", en: "iPhone · In development" },
  icon: "/assets/studyseed/icon.png",
  accent: "studyseed",
  appStoreUrl: null,
  status: { ja: "開発中・公開時期未定", en: "In development · Release date to be announced" },
  screenshotNotice: {
    ja: "開発中の画面です。掲載している本はサンプルです。仕様は変更になる場合があります。",
    en: "Screens from a development build with sample books. Features and appearance may change.",
  },
  screenshots: [
    { src: "/assets/studyseed/room.png", alt: { ja: "本棚や家具を並べた書斎のたねの開発画面", en: "A furnished study in a development build of 書斎のたね" } },
    { src: "/assets/studyseed/shelf.png", alt: { ja: "登録したサンプル本が並ぶ本棚の開発画面", en: "A bookshelf with sample books in a development build" } },
    { src: "/assets/studyseed/room-start.png", alt: { ja: "小さな本棚から始まる書斎の開発画面", en: "A small bookshelf at the start of a new study" } },
  ],
  features: [
    {
      mark: "01",
      title: { ja: "本との出会いを、本棚へ", en: "Bring your books to the shelf" },
      body: { ja: "書名・ISBN・バーコードから本を探し、読んだ本、読んでいる本、読みたい本を登録。手入力でも追加できます。", en: "Find books by title, ISBN or barcode, or add them manually. Keep books you have read, are reading or want to read together." },
    },
    {
      mark: "02",
      title: { ja: "読書が、部屋のたねになる", en: "Let reading grow your room" },
      body: { ja: "読書時間や読了を記録すると「たね」が貯まります。本棚や家具、観葉植物を選んで、小さな部屋を育てます。", en: "Record reading time and finished books to earn seeds. Choose shelves, furniture and plants to grow your little room." },
    },
    {
      mark: "03",
      title: { ja: "好きな場所に、好きな本を", en: "Make the study your own" },
      body: { ja: "家具を配置・回転し、本棚の分類や部屋の広さを変えられます。お気に入りの本を飾って、自分らしい書斎に。", en: "Arrange and rotate furniture, organise shelves and expand the room. Display favourite books to make a study that feels like yours." },
    },
    {
      mark: "04",
      title: { ja: "育った書斎を、一枚に", en: "Share a picture of your study" },
      body: { ja: "書斎やお気に入りの本を画像にして保存・共有できます。読書の時間には、雨音や暖炉の環境音も楽しめます。", en: "Save and share images of your study and favourite books. Read alongside the sound of rain or a fireplace." },
    },
  ],
  facts: [
    { ja: "iPhone向け・iOS 18以降", en: "For iPhone · iOS 18 or later" },
    { ja: "書名・ISBN・バーコード・手入力で本を登録", en: "Add books by title, ISBN, barcode or manual entry" },
    { ja: "読書時間・読了の記録と、家具・部屋の拡張", en: "Reading records, furniture and room expansion" },
    { ja: "書斎画像の保存・共有", en: "Save and share study images" },
    { ja: "開発中・App Store公開時期未定", en: "In development · App Store release date to be announced" },
  ],
  faq: [
    {
      question: { ja: "今すぐダウンロードできますか？", en: "Can I download the app now?" },
      answer: { ja: "現在開発中です。App Storeでの公開時期は未定です。公開が決まり次第、このサイトでご案内します。", en: "The app is in development. An App Store release date has not been announced. Release information will be shared on this site." },
    },
    {
      question: { ja: "どんな本を登録できますか？", en: "Which books can I add?" },
      answer: { ja: "読んだ本、読んでいる本、読みたい本を登録できます。書名・ISBN・バーコード検索に加え、手入力にも対応しています。", en: "Add books you have read, are reading or want to read. Title, ISBN and barcode search are supported, along with manual entry." },
    },
    {
      question: { ja: "本の情報はどこから取得しますか？", en: "Where will book information come from?" },
      answer: { ja: "書籍情報の検索と楽天ブックスの商品ページへの案内に、楽天ブックスAPIの利用を準備しています。連携は現在準備中です。", en: "We are preparing to use the Rakuten Books API for book searches and links to Rakuten Books product pages. This integration is still being prepared." },
    },
    {
      question: { ja: "他の人の書斎を訪問できますか？", en: "Can I visit another person's study?" },
      answer: { ja: "現在の試作版では、書斎を画像として保存・共有できます。他の人の書斎への訪問やクラウド同期は未対応です。", en: "The current prototype can save and share images of a study. Visiting other studies and cloud sync are not currently supported." },
    },
  ],
};
