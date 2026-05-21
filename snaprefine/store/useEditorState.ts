import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type EditorState = {
  imageUrl: string | null;
  setImageUrl: (imageUrl: string) => void;
  prompt: string;
  historyIndex: number;
  setPrompt: (prompt: string) => void;
  sendPromptToServer: () => Promise<void>;
  history: string[];
  setHistory: (history: string[]) => void;
  setHistoryIndex: (historyIndex: number) => void;
};

export const useEditorStore = create<EditorState>()(
  devtools((set: any, get: any) => ({
    imageUrl: null,
    history: [] as string[],
    historyIndex: 0,
    setImageUrl: (imageUrl: string) => set({ imageUrl }),
    setHistory: (history: string[]) => set({ history }),
    setPrompt: (prompt: string) => set({ prompt }),
    setHistoryIndex: (historyIndex: number) => {
      const state = get();
      return set({
        historyIndex: historyIndex,
        imageUrl: state.history[historyIndex],
      });
    },
    prompt: '',
    sendPromptToServer: async () => {
      const prompt = get().prompt;
      const imageUrl = get().imageUrl;

      set(() => ({
        history: [...get().history, imageUrl],
      }));

      const response = await fetch('/api/editImage', {
        method: 'POST',
        body: JSON.stringify({ imageUrl, prompt }),
      });
      if (!response.ok) {
        throw new Error('Failed to send prompt to server');
      }
      const data = await response.json();
      set({ imageUrl: data.imageUrl });
      const clonedHistory = [...get().history];
      clonedHistory.push(data.imageUrl);
      set({ historyIndex: clonedHistory.length - 1 });
      set({ history: clonedHistory });
      return data;
    },
  })),
);
