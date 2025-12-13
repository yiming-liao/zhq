import type { ZHQ } from "zhq";
import type { Document, QueryResult } from "zhq";
import { useEffect, useRef, useState } from "react";
import { createZhq } from "zhq";

// --- 自訂文檔
const DOCUMENTS: Document[] = [
  {
    text: "便利商店營業時間？",
    content: "大多數便利商店每日 07:00 - 23:00 營業，部分門市可能略有差異。",
  },
  {
    text: "如何加入便利商店會員？",
    content: "您可以下載便利商店官方 App，註冊會員並綁定會員卡即可成為會員。",
  },
  {
    text: "便利商店提供外送服務嗎？",
    content: "部分門市提供外送服務，請以 App 查詢附近門市為準。",
  },
  {
    text: "便利商店可以訂位嗎？",
    content: "便利商店門市一般不提供訂位服務，部分特殊門市或活動例外。",
  },
  {
    text: "如何查詢便利商店門市地址？",
    content:
      "您可以在便利商店官方網站或 App 的『門市查詢』功能查詢附近門市地址與營業資訊。",
  },
];

export function useChatbot(documents = DOCUMENTS) {
  const zhqRef = useRef<ZHQ>(null);
  const [progress, setProgress] = useState(0);

  // --- 初始化 ZHQ（Lazy Load）
  useEffect(() => {
    (async () => {
      const zhq = await createZhq();
      zhqRef.current = zhq; // 儲存到 ref
      zhq.onProgress = (p) => setProgress(p); // 使用內建的 callback 來更新狀態
      await zhq.initJieba(); // 初始化 Jieba
      zhq.buildIndexAsync(documents as Document[]); // 使用 buildIndexAsync，且不 Await，讓他背景執行
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

  return { query, progress };
}
