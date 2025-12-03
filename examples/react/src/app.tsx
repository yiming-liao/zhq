import { useState, type FormEvent } from "react";
import { useChatbot } from "./use-chat-bot";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([
    "請輸入問題 (例如：營業時間、門市、會員)",
  ]);

  const { ready, query } = useChatbot();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input || !ready) return;

    const { bestMatch, candidates } = query(input);
    if (bestMatch)
      setMessages((prev) => [
        ...prev,
        `你: ${input}`,
        `Bot: ${bestMatch.content}`,
      ]);
    else if (candidates)
      setMessages((prev) => [
        ...prev,
        `Bot 建議問題: ${candidates.map((c) => c.key).join(" / ")}`,
      ]);
    setInput("");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>zhq 範例 Chatbot</h1>

        <p>{ready ? "初始化完成" : "系統初始化中..."}</p>

        <div>
          <input value={input} onChange={(e) => setInput(e.target.value)} />
          <button>送出</button>
        </div>
      </form>

      <div id="messages">
        {messages.map((message, i) => (
          <p key={i}>{message}</p>
        ))}
      </div>
    </>
  );
}
