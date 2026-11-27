// ポータルの下のページを作る: node tools/build.mjs
// 本文は tools/pages/*.html、店舗は data/stores.json。上の帯とフッターはここで共通にする。
// できたファイル(stores/ rules/ guide/ gto/ の index.html・sitemap.xml)もコミットする(GitHub Pages はそのまま出す)。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://info.stack-poker.com";
const GAME = "https://stack-poker.com/";

export const NAV = [
  ["stores", "店舗を探す"],
  ["rules", "ルール"],
  ["guide", "遊び方"],
  ["stack-holdem", "スタックホールデム"],
  ["gto", "STACK GTO"],
];

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const href = (key) => (key === "stack-holdem" ? "../#modes" : `../${key}/`);

function layout({ key, title, desc, eng, h1, lead, toc = [], body, jsonld }) {
  const url = `${SITE}/${key}/`;
  const nav = NAV.map(([k, label]) => `<a href="${href(k)}"${k === key ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const tocHtml = toc.length ? `<ul class="toc">${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ul>` : "";
  const ld = jsonld ? `\n<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : "";
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0b101b">
<title>${esc(title)} | スタックホールデム</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="STACK HOLDEM">
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="${esc(title)} | スタックホールデム">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../assets/portal.css">${ld}
</head>
<body>
<a class="skip" href="#main">本文へ移動</a>
<header class="ph"><div class="wrap ph-in">
<a class="brand" href="../" aria-label="STACK HOLDEM ポータルのトップ"><span class="suit" aria-hidden="true">♠</span><span>STACK <b>HOLDEM</b></span></a>
<nav class="pnav" aria-label="メインメニュー">${nav}</nav>
<a class="play" href="${GAME}">無料でプレイ ↗</a>
</div></header>
<main id="main">
<div class="ptitle"><div class="wrap">
<p class="crumb"><a href="../">トップ</a> › ${esc(h1)}</p>
<p class="eng">${esc(eng)}</p>
<h1>${esc(h1)}</h1>
<p class="lead">${lead}</p>
${tocHtml}
</div></div>
<div class="wrap body">
${body.trim()}
<aside class="cta-box">
<h2>覚えたら、まずはオンラインで1ハンド。</h2>
<p>スタックホールデムは、スマホのブラウザから無料で遊べるテキサスホールデムです。お店に行く前の練習にも。</p>
<div class="btns"><a class="btn gold" href="${GAME}">無料でプレイする ↗</a><a class="btn" href="../stores/">近くのお店を探す</a></div>
</aside>
</div>
</main>
<footer class="pf"><div class="wrap">
<nav aria-label="フッターメニュー"><a href="../">トップ</a>${NAV.map(([k, l]) => `<a href="${href(k)}">${l}</a>`).join("")}<a href="../sponsor/">広告掲載・スポンサー募集</a><a href="${GAME}privacy.html">プライバシーポリシー</a></nav>
<p class="copy">© STACK</p>
</div></footer>
</body>
</html>
`;
}

// 地方 → 都道府県の順(北から)
export const REGIONS = [
  ["北海道・東北", ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"]],
  ["関東", ["東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県"]],
  ["中部", ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"]],
  ["近畿", ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"]],
  ["中国・四国", ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"]],
  ["九州・沖縄", ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"]],
];

function linkLabel(url) {
  if (/(^|\.)x\.com\/|twitter\.com\//.test(url)) return "公式 X";
  if (/instagram\.com\//.test(url)) return "公式 Instagram";
  return "公式サイト";
}

function storesBody(data) {
  const { checked, stores } = data;
  const byPref = new Map();
  for (const s of stores) {
    if (!byPref.has(s.pref)) byPref.set(s.pref, []);
    byPref.get(s.pref).push(s);
  }
  for (const list of byPref.values()) list.sort((a, b) => (a.city + a.name).localeCompare(b.city + b.name, "ja"));
  const prefOptions = REGIONS.flatMap(([, prefs]) => prefs.filter((p) => byPref.has(p)).map((p) => `<option>${p}</option>`)).join("");
  const regionOptions = REGIONS.filter(([, prefs]) => prefs.some((p) => byPref.has(p))).map(([r]) => `<option>${r}</option>`).join("");
  const sections = REGIONS.map(([region, prefs]) => {
    const inner = prefs.filter((p) => byPref.has(p)).map((p) => {
      const items = byPref.get(p).map((s) => {
        const where = [s.city, s.area].filter(Boolean).join(" · ");
        const search = [s.name, s.pref, s.city, s.area, s.address].join(" ");
        const links = [`<a href="${esc(s.url)}" rel="noopener" target="_blank">${linkLabel(s.url)} ↗</a>`];
        if (s.address) links.push(`<a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(s.name + " " + s.address)}" rel="noopener" target="_blank">地図 ↗</a>`);
        return `<li class="store" data-s="${esc(search)}"><h4>${esc(s.name)}</h4><p class="where">${esc(s.pref)} ${esc(where)}</p>${s.address ? `<p class="memo">${esc(s.address)}</p>` : ""}${s.note ? `<p class="memo">${esc(s.note)}</p>` : ""}<p class="links">${links.join("")}</p></li>`;
      }).join("");
      return `<section class="pref" data-pref="${p}"><h3>${p}<span class="pc">(${byPref.get(p).length})</span></h3><ul class="stores">${items}</ul></section>`;
    }).join("");
    return inner ? `<section class="region" data-region="${region}"><h2>${region}</h2>${inner}</section>` : "";
  }).join("\n");
  return `
<div class="note blue">掲載している情報は、各店の公式サイト・公式SNSなどの公開情報をもとに、${esc(checked)} に確認したものです。<strong>営業時間・料金・イベントは変わることがあるので、お出かけの前に必ず各店の公式情報をご確認ください。</strong>掲載の追加・修正・削除のご依頼は、<a href="https://forms.gle/eThkuMAMHq4MTBRWA" rel="noopener" target="_blank">お問い合わせフォーム</a>から受け付けています。</div>
<form class="filters" role="search" onsubmit="return false">
<label class="q">お店の名前・地名で探す<input id="q" type="search" placeholder="例: 新宿、梅田、天神" autocomplete="off"></label>
<label>地方<select id="region"><option value="">すべて</option>${regionOptions}</select></label>
<label>都道府県<select id="pref"><option value="">すべて</option>${prefOptions}</select></label>
</form>
<p class="count" id="count" aria-live="polite">${stores.length} 店を掲載しています</p>
${sections}
<p class="empty" id="empty" hidden>条件に合うお店が見つかりませんでした。地名を短くするか、地方・都道府県を「すべて」にしてください。</p>
<div class="note">アミューズメントカジノは、チップを現金や景品に換えない「遊び」の場です。チップや得点を換金・景品交換するお店は違法になるおそれがあります。このページはお店を紹介するだけで、各店の営業内容を保証するものではありません。</div>
<script>
(() => {
  const q = document.getElementById("q"), rg = document.getElementById("region"), pf = document.getElementById("pref");
  const count = document.getElementById("count"), empty = document.getElementById("empty");
  const norm = (s) => s.normalize("NFKC").toLowerCase().replace(/\\s+/g, "");
  function apply() {
    const words = q.value.normalize("NFKC").toLowerCase().split(/\\s+/).filter(Boolean);
    let n = 0;
    for (const region of document.querySelectorAll(".region")) {
      let rn = 0;
      for (const pref of region.querySelectorAll(".pref")) {
        let pn = 0;
        for (const s of pref.querySelectorAll(".store")) {
          const text = norm(s.dataset.s);
          const ok = (!rg.value || region.dataset.region === rg.value) && (!pf.value || pref.dataset.pref === pf.value) && words.every((w) => text.includes(w));
          s.hidden = !ok; if (ok) pn++;
        }
        pref.hidden = !pn; rn += pn;
      }
      region.hidden = !rn; n += rn;
    }
    count.textContent = n + " 店" + (q.value || rg.value || pf.value ? "が見つかりました" : "を掲載しています");
    empty.hidden = n > 0;
  }
  q.addEventListener("input", apply); rg.addEventListener("change", () => { pf.value = ""; apply(); }); pf.addEventListener("change", apply);
  const p = new URLSearchParams(location.search);
  if (p.get("pref")) pf.value = p.get("pref");
  if (p.get("q")) q.value = p.get("q");
  apply();
})();
</script>`;
}

const PAGES = [
  {
    key: "stores",
    title: "全国のアミューズメントカジノ・ポーカールーム一覧",
    desc: "全国のアミューズメントカジノ・ポーカールームを都道府県別に紹介。お店の名前や地名で探せます。",
    eng: "STORES",
    h1: "全国のアミューズメントカジノ",
    lead: "テキサスホールデムを、実際のテーブルで遊べるお店を都道府県ごとにまとめました。はじめての方は、先に<a href=\"../guide/\">アミューズメントカジノの遊び方</a>をどうぞ。",
  },
  { key: "rules", file: "rules.html", title: "テキサスホールデムのルール", desc: "テキサスホールデム・ポーカーのルールを図でやさしく解説。役の強さ、1ハンドの流れ、ベットの種類、ポジション、勝ち負けの決め方。", eng: "RULES", h1: "テキサスホールデムのルール", lead: "世界でいちばん遊ばれているポーカー「テキサスホールデム」のルールを、はじめての方向けにまとめました。",
    toc: [["goal", "目的"], ["hands", "役の強さ"], ["flow", "1ハンドの流れ"], ["actions", "アクション"], ["position", "ポジション"], ["showdown", "勝敗の決め方"], ["words", "用語"]] },
  { key: "guide", file: "guide.html", title: "アミューズメントカジノの遊び方", desc: "はじめてのアミューズメントカジノ・ポーカールームの遊び方。入店から会員登録、チップの受け取り、リングゲームとトーナメント、マナーまで。", eng: "HOW TO PLAY", h1: "アミューズメントカジノの遊び方", lead: "はじめてお店に行くときの流れと、知っておくと安心なマナーをまとめました。お店によって決まりが違うので、くわしくは各店の案内に従ってください。",
    toc: [["what", "どんなところ？"], ["flow", "入店から遊ぶまで"], ["games", "リングとトーナメント"], ["manners", "マナー"], ["online", "オンラインで練習"], ["faq", "よくある質問"]] },
  { key: "gto", file: "gto.html", title: "STACK GTO", desc: "STACK GTO は、ポーカーの戦略を研究・学習するための関連サービスです(準備中)。GTO とは何かもあわせて紹介します。", eng: "STACK GTO", h1: "STACK GTO", lead: "ポーカーの判断を振り返り、戦略を学ぶための研究・学習サービスです。いまは準備中です。" },
];

function main() {
  const data = JSON.parse(readFileSync(join(ROOT, "data/stores.json"), "utf8"));
  for (const p of PAGES) {
    const body = p.key === "stores" ? storesBody(data) : readFileSync(join(ROOT, "tools/pages", p.file), "utf8");
    let jsonld;
    if (p.key === "stores") {
      jsonld = { "@context": "https://schema.org", "@type": "ItemList", name: p.title, numberOfItems: data.stores.length,
        itemListElement: data.stores.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "EntertainmentBusiness", name: s.name, url: s.url, address: { "@type": "PostalAddress", addressCountry: "JP", addressRegion: s.pref, addressLocality: s.city, ...(s.address ? { streetAddress: s.address } : {}) } } })) };
    }
    const out = join(ROOT, p.key, "index.html");
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, layout({ ...p, body, jsonld }));
    console.log("wrote", p.key + "/index.html");
  }
  const urls = ["", ...PAGES.map((p) => p.key + "/"), "sponsor/", "sponsor/privacy/"];
  writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}/${u}</loc></url>`).join("\n")}\n</urlset>\n`);
  console.log("wrote sitemap.xml");
}

main();
