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
      const response = await fetch('/api/editImage', {
        method: 'POST',
        body: JSON.stringify({ imageUrl, prompt }),
      });
      if (!response.ok) {
        throw new Error('Failed to send prompt to server');
      }
      const data = await response.json();
      console.log('Response from server:', data);
      //return data;
    },
  })),
);
