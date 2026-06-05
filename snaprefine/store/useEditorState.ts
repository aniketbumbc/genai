import { create } from 'zustand';
import { FileUIPart } from 'ai';
import { devtools } from 'zustand/middleware';

type EditorState = {
  imageUrl: string | null;
  setImageUrl: (imageUrl: string) => void;
  prompt: string;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
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
  usersFiles: FileUIPart[];
  setUsersFiles: (usersFiles: FileUIPart[]) => void;
  applyFilter: (filterPrompt: string) => void;
};

export const useEditorStore = create<EditorState>()(
  devtools((set: any, get: any) => ({
    imageUrl: null,
    history: [] as string[],
    historyIndex: 0,
    isLoading: false,
    usersFiles: [],
    setUsersFiles: (usersFiles: FileUIPart[]) => set({ usersFiles }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
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
      const usersFiles = get().usersFiles;
      set({ isLoading: true });

      set(() => ({
        history: [...get().history, imageUrl],
      }));

      const response = await fetch('/api/editImage', {
        method: 'POST',
        body: JSON.stringify({ imageUrl, prompt, usersFiles }),
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
      set({ isLoading: false });
      return data;
    },

    applyFilter: async (filterPrompt: string) => {
      set({ isLoading: true });
      const imageUrl = get().imageUrl;
      const history = get().history;
      const finalPromt = `${filterPrompt} 
      Technical constraint: 
       1. Strictly preserve composition do not change the subject pose the camera angle or placement objects.
       2. Output Format: this is a style transfer keep underlying structure of the image identical to the original only changing the picture structure lightning and the colors to match the request style.
      `;
      const response = await fetch('/api/editImage', {
        method: 'POST',
        body: JSON.stringify({ imageUrl, prompt: finalPromt }),
      });
      if (!response.ok) {
        throw new Error('Failed to apply filter');
      }
      const data = await response.json();
      const clonedHistory = [...get().history];
      clonedHistory.push(data.imageUrl);
      set({ history: clonedHistory });
      set({ imageUrl: data.imageUrl });
      set({ historyIndex: history.length });
      set({ isLoading: false });
    },
  })),
);
