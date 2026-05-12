import { User, Wrench } from 'lucide-react';
import type { StreamMessage } from '../type.ts';
import { ExpenseChart } from './ExpenseChart.tsx';

type Props = {
  message: StreamMessage;
};
export function ChatMessage({ message }: Props) {
  console.log(message);
  if (message.type === 'user') {
    return (
      <div className="flex gap-4 py-6 px-6 transition-colors">
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-white-500 via-white-500 to-gray-500 flex items-center justify-center shadow-lg">
            <User color="white" />
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="text-sm font-medium text-zinc-300">
            User
          </div>
          <div className="text-zinc-100 whitespace-pre-wrap wrap-break-word leading-7">
            {message.payload.text}
          </div>
        </div>
      </div>
    );
  } else if (message.type === 'ai') {
    return (
      <div className="flex gap-4 py-6 px-6 transition-colors">
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
            <svg
              className="w-5 h-5 text-white"
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
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="text-sm font-medium text-zinc-300">
            AI Assistant
          </div>
          <div className="text-zinc-100 whitespace-pre-wrap wrap-break-word leading-7">
            {message.payload.text}
          </div>
        </div>
      </div>
    );
  } else if (message.type === 'toolCall:start') {
    return (
      <div className="flex gap-4 py-4 px-6">
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
            <Wrench color="gray" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-sm text-zinc-400 italic">
            Using tool:{' '}
            <span className="text-purple-400 font-medium">
              {message.payload.name}
            </span>
          </div>
          <div className="text-xs text-zinc-300 bg-purple-900/15 rounded-lg p-3 font-mono whitespace-pre-wrap">
            {JSON.stringify(message.payload.args, null, 2)}
          </div>
        </div>
      </div>
    );
  } else if (message.type === 'tool') {
    return (
      <div className="flex gap-4 py-4 px-6">
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-lg bg-green-900/15 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-sm text-zinc-400">
            Tool result:{' '}
            <span className="text-green-400 font-medium">
              {message.payload.name}
            </span>
          </div>
          <div className="text-xs text-zinc-300 bg-green-900/20 rounded-lg p-3 font-mono whitespace-pre-wrap">
            {JSON.stringify(
              message.payload.result,
              null,
              2
            )}
          </div>
          {message.payload.name ===
            'generate_expense_chart' && (
            <ExpenseChart
              chartData={message.payload.result.data}
              labelKey={message.payload.result.labelKey}
            />
          )}
          <h1 className="text-zinc-100 text-2xl font-bold">Chart data by {message.payload.result.labelKey}</h1>
        </div>
      </div>
    );
  }
}