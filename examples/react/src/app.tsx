import { useState, type FormEvent } from "react";
import { useChatbot } from "./use-chat-bot";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const { query, ready } = useChatbot();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input) return;

    const response = await query(input);
    if (!response) return;
    const { bestMatch, candidates } = response;

    if (bestMatch)
      setMessages((prev) => [
        ...prev,
        `你: ${input}`,
        `Bot: ${bestMatch.content}`,
      ]);
    else if (candidates)
      setMessages((prev) => [
        ...prev,
        `Bot 建議問題: ${candidates.map((c) => c.text).join(" / ")}`,
      ]);
    setInput("");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>zhq 範例 Chatbot</h1>
        <p id="status">{ready ? "初始化完成" : "系統初始化中..."}</p>
        <div>
          <input value={input} onChange={(e) => setInput(e.target.value)} />
          <button>送出</button>
        </div>
      </form>

      <div id="hint">請輸入問題 (例如：如何、門市、會員、外送、訂位)</div>
      <div id="chat">
        {messages.map((message, i) => (
          <p key={i}>{message}</p>
        ))}
      </div>
    </>
  );
}
