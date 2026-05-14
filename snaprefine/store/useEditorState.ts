import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type EditorState = {
  imageUrl: string | null;
  setImageUrl: (imageUrl: string) => void;
};

export const useEditorStore = create<EditorState>()(
  devtools((set) => ({
    imageUrl: null,
    setImageUrl: (imageUrl: string) => set({ imageUrl }),
  })),
);
