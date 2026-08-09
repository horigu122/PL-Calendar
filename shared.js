/* ============================================================
   shared.js — PL Calendar / Standings 共通設定・共通関数
   ------------------------------------------------------------
   index.html と standings.html の両方から <script src="shared.js">
   で読み込まれます。チーム情報・APIキー・プロキシURLはここで
   一元管理してください（2箇所に同じ値を書かずに済みます）。
   ============================================================ */

/* ============================================================
   画像フォルダの構成（実際のリポジトリ構成に合わせています）
   ------------------------------------------------------------
     index.html
     standings.html
     shared.js
     └── image/
         ├── Arsenal.svg
         ├── Bournemouth.svg
         ├── Brentford.svg
         ├── Brighton.svg
         ├── Chelsea.svg
         ├── Coventry.svg
         ├── Everton.svg
         ├── Forest.svg
         ├── Fulham.svg
         ├── Hull.svg
         ├── Ipswich.svg
         ├── Leeds.svg
         ├── Liverpool.svg
         ├── Man City.svg
         ├── Man Utd.svg
         ├── Newcastle.svg
         ├── Palace.svg
         ├── Spurs.svg
         ├── Sunderland.svg
         └── Villa.svg
   ============================================================ */
const TEAMS = [
  { code: "ARS", name: "Arsenal FC", color: "#EF0107", dark: false, logoUrl: "image/Arsenal.svg" },
  { code: "COV", name: "Coventry City", color: "#78D0F2", dark: true, logoUrl: "image/Coventry.svg" },
  { code: "HUL", name: "Hull City", color: "#F18A00", dark: true, logoUrl: "image/Hull.svg" },
  { code: "MUN", name: "Manchester United", color: "#DA291C", dark: false, logoUrl: "image/Man%20Utd.svg" },
  { code: "EVE", name: "Everton FC", color: "#003399", dark: false, logoUrl: "image/Everton.svg" },
  { code: "CRY", name: "Crystal Palace", color: "#1B458F", dark: false, logoUrl: "image/Palace.svg" },
  { code: "IPS", name: "Ipswich Town", color: "#0044A9", dark: false, logoUrl: "image/Ipswich.svg" },
  { code: "SUN", name: "Sunderland AFC", color: "#EB172B", dark: false, logoUrl: "image/Sunderland.svg" },
  { code: "NFO", name: "Nottingham Forest", color: "#DD0000", dark: false, logoUrl: "image/Forest.svg" },
  { code: "LEE", name: "Leeds United", color: "#FFCD00", dark: true, logoUrl: "image/Leeds.svg" },
  { code: "BRE", name: "Brentford FC", color: "#E30613", dark: false, logoUrl: "image/Brentford.svg" },
  { code: "TOT", name: "Tottenham Hotspur", color: "#132257", dark: false, logoUrl: "image/Spurs.svg" },
  { code: "BRI", name: "Brighton & Hove Albion", color: "#0057B8", dark: false, logoUrl: "image/Brighton.svg" },
  { code: "AVL", name: "Aston Villa", color: "#670E36", dark: false, logoUrl: "image/Villa.svg" },
  { code: "MCI", name: "Manchester City", color: "#6CABDD", dark: true, logoUrl: "image/Man%20City.svg" },
  { code: "BOU", name: "AFC Bournemouth", color: "#B50E12", dark: false, logoUrl: "image/Bournemouth.svg" },
  { code: "NEW", name: "Newcastle United", color: "#241F20", dark: false, logoUrl: "image/Newcastle.svg" },
  { code: "LFC", name: "Liverpool FC", color: "#C8102E", dark: false, logoUrl: "image/Liverpool.svg" },
  { code: "FUL", name: "Fulham FC", color: "#1A1A1A", dark: false, logoUrl: "image/Fulham.svg" },
  { code: "CFC", name: "Chelsea FC", color: "#034694", dark: false, logoUrl: "image/Chelsea.svg" }
];
/* 画像を用意していない場合は、上の logoUrl を "" （空文字）のままにしておいても
   動作します（自動生成のカラー・フォールバック画像が使われます）。 */
const teamByCode = Object.fromEntries(TEAMS.map(t => [t.code, t]));

function fallbackLogoDataUri(code) {
  const t = teamByCode[code] || { color: '#5f6b62', dark: false };
  const textColor = t.dark ? '#12211a' : '#f3efe2';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='18' fill='${t.color}'/><text x='50' y='60' font-family='Oswald,sans-serif' font-size='34' font-weight='600' fill='${textColor}' text-anchor='middle'>${code}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
function logoSrc(code) {
  const t = teamByCode[code];
  return (t && t.logoUrl && t.logoUrl.trim()) ? t.logoUrl.trim() : fallbackLogoDataUri(code);
}
function crestImg(code, size, extraClass) {
  const t = teamByCode[code] || { name: code };
  const fb = fallbackLogoDataUri(code);
  return `<img src="${logoSrc(code)}" onerror="this.onerror=null;this.src='${fb}';" class="crest ${extraClass || ''}" style="width:${size}px;height:${size}px;" alt="${t.name}">`;
}
function watermarkImg(code, side) {
  const fb = fallbackLogoDataUri(code);
  return `<img src="${logoSrc(code)}" onerror="this.onerror=null;this.src='${fb}';" class="side-watermark wm-${side}" alt="" aria-hidden="true">`;
}

/* ============================================================
   本番API連携（Football-Data.org）
   ------------------------------------------------------------
   1. https://www.football-data.org/client/register で無料アカウントを作成し、
      発行された API トークンを下の API_KEY にそのまま貼り付けてください。
   2. API_KEY が "YOUR_API_KEY" のままでも、PROXY_BASE_URL 経由なら動作します
      （プロキシがキーを保持している場合。詳しくは PROXY_BASE_URL の説明を参照）。
   3. 無料プランでは「日程・スコア・順位表」は取得できますが、ボール支配率や
      シュート数・スタメン・得点者などの詳細スタッツは含まれません。
   ============================================================ */
const API_KEY = "3224993a6707403aa85e0269ec95855d"; // ← Football-Data.org のAPIトークン
const API_BASE = "https://api.football-data.org/v4";
const COMPETITION_CODE = "PL";   // プレミアリーグの大会コード
const SEASON_YEAR = 2026;        // シーズン開幕年（2026-27シーズンなら2026）

/* Football-Data.org はブラウザからの直接アクセス（CORS）を許可していないため、
   GitHub Pages 等の静的サイトから素の fetch で叩くと大抵ブロックされる。
   自前のプロキシ（Cloudflare Worker等）を用意した場合は、そのURLをここに入れると
   プロキシ経由でアクセスするようになる。空文字なら直接アクセスを試みる。
   例: "https://your-worker.example.workers.dev/pl-proxy" */
const PROXY_BASE_URL = "https://dry-bush-6a8f.ipodpro-kazuma.workers.dev/pl-proxy";

function apiUrl(path) {
  return PROXY_BASE_URL ? `${PROXY_BASE_URL}${path}` : `${API_BASE}${path}`;
}

// プロキシ経由の場合、キーはWorker側に保持されているため、クライアント側からは
// カスタムヘッダーを送らない（送るとCORSプリフライトでブロックされる原因になる）。
function apiFetchOptions() {
  return PROXY_BASE_URL ? {} : { headers: { 'X-Auth-Token': API_KEY } };
}
function hasApiAccess() {
  return !!PROXY_BASE_URL || !!(API_KEY && API_KEY !== "YOUR_API_KEY");
}

// Football-Data.org の TLA（3文字略称）と、このアプリ内のチームコードの対応表。
// 表記が食い違うチームがあれば、ここに追記してください。
const TLA_TO_CODE = {
  ARS: "ARS", AVL: "AVL", BOU: "BOU", BRE: "BRE", BHA: "BRI",
  CHE: "CFC", CRY: "CRY", EVE: "EVE", FUL: "FUL", LIV: "LFC",
  MCI: "MCI", MUN: "MUN", NEW: "NEW", NFO: "NFO", TOT: "TOT",
  SUN: "SUN", LEE: "LEE", COV: "COV", HUL: "HUL", IPS: "IPS", WHU: "WHU"
};

// APIが返すチームがTEAMS配列に無い場合、クラッシュしないよう自動で仮登録する
function ensureTeamExists(code, apiTeam) {
  if (teamByCode[code]) return;
  const t = { code, name: (apiTeam && apiTeam.name) || code, color: "#5f6b62", dark: false, logoUrl: (apiTeam && apiTeam.crest) || "" };
  TEAMS.push(t);
  teamByCode[code] = t;
}
