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
  undoImage: () => void;
  redoImage: () => void;
  clearHistory: () => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: () => void;
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
    undoImage: () => {
      const state = get();
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        set({ historyIndex: newIndex });
        set({ imageUrl: state.history[newIndex] });
      }
    },
    isHistoryOpen: true,
    setIsHistoryOpen: () => {
      const state = get();

      if (state.imageUrl) {
        set({ isHistoryOpen: !state.isHistoryOpen });
      }
    },
    redoImage: () => {
      const state = get();
      if (
        state.historyIndex < state.history.length - 1 &&
        state.historyIndex >= 0
      ) {
        const newIndex = state.historyIndex + 1;
        set({ historyIndex: newIndex });
        set({ imageUrl: state.history[newIndex] });
      }
    },
    clearHistory: () => {
      const state = get();
      if (state.history.length > 0) {
        const currentImageUrl = state.history[state.historyIndex];
        set({ history: [currentImageUrl] });
        set({ historyIndex: 0 });
      }
    },
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
