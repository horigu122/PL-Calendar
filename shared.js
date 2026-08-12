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
  { code: "ARS", name: "Arsenal FC", color: "#EF0107", dark: false, logoUrl: "image/Arsenal.svg", venue: "Emirates Stadium" },
  { code: "COV", name: "Coventry City", color: "#78D0F2", dark: true, logoUrl: "image/Coventry.svg", venue: "Coventry Building Society Arena" },
  { code: "HUL", name: "Hull City", color: "#F18A00", dark: true, logoUrl: "image/Hull.svg", venue: "MKM Stadium" },
  { code: "MUN", name: "Manchester United", color: "#DA291C", dark: false, logoUrl: "image/Man%20Utd.svg", venue: "Old Trafford" },
  { code: "EVE", name: "Everton FC", color: "#003399", dark: false, logoUrl: "image/Everton.svg", venue: "Everton Stadium" },
  { code: "CRY", name: "Crystal Palace", color: "#1B458F", dark: false, logoUrl: "image/Palace.svg", venue: "Selhurst Park" },
  { code: "IPS", name: "Ipswich Town", color: "#0044A9", dark: false, logoUrl: "image/Ipswich.svg", venue: "Portman Road" },
  { code: "SUN", name: "Sunderland AFC", color: "#EB172B", dark: false, logoUrl: "image/Sunderland.svg", venue: "Stadium of Light" },
  { code: "NFO", name: "Nottingham Forest", color: "#DD0000", dark: false, logoUrl: "image/Forest.svg", venue: "The City Ground" },
  { code: "LEE", name: "Leeds United", color: "#FFCD00", dark: true, logoUrl: "image/Leeds.svg", venue: "Elland Road" },
  { code: "BRE", name: "Brentford FC", color: "#E30613", dark: false, logoUrl: "image/Brentford.svg", venue: "Gtech Community Stadium" },
  { code: "TOT", name: "Tottenham Hotspur", color: "#132257", dark: false, logoUrl: "image/Spurs.svg", venue: "Tottenham Hotspur Stadium" },
  { code: "BRI", name: "Brighton & Hove Albion", color: "#0057B8", dark: false, logoUrl: "image/Brighton.svg", venue: "Amex Stadium" },
  { code: "AVL", name: "Aston Villa", color: "#670E36", dark: false, logoUrl: "image/Villa.svg", venue: "Villa Park" },
  { code: "MCI", name: "Manchester City", color: "#6CABDD", dark: true, logoUrl: "image/Man%20City.svg", venue: "Etihad Stadium" },
  { code: "BOU", name: "AFC Bournemouth", color: "#B50E12", dark: false, logoUrl: "image/Bournemouth.svg", venue: "Vitality Stadium" },
  { code: "NEW", name: "Newcastle United", color: "#241F20", dark: false, logoUrl: "image/Newcastle.svg", venue: "St James' Park" },
  { code: "LFC", name: "Liverpool FC", color: "#C8102E", dark: false, logoUrl: "image/Liverpool.svg", venue: "Anfield" },
  { code: "FUL", name: "Fulham FC", color: "#1A1A1A", dark: false, logoUrl: "image/Fulham.svg", venue: "Craven Cottage" },
  { code: "CFC", name: "Chelsea FC", color: "#034694", dark: false, logoUrl: "image/Chelsea.svg", venue: "Stamford Bridge" }
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

/* ============================================================
   カレンダー(.ics / Googleカレンダー)生成の共通ユーティリティ
   ============================================================ */
function pad2(n) { return String(n).padStart(2, '0'); }
function toICSDate(d) {
  return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' + pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + pad2(d.getUTCSeconds()) + 'Z';
}
function buildEventBlock(f) {
  const homeT = teamByCode[f.home], awayT = teamByCode[f.away];
  const start = new Date(f.start);
  const end = new Date(start.getTime() + 2 * 3600000);
  const title = `${homeT.name} vs ${awayT.name}`;
  const details = `プレミアリーグ 第${f.mw}節\\n${homeT.name} (Home) vs ${awayT.name} (Away)`;
  const location = (homeT.venue || 'Premier League').replace(/,/g, '\\,');
  return [
    'BEGIN:VEVENT',
    'UID:' + f.id + '@pl-matchday-calendar',
    'DTSTAMP:' + toICSDate(new Date()),
    'DTSTART:' + toICSDate(start),
    'DTEND:' + toICSDate(end),
    'SUMMARY:' + title,
    'DESCRIPTION:' + details,
    'LOCATION:' + location,
    'END:VEVENT'
  ].join('\r\n');
}
function buildGCalUrl(f) {
  const homeT = teamByCode[f.home], awayT = teamByCode[f.away];
  const start = new Date(f.start);
  const end = new Date(start.getTime() + 2 * 3600000);
  const title = `${homeT.name} vs ${awayT.name}`;
  const details = `プレミアリーグ 第${f.mw}節\n${homeT.name} (Home) vs ${awayT.name} (Away)`;
  const location = homeT.venue || 'Premier League';
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(title)
    + '&dates=' + toICSDate(start) + '/' + toICSDate(end)
    + '&details=' + encodeURIComponent(details)
    + '&location=' + encodeURIComponent(location);
}
function downloadICSForMatches(fixtureList, filename) {
  if (!fixtureList.length) return;
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PL Matchday Calendar//JP', 'CALSCALE:GREGORIAN',
    ...fixtureList.map(buildEventBlock),
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
  const t = { code, name: (apiTeam && apiTeam.name) || code, color: "#5f6b62", dark: false, logoUrl: (apiTeam && apiTeam.crest) || "", venue: "" };
  TEAMS.push(t);
  teamByCode[code] = t;
}

/* ============================================================
   サイト共通設定（お気に入りチーム／ネタバレ防止）
   ------------------------------------------------------------
   settings.html で変更した内容が index.html / standings.html /
   scorers.html すべてに反映されるよう、localStorage の1キーに
   まとめて保存する。旧バージョン（pl_favorite_teams / pl_bookmarks）
   からの移行にも対応。
   ============================================================ */
const SETTINGS_KEY = 'pl_app_settings_v2';

function loadSettings() {
  let settings = { favorites: [], spoilerProtection: false };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      settings.favorites = Array.isArray(parsed.favorites) ? parsed.favorites : [];
      settings.spoilerProtection = !!parsed.spoilerProtection;
      return settings;
    }
  } catch (e) { /* fallthrough */ }
  // 旧キーからの移行（初回のみ）
  try {
    const oldFav = JSON.parse(localStorage.getItem('pl_favorite_teams') || '[]');
    if (Array.isArray(oldFav) && oldFav.length) settings.favorites = oldFav;
  } catch (e) { /* noop */ }
  saveSettings(settings);
  return settings;
}
function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* noop */ }
}

/* ネタバレ防止で一度確認したスコアのID一覧（試合カード単位） */
const REVEALED_KEY = 'pl_revealed_scores';
function loadRevealed() {
  try { return JSON.parse(localStorage.getItem(REVEALED_KEY) || '[]'); } catch (e) { return []; }
}
function saveRevealed(list) {
  try { localStorage.setItem(REVEALED_KEY, JSON.stringify(list)); } catch (e) { /* noop */ }
}
function markRevealed(matchId) {
  const list = loadRevealed();
  if (!list.includes(matchId)) {
    list.push(matchId);
    saveRevealed(list);
  }
}
function isRevealed(matchId) {
  return loadRevealed().includes(matchId);
}

/* ============================================================
   ダービーマッチ判定
   ------------------------------------------------------------
   ここに追記すれば新しいライバル対決も認識されるようになる。
   ============================================================ */
const DERBIES = [
  { pair: ["ARS", "TOT"], name: "ノースロンドン・ダービー" },
  { pair: ["MUN", "MCI"], name: "マンチェスター・ダービー" },
  { pair: ["MUN", "LFC"], name: "ノースウエスト・ダービー" },
  { pair: ["EVE", "LFC"], name: "マージーサイド・ダービー" },
  { pair: ["NEW", "SUN"], name: "タイン・ウェア・ダービー" },
  { pair: ["ARS", "CFC"], name: "ロンドン・ダービー" },
  { pair: ["CFC", "TOT"], name: "ロンドン・ダービー" },
  { pair: ["CFC", "FUL"], name: "ロンドン・ダービー" },
  { pair: ["CRY", "BRI"], name: "M23ダービー" },
  { pair: ["AVL", "NFO"], name: "ミッドランド・ダービー" }
];
function findDerby(codeA, codeB) {
  return DERBIES.find(d =>
    (d.pair[0] === codeA && d.pair[1] === codeB) ||
    (d.pair[0] === codeB && d.pair[1] === codeA)
  ) || null;
}

/* ============================================================
   シーズン切り替え用の選択肢
   ------------------------------------------------------------
   value はシーズン開幕年（Football-Data.orgのseasonパラメータと同じ）。
   過去シーズンはAPI取得時にそのまま season=xxxx で問い合わせる。
   ============================================================ */
const AVAILABLE_SEASONS = [
  { value: SEASON_YEAR, label: "2026-27（今シーズン）" },
  { value: SEASON_YEAR - 1, label: "2025-26" },
  { value: SEASON_YEAR - 2, label: "2024-25" }
];

/* ============================================================
   共通ヘッダー（ナビゲーション）
   ------------------------------------------------------------
   各ページの <div id="siteHeaderMount"></div> に差し込む。
   activePage: 'schedule' | 'standings' | 'scorers' | 'settings'
   ============================================================ */
function renderSiteHeader(activePage) {
  const mount = document.getElementById('siteHeaderMount');
  if (!mount) return;
  const links = [
    { key: 'schedule', href: 'index.html', label: '試合日程' },
    { key: 'standings', href: 'standings.html', label: '順位表' },
    { key: 'scorers', href: 'scorers.html', label: '個人成績' },
    { key: 'settings', href: 'settings.html', label: '設定' }
  ];
  mount.outerHTML = `
    <header class="site-header" id="siteHeader">
      <div class="site-header-inner">
        <span class="brand">⚽ <span class="brand-mark">PL</span> Calendar</span>
        <nav class="site-nav">
          ${links.map(l => `<a href="${l.href}" class="nav-link ${l.key === activePage ? 'active' : ''}">${l.label}</a>`).join('')}
        </nav>
      </div>
    </header>
  `;
  const siteHeader = document.getElementById('siteHeader');
  function updateHeaderShadow() { siteHeader.classList.toggle('is-scrolled', window.scrollY > 4); }
  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  updateHeaderShadow();
}
