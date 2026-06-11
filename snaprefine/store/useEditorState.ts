import { create } from 'zustand';
import { FileUIPart } from 'ai';
import { devtools } from 'zustand/middleware';
import { editImage } from '@/lib/editImage';
import { ToolType } from '@/lib/constants';

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
  applyExpansion: (aspectRatio: string) => void;
  applyRemoveBackground: () => void;
  selectedTool: ToolType;
  setSelectedTool: (selectedTool: ToolType) => void;
  brushSize: number;
  setBrushSize: (brushSize: number) => void;
};

function appendEditToHistory(
  currentHistory: string[],
  historyIndex: number,
  sourceImageUrl: string | null,
  resultImageUrl: string,
): { history: string[]; historyIndex: number } {
  const history =
    currentHistory.length === 0 && sourceImageUrl
      ? [sourceImageUrl, resultImageUrl]
      : [...currentHistory.slice(0, historyIndex + 1), resultImageUrl];

  return {
    history,
    historyIndex: history.length - 1,
  };
}

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

      const data = await editImage({ imageUrl, prompt, usersFiles });
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
      const finalPromt = `${filterPrompt} 
      Technical constraint: 
       1. Strictly preserve composition do not change the subject pose the camera angle or placement objects.
       2. Output Format: this is a style transfer keep underlying structure of the image identical to the original only changing the picture structure lightning and the colors to match the request style.
      `;
      const data = await editImage({ imageUrl, prompt: finalPromt });
      const { history: newHistory, historyIndex: newIndex } =
        appendEditToHistory(
          get().history,
          get().historyIndex,
          imageUrl,
          data.imageUrl,
        );
      set({
        history: newHistory,
        imageUrl: data.imageUrl,
        historyIndex: newIndex,
        isLoading: false,
      });
    },
    applyExpansion: async (aspectRatio: string) => {
      set({ isLoading: true });
      const imageUrl = get().imageUrl;
      const prompt = get().prompt;
      if (!imageUrl) {
        return;
      }
      const baseInstruction = `high fidelity outpainting. analyze the visual context of the original image and seamlessly extend the scenery into empty areas.
     Ensure the person's face and feature remain completely unchanged.`;

      const technicalConstraint = `
     Technical constraint:
     1. Strictly preserve composition do not change the subject pose the camera angle or placement objects.
     2. Output Format: this is a style transfer keep underlying structure of the image identical to the original only changing the picture structure lightning and the colors to match the request style.
     `;

      const userContext = prompt
        ? `Additional context/subject for extension is: ${prompt}`
        : '';

      const finalPrompt = `${baseInstruction}
      ${technicalConstraint}
      ${userContext}
      `;
      const data = await editImage({
        imageUrl,
        prompt: finalPrompt,
        aspectRatio: aspectRatio,
      });
      const { history: newHistory, historyIndex: newIndex } =
        appendEditToHistory(
          get().history,
          get().historyIndex,
          imageUrl,
          data.imageUrl,
        );
      set({
        history: newHistory,
        imageUrl: data.imageUrl,
        historyIndex: newIndex,
        isLoading: false,
      });
    },

    applyRemoveBackground: async () => {
      const imageUrl = get().imageUrl;
      if (!imageUrl) {
        return;
      }
      set({ isLoading: true });
      const data = await editImage({ imageUrl, prompt: 'remove background' });
      const { history: newHistory, historyIndex: newIndex } =
        appendEditToHistory(
          get().history,
          get().historyIndex,
          imageUrl,
          data.imageUrl,
        );
      set({
        history: newHistory,
        imageUrl: data.imageUrl,
        historyIndex: newIndex,
        isLoading: false,
      });
    },
    selectedTool: ToolType.PAN,
    setSelectedTool: (selectedTool: ToolType) => set({ selectedTool }),
    brushSize: 50,
    setBrushSize: (brushSize: number) => set({ brushSize }),
  })),
);
