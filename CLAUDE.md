# senipara-dashboard

シニパラ第14回定期演奏会のアンケート結果ダッシュボード（React + Vite + Recharts / Vercel）。

## 応答のルール
- 回答は日本語で書く。
- 結論を先に書き、そのあとに理由と詳細を書く。

## 構成
- データ取得は GAS ウェブアプリ1本のみ。スプレッドシートやDriveを直接読まない
- 集計（数え上げ）はこちら側。住所の丸めや画像名の組み立てはGAS側
- グラフのアニメーションは全て無効（isAnimationActive={false}）
