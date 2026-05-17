import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type EditorState = {
  imageUrl: string | null;
  setImageUrl: (imageUrl: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  sendPromptToServer: () => Promise<void>;
};

export const useEditorStore = create<EditorState>()(
  devtools((set, get) => ({
    imageUrl: null,
    setImageUrl: (imageUrl: string) => set({ imageUrl }),
    setPrompt: (prompt: string) => set({ prompt }),
    prompt: '',
    sendPromptToServer: async () => {
      const prompt = get().prompt;
      const imageUrl = get().imageUrl;
      //setPrompt: (prompt: string) => set({ prompt });
      console.log('Sending prompt to server:', prompt);
      console.log('Image URL:', imageUrl);
    },
  })),
);
