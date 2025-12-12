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

## 範例展示

#### [👉 線上 Demo：互動式問答 Chatbot ↗](https://zhq-js.github.io/)

- [入門 HTML 範例](https://github.com/yiming-liao/zhq/tree/main/examples/html) ( npm run examples:html )

- [入門 React 範例](https://github.com/yiming-liao/zhq/tree/main/examples/react) ( npm run examples:react )

## 安裝

```bash
# npm
npm install zhq
# yarn
yarn add zhq
# pnpm
pnpm add zhq
```

## 前置作業

- **設置 Jieba WASM 檔案**

安裝完成後，需要先在 `node_modules/zhq` 中找到 **Jieba WASM** 檔案：

```
node_modules/zhq/jieba_rs_wasm_bg.wasm
```

將此 WASM 檔案複製到可以被瀏覽器讀取的公開資料夾，例如：Vite 的 public 資料夾, Next.js 的 public 資料夾, ...

```
放置路徑範例：
public/jieba_rs_wasm_bg.wasm
```

> ZHQ 預設讀取路徑：`/jieba_rs_wasm_bg.wasm`

## 使用方式

#### 1. 準備文檔

```ts
import type { Document } from "zhq";

const documents: Document[] = [
  {
    text: "ZHQ是什麼？", // text: 用來與使用者輸入做相似度比對
    content: "ZHQ是一個基於TF-IDF與Jieba斷詞的中文檢索引擎",
  },
  {
    text: "ZHQ的功能？",
    content: "ZHQ適用於 問答、搜尋、推薦、文本比對。",
  },
];
```

#### 2. 初始化 ZHQ

使用 `createZhq()` 來建立 ZHQ 實例

- 如果在此函數傳入 `documents`，ZHQ 會**自動載入 WASM** 以及**建立索引**。

```ts
// 基本用法
const zhq = await createZhq(documents);

// 自訂選項
const zhq = await createZhq(documents, {
  wasmPath: "/path/to/jieba_rs_wasm_bg.wasm", // 預設為 "/jieba_rs_wasm_bg.wasm"
});
```

#### 3. 查詢資料

使用 `query()`，將 `input` 與文檔索引比對，找出最相似的文檔。

```ts
// 基本用法
const { bestMatch, candidates } = zhq.query(input);

// 自訂選項
const { bestMatch, candidates } = zhq.query(input, {
  topKCandidates: 2, // 指定回傳最接近的 candidates 數量，預設為 3
  threshold: 0.6, // 相似度閾值 (0~1)，預設為 0.3
});
```

## 進階用法

### 一、 Lazy Loading

**初始化 ZHQ：** 不傳入 `documents`，並手動分階段載入：

```ts
const zhq = await createZhq();
await zhq.initJieba(); // 載入 Jieba
zhq.buildIndexAsync(documents); // 背景建立索引（不阻塞主執行緒）
```

**查詢資料：** 如果使用了 `buildIndexAsync`，索引可能仍在建立，請使用 `queryAsync()`：

```ts
// 非同步查詢，若索引未完成，會等待索引建立後再回傳結果
const { bestMatch, candidates } = await zhq.queryAsync(input);
```

### 二、 Lifecycle Events

當你需要在 UI 中掌握 ZHQ 的初始化與索引狀態時，可以透過 lifecycle events 來監聽內部流程。

ZHQ 提供以下事件：

- `onJiebaReady`：Jieba WASM 載入完成
- `onIndexReady`：文件索引建立完成
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

zhq.onError = (err) => {
  console.error("ZHQ 發生錯誤：", err);
};

await zhq.initJieba();
zhq.buildIndexAsync(documents);
```

---

## 第三方引用

- 本專案中直接引用了 [jieba-wasm](https://github.com/fengkx/jieba-wasm) 相關檔案
- 結巴相關連結： [jieba](https://github.com/fxsjy/jieba), [jieba-rs](https://github.com/messense/jieba-rs)
