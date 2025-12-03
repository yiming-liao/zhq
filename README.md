<h1 align="center">ZHQ</h1>

<div align="center">

基於 **TF-IDF** 與 **Jieba 斷詞** 的中文檢索引擎，  
完全運行於客戶端，適用於 問答、搜尋、推薦、文本比對。

</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/zhq?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/zhq)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/zhq?style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/package/zhq)
[![TypeScript](https://img.shields.io/badge/TypeScript-%E2%9C%94-blue?style=flat&colorA=000000&colorB=000000)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/zhq?style=flat&colorA=000000&colorB=000000)](LICENSE)

</div>

> 瀏覽器搞定一切，放過你的伺服器。

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

安裝完成後，需要先在 `node_modules/zhq` 中找到 **Jieba WASM** 檔案：

```
node_modules/zhq/jieba_rs_wasm_bg.wasm
```

並將其放到可由瀏覽器存取的公開資料夾，例如：

- Vite 的 public 資料夾
- Next.js 的 public 資料夾

```
放置路徑範例：
public/jieba_rs_wasm_bg.wasm
```

## 使用方式

#### 1. 準備文檔 DocItem[]

```ts
// 以 FAQ 問答形式為例：
const docItems: DocItem[] = [
  {
    key: "ZHQ是什麼？",
    content: "ZHQ是一款基於TF-IDF與Jieba斷詞的中文檢索引擎",
  },
  {
    key: "ZHQ的功能？",
    content: "ZHQ適用於 問答、搜尋、推薦、文本比對。",
  },
];
```

#### 2. 初始化 ZHQ

使用 `createZhq()` 來建立一個 ZHQ 實例

- 如果在此函數傳入 `docItems` ，ZHQ 會自動載入 **WASM** 以及建立 **TF-IDF 索引**。
- 反之，則需要後續手動呼叫 `initJieba()` 和 `buildIndex()`，適合延遲載入的場景。

```ts
// 基本使用
const zhq = await createZhq(docItems);

// 自訂選項
const zhq = await createZhq(docItems, {
  wasmPath: "/path/to/jieba_rs_wasm_bg.wasm", // 預設為 "/jieba_rs_wasm_bg.wasm"
  precomputeVectors: true, // 預設為 false
});

// 延遲載入 (Lazy loading)
const zhq = await createZhq();
```

#### 3. 使用 ZHQ 的 Methods

呼叫 `zhq.query()`，將 `input` 與文檔索引比對，找出最相似的文檔。

```ts
// 基本使用
const { bestMatch, candidates } = zhq.query(input);

// 自訂選項
const { bestMatch, candidates } = zhq.query(input, {
  topKCandidates: 2, // 指定回傳最接近的 candidates 數量，預設為 3
  threshold: 0.6, // 相似度閾值 (0~1)，預設為 0.3
});
```

---

## 第三方引用

- 本專案中直接引用了 [jieba-wasm](https://github.com/fengkx/jieba-wasm) 相關檔案
- 結巴相關連結： [jieba](https://github.com/fxsjy/jieba), [jieba-rs](https://github.com/messense/jieba-rs)
