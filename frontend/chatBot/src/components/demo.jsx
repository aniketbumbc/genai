import { useState } from 'react';
// import './demo-style.css'

function DemoApp() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Bot', text: 'Hello! How can I assist you today?' },
    { id: 2, sender: 'User', text: 'Just testing this chat UI!' },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedTool, setSelectedTool] = useState('Fun Fact');

  const handleSendMessage = () => {
    if (inputText.trim()) {
      setMessages([...messages, { id: messages.length + 1, sender: 'User', text: inputText }]);
      setInputText('');
      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, sender: 'Bot', text: 'Got your message! Anything else?' },
        ]);
      }, 500);
    }
  };

  const handleCallTool = () => {
    const toolMessages = {
      'Fun Fact': 'Did you know the shortest war in history lasted 38 minutes?',
      'Tell a Joke': 'Why did the scarecrow become a motivational speaker? Because he was outstanding in his field!',
    };
    setMessages([
      ...messages,
      { id: messages.length + 1, sender: 'Bot', text: toolMessages[selectedTool] },
    ]);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Chat Interface</h1>
      </div>
      <div className="chat-area">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'User' ? 'sent' : 'received'}`}
          >
            <span className="sender">{message.sender}</span>
            <span className="message-text">{message.text}</span>
          </div>
        ))}
      </div>
      <div className="input-container">
        <div className="tool-options">
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className="tool-dropdown"
          >
            <option value="Fun Fact">Fun Fact</option>
            <option value="Tell a Joke">Tell a Joke</option>
          </select>
          <button className="tool-button" onClick={handleCallTool}>
            Call Tool
          </button>
        </div>
        <div className="input-row">
          <input
            type="text"
            className="message-input"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="send-button" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default DemoApp;