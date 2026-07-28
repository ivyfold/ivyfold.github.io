import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found section-shell">
      <span className="eyebrow">404</span>
      <h1>ページが見つかりません。</h1>
      <p>The page you requested could not be found.</p>
      <Link className="button button-primary" href="/ja">
        ホームへ戻る
      </Link>
    </main>
  );
}
