# stack-holdem-info

STACK HOLDEM のポーカーポータル(https://info.stack-poker.com/)。

- トップ: `index.html`(手で編集)
- 店舗・ルール・遊び方・STACK GTO: `node tools/build.mjs` で作る
  - 本文: `tools/pages/*.html` / 店舗: `data/stores.json`
  - 上の帯・フッター・サイトマップは `tools/build.mjs`
- 店舗データの `confidence`・`research` は調べたときのメモ(画面には出ない)。`note` だけ画面に出る
- 外した店(閉店・未確認): `data/excluded-*.json`
