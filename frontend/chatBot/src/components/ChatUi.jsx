import React, { useState,useRef,useEffect } from 'react';
import './Chat-Style.css'

const TOOL_OPTIONS = [
  { id: "funFact", label: "Fun Fact" },
  { id: "joke", label: "Tell a Joke" },
];

const ChatUi = () => {
    const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const [selectedTool, setSelectedTool] = useState(TOOL_OPTIONS[0].id);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const postMessageToLlm = async(message) => {
    const url = 'http://localhost:3001/chat'

    const response = await fetch(url,{
      method:"POST",
      headers:{
        'content-type':'application/json'
      },
      body: JSON.stringify({message:message})
    })

    if(!response.ok){
      throw new Error("Error generating the response")
    }

    const result = await response.json()
    return result.message
  }



  const sendMessage = async() => {
    setIsThinking(true)
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    
      const botMessage = await postMessageToLlm(input.trim())
        const botReply = {
        id: Date.now() + 1,
        sender: "bot",
        text: botMessage,
      };
      setIsThinking(false)
      setMessages((prev) => [...prev, botReply]);

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
            <div className="bubble">{text}</div>
          </div>
        ))}
           {isThinking && (
          <div className="label thinking">Thinking...</div>
        )}
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



