<h1 align="center">ZHQ</h1>

<div align="center">

基於 **BM25** 與 **Jieba 斷詞** 的中文檢索引擎，  
完全運行於客戶端，適用於 問答、搜尋、內容推薦、文本比對。

</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/zhq?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/zhq)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/zhq?style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/package/zhq)
[![Coverage Status](https://img.shields.io/coveralls/github/yiming-liao/zhq.svg?branch=main&style=flat&colorA=000000&colorB=000000)](https://coveralls.io/github/yiming-liao/zhq?branch=main)
[![TypeScript](https://img.shields.io/badge/TypeScript-%E2%9C%94-blue?style=flat&colorA=000000&colorB=000000)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/zhq?style=flat&colorA=000000&colorB=000000)](LICENSE)

</div>

> 瀏覽器搞定一切，放過你的伺服器。

---

## 範例展示

<div align="center">

#### [![🌐 線上 Demo：互動式問答 Chatbot ↗](https://img.shields.io/badge/👉%20%E7%B7%9A%E4%B8%8A%20Demo%EF%BC%9A%E4%BA%92%E5%8B%95%E5%BC%8F%E5%95%8F%E7%AD%94%20Chatbot%20🌐-3e668c?style=for-the-badge)](https://zhq-js.github.io/)

</div>

###

<sub>

- [入門 HTML 範例](https://github.com/yiming-liao/zhq/tree/main/examples/html) ( npm run examples:html )

- [入門 React 範例](https://github.com/yiming-liao/zhq/tree/main/examples/react) ( npm run examples:react )

</sub>

---

## 安裝

```bash
# npm
npm install zhq

# yarn
yarn add zhq

# pnpm
pnpm add zhq
```

或直接使用 CDN 載入（ESM）：

```js
import { createZhq } from "https://cdn.jsdelivr.net/npm/zhq/+esm";
```

---

## 快速開始

#### 1. 準備文檔

準備一組用來建立搜尋索引的資料，後續查詢會基於這些內容進行比對。

```ts
import type { Document } from "zhq";

const documents: Document[] = [
  {
    text: "ZHQ是什麼？", // text: 與使用者輸入做相似度比對
    content: "ZHQ是一個基於TF-IDF與Jieba斷詞的中文檢索引擎", // content: 匹配成功時回傳給使用者的內容
  },
];
```

#### 2. 初始化 ZHQ

將 `documents` 傳入 `createZhq()` 來建立 ZHQ 實例、自動載入 WASM 並建立好索引。

```ts
const zhq = await createZhq(documents);
```

#### 3. 查詢資料

使用 `query()`，將 `input` 與文檔索引比對，找出最相似的文檔。

```ts
const input = "ZHQ是？";

const { bestMatch, candidates } = zhq.query(input);
// bestMatch ➔ {
//     "text": "ZHQ是什麼？",
//     "content": "ZHQ是一個基於TF-IDF與Jieba斷詞的中文檢索引擎",
//     "score": 0.8660254037844385,
//     ...
//  }
```

> <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Party%20Popper.png" alt="Party Popper" width="20" height="20" /> _恭喜！你已經完成 ZHQ 的基本使用流程！_

### 自訂選項

#### › createZhq

您可以自訂 `wasmURL`，適用於 **本地託管 WASM 檔案**，詳見 [進階用法 ⤵︎](#一-本地託管-wasm-檔案)

```ts
const zhq = await createZhq(documents, {
  wasmURL: "/path/to/jieba_rs_wasm_bg.wasm", // 預設為 "https://cdn.jsdelivr.net/npm/zhq/jieba_rs_wasm_bg.wasm"
});
```

#### › zhq.query

您可以在查詢時調整相似度門檻與回傳候選數量。

```ts
const { bestMatch, candidates } = zhq.query(input, {
  threshold: 0.6, // 相似度閾值 (0~1)，預設為 0.3
  topKCandidates: 2, // 指定回傳最接近的 candidates 數量，預設為 3
});
```

---

## 進階用法

### 一、 本地託管 WASM 檔案

在套件安裝後，可於 `node_modules` 中找到 **Jieba WASM** 檔案：

```bash
node_modules/zhq/jieba_rs_wasm_bg.wasm
```

將此 WASM 檔案複製到可以被瀏覽器讀取的公開資料夾，例如 **Vite** 或 **Next.js** 的 public 資料夾。

```bash
# 放置路徑範例：
public/jieba_rs_wasm_bg.wasm
```

### 二、 Lazy Loading

初始化 ZHQ：不傳入 `documents`，並手動分階段載入：

```ts
// (1) 注意：此處請不要傳入 documents，否則 ZHQ 會自動同步初始化
const zhq = await createZhq();

// (2) 手動載入 Jieba WASM
await zhq.initJieba();

// (3) 非同步建立索引 （此範例不使用 await，讓索引於背景建立）
zhq.buildIndexAsync(documents);
```

查詢資料：如果使用了 `buildIndexAsync`，索引可能仍在建立，請使用 `queryAsync()`：

```ts
// 非同步查詢，若索引未完成，會等待索引建立後再回傳結果
const { bestMatch, candidates } = await zhq.queryAsync(input);
```

### 三、 Lifecycle Events

當你需要在 UI 中掌握 ZHQ 的初始化與索引狀態時，可以透過 lifecycle events 來監聽內部流程。

ZHQ 提供以下事件：

- `onJiebaReady`：Jieba WASM 載入完成
- `onIndexReady`：文件索引建立完成
- `onProgress`：索引建立進度更新（0 ~ 1）
- `onError`：初始化或索引過程發生錯誤

使用範例：

```ts
const zhq = await createZhq();

zhq.onJiebaReady = () => {
  console.log("Jieba 載入完成");
};

zhq.onIndexReady = () => {
  console.log("索引建立完成");
};

zhq.onProgress = (progress) => {
  console.log(`索引進度：${Math.round(progress * 100)}%`);
};

zhq.onError = (err) => {
  console.error("ZHQ 發生錯誤：", err);
};

// await zhq.initJieba();
// zhq.buildIndexAsync(documents);
```

---

## 第三方引用

- 本專案中直接引用了 [jieba-wasm](https://github.com/fengkx/jieba-wasm) 相關檔案
- 結巴相關連結： [jieba](https://github.com/fxsjy/jieba), [jieba-rs](https://github.com/messense/jieba-rs)
