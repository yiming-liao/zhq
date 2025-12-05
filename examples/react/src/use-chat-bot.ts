import type { ZHQ } from "zhq";
import { useEffect, useRef } from "react";
import { createZhq } from "zhq";
import { type DocItem, type QueryResult } from "zhq";

// --- 自訂文檔
const DOC_ITEMS: DocItem[] = [
  {
    key: "便利商店營業時間？",
    content: "大多數便利商店每日 07:00 - 23:00 營業，部分門市可能略有差異。",
  },
  {
    key: "如何加入便利商店會員？",
    content: "您可以下載便利商店官方 App，註冊會員並綁定會員卡即可成為會員。",
  },
  {
    key: "便利商店提供外送服務嗎？",
    content: "部分門市提供外送服務，請以 App 查詢附近門市為準。",
  },
  {
    key: "便利商店可以訂位嗎？",
    content: "便利商店門市一般不提供訂位服務，部分特殊門市或活動例外。",
  },
  {
    key: "如何查詢便利商店門市地址？",
    content:
      "您可以在便利商店官方網站或 App 的『門市查詢』功能查詢附近門市地址與營業資訊。",
  },
];

export function useChatbot(docItems = DOC_ITEMS) {
  const zhqRef = useRef<ZHQ>(null);

  // --- 初始化 ZHQ（Lazy Load）
  useEffect(() => {
    (async () => {
      zhqRef.current = await createZhq();
      await zhqRef.current.initJieba(); // 初始化 Jieba
      zhqRef.current.buildIndexAsync(docItems as DocItem[]); // 使用 buildIndexAsync，且不 Await，讓他背景執行
    })();
  }, []);

  // --- 查詢（使用 queryAsync，自動等待索引完成）
  function query(input: string): Promise<QueryResult> | undefined {
    if (!zhqRef.current) return;
    return zhqRef.current.queryAsync(input, {
      topKCandidates: 2, // 顯示幾個建議問題
      threshold: 0.5, // 觸發 bestMatch 的相似程度 (0~1)
    });
  }

  return { query };
}
