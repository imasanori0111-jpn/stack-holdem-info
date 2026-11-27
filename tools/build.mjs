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
  ["beginner", "初心者ガイド"],
  ["stores", "店舗を探す"],
  ["rules", "ルール"],
  ["guide", "遊び方"],
  ["stack-holdem", "スタックホールデム"],
  ["gto", "STACK GTO"],
];

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const href = (key, R = "../") => (key === "stack-holdem" ? `${R}#modes` : key === "top" ? R : `${R}${key}/`);

function layout({ key, path = `${key}/`, title, desc, eng, h1, lead, toc = [], body, jsonld, crumbs = [], ctaTitle }) {
  const url = `${SITE}/${path}`;
  const R = "../".repeat(path.split("/").filter(Boolean).length);
  const nav = NAV.map(([k, label]) => `<a href="${href(k, R)}"${k === key ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const trail = [["", "トップ"], ...crumbs, [path, h1]];
  const bc = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map(([u, n], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: `${SITE}/${u}` })) };
  const lds = [bc, ...(Array.isArray(jsonld) ? jsonld : jsonld ? [jsonld] : [])];
  const tocHtml = toc.length ? `<ul class="toc">${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ul>` : "";
  const ld = lds.map((j) => `\n<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("");
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
<meta property="og:image" content="${SITE}/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="${R}assets/portal.css">${ld}
</head>
<body>
<a class="skip" href="#main">本文へ移動</a>
<header class="ph"><div class="wrap ph-in">
<a class="brand" href="${R}" aria-label="STACK HOLDEM ポータルのトップ"><span class="suit" aria-hidden="true">♠</span><span>STACK <b>HOLDEM</b></span></a>
<nav class="pnav" aria-label="メインメニュー">${nav}</nav>
<a class="play" href="${GAME}">無料でプレイ ↗</a>
</div></header>
<main id="main">
<div class="ptitle"><div class="wrap">
<p class="crumb">${trail.slice(0, -1).map(([u, n]) => `<a href="${R}${u}">${esc(n)}</a> › `).join("")}${esc(h1)}</p>
<p class="eng">${esc(eng)}</p>
<h1>${esc(h1)}</h1>
<p class="lead">${lead}</p>
${tocHtml}
</div></div>
<div class="wrap body">
${body.trim()}
<aside class="cta-box">
<h2>${esc(ctaTitle || "覚えたら、まずはオンラインで1ハンド。")}</h2>
<p>スタックホールデムは、スマホのブラウザから無料で遊べるテキサスホールデムです。お店に行く前の練習にも。</p>
<div class="btns"><a class="btn gold" href="${GAME}">無料でプレイする ↗</a><a class="btn" href="${R}stores/">近くのお店を探す</a></div>
</aside>
</div>
</main>
<footer class="pf"><div class="wrap">
<nav aria-label="フッターメニュー"><a href="${R}">トップ</a><a href="${R}rules/hands/">役の一覧</a>${NAV.map(([k, l]) => `<a href="${href(k, R)}">${l}</a>`).join("")}<a href="${R}sponsor/">広告掲載・スポンサー募集</a><a href="${GAME}privacy.html">プライバシーポリシー</a></nav>
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
  if (/\/\/(www\.|mobile\.)?(x|twitter)\.com\//.test(url)) return "公式 X";
  if (/instagram\.com\//.test(url)) return "公式 Instagram";
  return "公式サイト";
}

export const PREF_SLUG = { 北海道: "hokkaido", 青森県: "aomori", 岩手県: "iwate", 宮城県: "miyagi", 秋田県: "akita", 山形県: "yamagata", 福島県: "fukushima", 茨城県: "ibaraki", 栃木県: "tochigi", 群馬県: "gunma", 埼玉県: "saitama", 千葉県: "chiba", 東京都: "tokyo", 神奈川県: "kanagawa", 新潟県: "niigata", 富山県: "toyama", 石川県: "ishikawa", 福井県: "fukui", 山梨県: "yamanashi", 長野県: "nagano", 岐阜県: "gifu", 静岡県: "shizuoka", 愛知県: "aichi", 三重県: "mie", 滋賀県: "shiga", 京都府: "kyoto", 大阪府: "osaka", 兵庫県: "hyogo", 奈良県: "nara", 和歌山県: "wakayama", 鳥取県: "tottori", 島根県: "shimane", 岡山県: "okayama", 広島県: "hiroshima", 山口県: "yamaguchi", 徳島県: "tokushima", 香川県: "kagawa", 愛媛県: "ehime", 高知県: "kochi", 福岡県: "fukuoka", 佐賀県: "saga", 長崎県: "nagasaki", 熊本県: "kumamoto", 大分県: "oita", 宮崎県: "miyazaki", 鹿児島県: "kagoshima", 沖縄県: "okinawa" };
const prefShort = (p) => (p === "北海道" ? p : p.replace(/[都府県]$/, ""));

function storeCard(s) {
  const where = [s.city, s.area].filter(Boolean).join(" · ");
  const search = [s.name, s.pref, s.city, s.area, s.address].join(" ");
  const links = s.url ? [`<a href="${esc(s.url)}" rel="noopener" target="_blank">${linkLabel(s.url)} ↗</a>`] : (s.source ? [`<a href="${esc(s.source)}" rel="noopener" target="_blank">掲載元の情報 ↗</a>`] : []);
  if (s.address) links.push(`<a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(s.name + " " + s.address)}" rel="noopener" target="_blank">地図 ↗</a>`);
  return `<li class="store" data-s="${esc(search)}"><h4>${esc(s.name)}</h4><p class="where">${esc(s.pref)} ${esc(where)}</p>${s.address ? `<p class="memo">${esc(s.address)}</p>` : ""}${s.note ? `<p class="memo">${esc(s.note)}</p>` : ""}<p class="links">${links.join("")}</p></li>`;
}

function storeLd(list, name) {
  return { "@context": "https://schema.org", "@type": "ItemList", name, numberOfItems: list.length,
    itemListElement: list.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "EntertainmentBusiness", name: s.name, ...(s.url ? { url: s.url } : {}), address: { "@type": "PostalAddress", addressCountry: "JP", addressRegion: s.pref, addressLocality: s.city, ...(s.address ? { streetAddress: s.address } : {}) } } })) };
}

// 都道府県ごとのページ(/stores/osaka/ など)。「大阪 ポーカー 初心者」のような検索向け
function prefPage(pref, list, byPref, checked) {
  const short = prefShort(pref);
  const cities = [...new Set(list.map((s) => s.city).filter(Boolean))];
  const others = Object.keys(PREF_SLUG).filter((p) => byPref.has(p) && p !== pref).map((p) => `<a href="../${PREF_SLUG[p]}/">${prefShort(p)}(${byPref.get(p).length})</a>`).join("");
  const body = `
<div class="note blue">${esc(checked)} にまとめた情報です。閉店・移転・店名の変更をしていることもあるので、お出かけの前に必ず各店の公式情報で営業日・料金をご確認ください。</div>
<section class="sec"><h2>${esc(pref)}のお店(${list.length}店)</h2>
<p>${esc(cities.slice(0, 8).join("・"))}${cities.length > 8 ? " など" : ""}にあるお店です。はじめての方は「はじめてです」と伝えれば、ルールから教えてくれるお店も多くあります。</p>
<ul class="stores">${list.map(storeCard).join("")}</ul></section>
<section class="sec"><h2>はじめて行く前に</h2>
<ul><li><a href="../../beginner/">ポーカー初心者ガイド</a>: 何から覚えればいいか</li><li><a href="../../rules/hands/">ポーカーの役の一覧と強さ</a>: これだけ覚えれば遊べる</li><li><a href="../../guide/">アミューズメントカジノの遊び方</a>: 入店の流れ・料金・マナー</li></ul>
<div class="note">アミューズメントカジノは、チップを現金や景品に換えない「遊び」の場です。<a href="../#policy">掲載の基準</a>を満たすお店だけを載せています。</div></section>
<section class="sec"><h2>ほかの都道府県</h2><p class="prefs">${others}</p></section>`;
  return {
    key: "stores", path: `stores/${PREF_SLUG[pref]}/`, crumbs: [["stores/", "全国の店舗"]],
    title: `${short}のアミューズメントカジノ・ポーカー店${list.length}店【初心者向けガイド付き】`,
    desc: `${pref}でポーカー(テキサスホールデム)を遊べるアミューズメントカジノ・ポーカールーム${list.length}店。${cities.slice(0, 4).join("・")}など。初心者向けの遊び方・ルールも紹介。`,
    eng: "STORES", h1: `${short}のアミューズメントカジノ・ポーカー店`,
    lead: `${esc(pref)}で、テキサスホールデムを本物のテーブルで遊べるお店をまとめました。`,
    body, jsonld: storeLd(list, `${pref}のアミューズメントカジノ`), ctaTitle: "お店に行く前に、オンラインで練習。",
  };
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
      const items = byPref.get(p).map(storeCard).join("");
      return `<section class="pref" data-pref="${p}"><h3><a href="./${PREF_SLUG[p]}/">${p}<span class="pc">(${byPref.get(p).length})</span></a></h3><ul class="stores">${items}</ul></section>`;
    }).join("");
    return inner ? `<section class="region" data-region="${region}"><h2>${region}</h2>${inner}</section>` : "";
  }).join("\n");
  return `
<div class="note blue">掲載している情報は、各店の公式サイト・公式SNSや、ポーカーの情報サイトなどの公開情報をもとに、${esc(checked)} にまとめたものです。<strong>閉店・移転・店名の変更をしていることもあります。お出かけの前に、必ず各店の公式情報で営業日・料金をご確認ください。</strong>掲載の追加・修正・削除のご依頼は、<a href="https://forms.gle/eThkuMAMHq4MTBRWA" rel="noopener" target="_blank">お問い合わせフォーム</a>から受け付けています。</div>
<form class="filters" role="search" onsubmit="return false">
<label class="q">お店の名前・地名で探す<input id="q" type="search" placeholder="例: 新宿、梅田、天神" autocomplete="off"></label>
<label>地方<select id="region"><option value="">すべて</option>${regionOptions}</select></label>
<label>都道府県<select id="pref"><option value="">すべて</option>${prefOptions}</select></label>
</form>
<p class="count" id="count" aria-live="polite">${stores.length} 店を掲載しています</p>
${sections}
<p class="empty" id="empty" hidden>条件に合うお店が見つかりませんでした。地名を短くするか、地方・都道府県を「すべて」にしてください。</p>
<section class="note" id="policy" aria-labelledby="policy-title"><strong id="policy-title">掲載の基準</strong><br>アミューズメントカジノは、チップを現金や景品に換えない「遊び」の場です。このページには、次の条件を満たすお店だけを載せています。<br>・営業していることを、公式サイト、日本ポーカー事業者連盟(JPBA)の加盟店一覧、ポーカーの情報サイトのいずれかで確かめられた<br>・お店や紹介のページに、換金・景品交換・賞金などをうかがわせる記載がない<br>掲載はお店の営業内容や法令への適合を保証するものではありません。チップの換金や景品との交換をすすめられたら、遊ぶのをやめてください。</section>
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
    title: "全国のアミューズメントカジノ・ポーカー店一覧【都道府県別・初心者OK】",
    desc: "ポーカー(テキサスホールデム)を遊べる全国のアミューズメントカジノ・ポーカールームを都道府県別に紹介。東京・大阪・名古屋・福岡など。初心者向けの遊び方も。",
    eng: "STORES",
    h1: "全国のアミューズメントカジノ",
    lead: "テキサスホールデムを、実際のテーブルで遊べるお店を都道府県ごとにまとめました。はじめての方は、先に<a href=\"../guide/\">アミューズメントカジノの遊び方</a>をどうぞ。",
  },
  { key: "beginner", file: "beginner.html", title: "ポーカー初心者ガイド｜何から覚える？ルール・役・遊べる場所", desc: "ポーカーをはじめたい初心者向けガイド。テキサスホールデムのルール、まず覚える役、無料で練習する方法、アミューズメントカジノでデビューするまでを順番に紹介。", eng: "FOR BEGINNERS", h1: "ポーカー初心者ガイド", lead: "「ポーカーをやってみたいけど、何から始めればいい？」という方へ。4つのステップで、ルールを覚えてお店で遊べるようになるまでを案内します。",
    toc: [["step1", "ルールを知る"], ["step2", "役を覚える"], ["step3", "無料で練習"], ["step4", "お店で遊ぶ"], ["faq", "よくある質問"]] },
  { key: "rules", file: "rules.html", title: "テキサスホールデムのルール【初心者向け】役・流れ・用語をやさしく解説", desc: "ポーカー(テキサスホールデム)のルールを初心者向けにやさしく解説。役の強さ、1ハンドの流れ、チェック・コール・レイズなどのアクション、ポジション、勝ち負けの決め方。", eng: "RULES", h1: "テキサスホールデムのルール", lead: "世界でいちばん遊ばれているポーカー「テキサスホールデム」のルールを、はじめての方向けにまとめました。",
    toc: [["goal", "目的"], ["hands", "役の強さ"], ["flow", "1ハンドの流れ"], ["actions", "アクション"], ["position", "ポジション"], ["showdown", "勝敗の決め方"], ["words", "用語"]] },
  { key: "rules", path: "rules/hands/", file: "hands.html", crumbs: [["rules/", "ルール"]], title: "ポーカーの役一覧と強さ【早見表】初心者でもすぐわかる", desc: "ポーカーの役10種類を強い順に一覧で紹介。ロイヤルフラッシュからハイカードまで、例と確率、同じ役どうしの勝ち負け、初心者がまちがえやすいポイント。", eng: "HAND RANKINGS", h1: "ポーカーの役一覧と強さ", lead: "ポーカーの役は10種類。強い順に、例のカードと出やすさを並べた早見表です。テキサスホールデムでも、ほかのポーカーでも共通です。",
    toc: [["list", "役の早見表"], ["tie", "同じ役のとき"], ["mistakes", "まちがえやすい点"], ["faq", "よくある質問"]] },
  { key: "guide", file: "guide.html", title: "アミューズメントカジノの遊び方｜初めてのポーカールーム入門", desc: "はじめてのアミューズメントカジノ・ポーカールームの遊び方。入店から会員登録、料金とチップ、リングゲームとトーナメント、マナー、1人でも行けるかまで初心者向けに解説。", eng: "HOW TO PLAY", h1: "アミューズメントカジノの遊び方", lead: "はじめてお店に行くときの流れと、知っておくと安心なマナーをまとめました。お店によって決まりが違うので、くわしくは各店の案内に従ってください。",
    toc: [["what", "どんなところ？"], ["flow", "入店から遊ぶまで"], ["games", "リングとトーナメント"], ["manners", "マナー"], ["online", "オンラインで練習"], ["faq", "よくある質問"]] },
  { key: "gto", file: "gto.html", title: "STACK GTO｜GTOとは？ポーカー戦略の基本", desc: "STACK GTO は、ポーカーの戦略を研究・学習するための関連サービスです(準備中)。GTO(ゲーム理論的に最適な戦略)とは何かを初心者向けに紹介します。", eng: "STACK GTO", h1: "STACK GTO", lead: "ポーカーの判断を振り返り、戦略を学ぶための研究・学習サービスです。いまは準備中です。" },
];

// ページの「よくある質問」(id="faq" の h3 と次の p)を FAQPage の構造化データにする
function faqLd(html) {
  const i = html.indexOf('id="faq"');
  if (i < 0) return null;
  const sec = html.slice(i, html.indexOf("</section>", i));
  const strip = (t) => t.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const qa = [...sec.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => ({ "@type": "Question", name: strip(m[1]), acceptedAnswer: { "@type": "Answer", text: strip(m[2]) } }));
  return qa.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: qa } : null;
}

function write(page) {
  const out = join(ROOT, page.path || `${page.key}/`, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, layout(page));
  return page.path || `${page.key}/`;
}

function main() {
  const data = JSON.parse(readFileSync(join(ROOT, "data/stores.json"), "utf8"));
  const urls = [""];
  for (const p of PAGES) {
    const body = p.key === "stores" && !p.file ? storesBody(data) : readFileSync(join(ROOT, "tools/pages", p.file), "utf8");
    const jsonld = p.key === "stores" && !p.file ? storeLd(data.stores, p.title) : faqLd(body);
    urls.push(write({ ...p, body, jsonld }));
  }
  const byPref = new Map();
  for (const s of data.stores) (byPref.get(s.pref) || byPref.set(s.pref, []).get(s.pref)).push(s);
  for (const [pref, list] of byPref) {
    list.sort((a, b) => (a.city + a.name).localeCompare(b.city + b.name, "ja"));
    urls.push(write(prefPage(pref, list, byPref, data.checked)));
  }
  console.log("wrote", urls.length - 1, "pages");
  const today = new Date().toISOString().slice(0, 10);
  urls.push("sponsor/", "sponsor/privacy/");
  writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}/${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
  console.log("wrote sitemap.xml");
}

main();
