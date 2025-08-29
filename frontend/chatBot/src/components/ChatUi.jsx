import React, { useState,useRef,useEffect } from 'react';
import './Chat-Style.css'

const TOOL_OPTIONS = [
  { id: "funFact", label: "Fun Fact" },
  { id: "joke", label: "Tell a Joke" },
];

const ChatUi = () => {
    const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! How can I assist you today?" },
     { id: 2, sender: "user", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [selectedTool, setSelectedTool] = useState(TOOL_OPTIONS[0].id);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        sender: "bot",
        text: `You said: "${userMsg.text}"`,
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
  };

  const callTool = () => {
    const toolText = selectedTool === "funFact"
      ? "Fun Fact: Honey never spoils."
      : "Joke: Why don’t skeletons fight? They don’t have the guts.";
    setMessages((prev) => [...prev, { id: Date.now(), sender: "bot", text: toolText }]);
  };

  return (
    <div className="chat-page">
      <div className="chat-window">
        {messages.map(({ id, sender, text }) => (
          <div key={id} className={`msg ${sender}`}>
            <div className="label">{sender === "user" ? "User" : "Bot"}</div>
            <div className="bubble">{text}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="input-bar">
        <input
          type="text"
          placeholder="Send a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="btn send">Ask</button>
        <select
          value={selectedTool}
          onChange={(e) => setSelectedTool(e.target.value)}
          className="tool-select"
        >
          {TOOL_OPTIONS.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <button onClick={callTool} className="btn tool">Call Tool</button>
      </div>
    </div>
  );
   
}

export default ChatUi



