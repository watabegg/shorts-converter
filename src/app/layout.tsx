import type { Metadata } from "next"
import "./globals.css";


export const metadata: Metadata = {
  title: "YouTube Shorts 変換ツール",
  description: "YouTube用の横動画を簡単にShorts用の縦動画に変換。タイトルとサムネイル画像を追加して、魅力的なShorts動画を作成しましょう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="jp">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
