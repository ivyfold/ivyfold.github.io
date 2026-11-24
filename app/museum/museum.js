import { englishApps, englishFrames } from "./copy.js";

const assetRoot = "/assets/museum/";
export const asset = (name) => assetRoot + name;

export function guideLinks(room, copy) {
  return [
    { kind: "support", href: room.supportPath, label: copy.supportLink },
    { kind: "privacy", href: room.privacyPath, label: copy.privacyLink },
    { kind: "terms", href: room.termsPath, label: copy.termsLink },
  ].filter(({ href }) => href);
}

export function appOverview(room) {
  return { kind: "app", room, title: room.name, image: room.phone, description: room.overviewDescription };
}

const gallery = [
  {
    id: "leafia",
    name: "Leafia",
    summary: "観葉植物のお世話を記録",
    overviewDescription: "水やりの予定や、日々の成長をひとつに。",
    store: "https://apps.apple.com/jp/app/id6780912421",
    phone: "leafia-plants.jpg",
    frames: [
      { image: "leafia-care.jpg", title: "今日のお世話", caption: "必要なお世話がわかる", description: "水やりや肥料が必要な植物を確認し、お世話をその場で記録できます。" },
      { image: "leafia-statistics.jpg", title: "お世話の統計", caption: "お世話の達成度を見る", description: "水やりの回数や達成状況から、植物との暮らしを振り返れます。" },
      { image: "leafia-detail.jpg", title: "植物の詳細", caption: "植物ごとの予定を確認", description: "植物ごとに、お世話の予定や記録を確認できます。" },
      { image: "leafia-calendar.jpg", title: "お世話カレンダー", caption: "お世話の日を見渡す", description: "日付をたどりながら、お世話の予定と記録を確認できます。" },
      { image: "leafia-records.jpg", title: "お世話の記録", caption: "お世話の回数を見返す", description: "水やりや植え替えなど、これまでのお世話を見返せます。" },
    ],
  },
  {
    id: "widgetgame",
    name: "WidgetGame",
    summary: "ホーム画面で遊べるミニゲーム",
    overviewDescription: "ナンプレやリバーシ、2048を、ちょっとした空き時間に。",
    phone: "widgetgame-library.jpg",
    frames: [
      { image: "widgetgame-library.jpg", title: "ゲーム一覧", caption: "気分でゲームを選ぶ", description: "気分に合うミニゲームを一覧から選べます。" },
      { image: "widgetgame-merge.jpg", title: "Merge 2048", caption: "数字を重ねて大きく", description: "同じ数字のタイルを重ねて、より大きな数字を作るパズルです。" },
      { image: "widgetgame-sudoku.jpg", title: "ナンプレ", caption: "ホーム画面でナンプレ", description: "ホーム画面に数字のパズルを置いて遊べます。" },
      { image: "widgetgame-reversi.jpg", title: "リバーシ", caption: "石を返して対戦", description: "ホーム画面のウィジェットで、石を返す対戦を楽しめます。" },
      { image: "widgetgame-minesweeper.jpg", title: "マインスイーパー", caption: "数字を頼りにマスを開く", description: "数字のヒントを手がかりに、安全なマスを開いていきます。" },
    ],
  },
  {
    id: "studyseed",
    name: "書斎のたね",
    summary: "読んだ本とともに育つ書斎",
    overviewDescription: "読書を記録するたび、本棚や家具で自分だけの書斎が育ちます。",
    displayTagline: "読書の記録で書斎が育つ",
    phone: "studyseed-room.jpg",
    frames: [
      { image: "studyseed-bookshelf.jpg", title: "わたしの本棚", caption: "好きな本を表紙で飾る", description: "好きな本を表紙で飾り、自分の本棚を整えられます。" },
      { image: "studyseed-reading.jpg", title: "読書タイマー", caption: "読書時間を記録する", description: "書斎で読書に使った時間を記録できます。" },
      { image: "studyseed-furniture.jpg", title: "家具の試し置き", caption: "家具を置いて見比べる", description: "家具を試し置きして、書斎の雰囲気を見比べられます。" },
      { image: "studyseed-finished.jpg", title: "読了の記録", caption: "読んだ本を本棚に残す", description: "読み終えた本を記録し、本棚に残せます。" },
      { image: "studyseed-calendar.jpg", title: "読書カレンダー", caption: "読んだ日を振り返る", description: "カレンダーで、読書をした日を振り返れます。" },
    ],
  },
];


export function galleryFor(language, profiles) {
  return gallery.map((room) => {
    const profile = profiles[room.id];
    const english = language === "en";
    return {
      ...room,
      name: profile.name,
      slug: profile.slug,
      detailsPath: "/" + language + "/apps/" + profile.slug,
      store: profile.store,
      supportPath: profile.supportPath,
      privacyPath: profile.privacyPath,
      termsPath: profile.termsPath,
      summary: english ? englishApps[room.id].summary : room.summary,
      overviewDescription: english ? englishApps[room.id].overviewDescription : room.overviewDescription,
      displayTagline: english ? englishApps[room.id].displayTagline : room.displayTagline ?? room.summary,
      frames: english ? room.frames.map((frame) => ({ ...frame, ...englishFrames[frame.image] })) : room.frames,
    };
  });
}
