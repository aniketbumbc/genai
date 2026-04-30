import { useEffect, useRef, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import type { StreamMessage } from '../type.ts';
import React from 'react';

export function ChatContainer() {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState<string>('');

  const [messages, setMessages] = useState<StreamMessage[]>(
    []
  );

  // useEffect(() => {
  //   messageEndRef.current?.scrollIntoView({
  //     behavior: 'smooth',
  //   });
  // }, [messages]);

  async function submitQuery(query: string){
    console.log("submitQuery", query);
    await fetchEventSource('http://localhost:4100/chat', {
      onmessage(ev) {
          console.log(ev.data);
      },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
  });
  }

  // useEffect(() => {
  //   console.log("useEffect"query);
  //   submitQuery(query);
  // },[])


  

  const onSubmit = (userInput: string) => {
    console.log('user input', userInput);
    setQuery(userInput);
    submitQuery(userInput);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950">
      {/* Header */}
      <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl w-full">
        <div className="w-full max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-100">
                AI Expense Tracker
              </h1>
              <p className="text-xs text-zinc-500">
                Powered by advanced AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="w-full max-w-5xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-6 py-8">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-2xl mb-6 animate-pulse">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-zinc-100 mb-3">
                How can I help you today?
              </h2>
              <p className="text-zinc-500 text-center max-w-md mb-8">
                Ask me anything, and I'll do my best to
                assist you with information, analysis, and
                creative solutions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                {[
                  {
                    icon: '💡',
                    title: 'Get ideas',
                    desc: 'Brainstorm creative solutions',
                  },
                  {
                    icon: '📊',
                    title: 'Analyze data',
                    desc: 'Extract insights from information',
                  },
                  {
                    icon: '✍️',
                    title: 'Write content',
                    desc: 'Create engaging text and copy',
                  },
                  {
                    icon: '🔧',
                    title: 'Solve problems',
                    desc: 'Find answers to your questions',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:border-purple-500/50 transition-all cursor-pointer group">
                    <div className="text-2xl mb-2">
                      {item.icon}
                    </div>
                    <div className="text-sm font-medium text-zinc-200 group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {/* Messages will be displayed here... */}
              {messages.map((message) => {
                return (
                  <div key={message.id}>
                    <ChatMessage message={message} />
                  </div>
                );
              })}

              <div ref={messageEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 w-full">
        <ChatInput onSubmit={onSubmit} />
      </div>
    </div>
  );
}