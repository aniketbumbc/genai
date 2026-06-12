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
  maskImageUrl: string | null;
  setMaskImageUrl: (maskImageUrl: string) => void;
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
      const maskImageUrl = get().maskImageUrl;
      set({ isLoading: true });

      set(() => ({
        history: [...get().history, imageUrl],
      }));

      const finalPrompt = `Task: Professional image editing / image generation / film role painting prompt.

Input Data:

* You have received a primary image and a corresponding mask image.
* The mask defines the precise editing region.
* White pixels in the mask indicate the area where you must apply the user instruction.
* Black pixels in the mask must remain exactly as they are in the original image.

USER GOAL: ${prompt}

Execution Guidelines (Critical):

1. Mask Compliance

   * Apply all modifications strictly inside the white mask area.
   * Do not alter, modify, or regenerate any black mask region.
   * Preserve all unmasked areas exactly as they appear in the original image.

2. Object Removal / Erasing

   * If the user requests to remove, erase, or delete an object, perform background reconstruction analysis.
   * Analyze the surrounding environment and background.
   * Seamlessly extend the surrounding background content over the masked area.
   * Completely hide all traces of the removed object.
   * Ensure the reconstructed area appears naturally present in the original scene.

3. Object Addition / Replacement / Modification

   * If the user requests to add, replace, or change something, generate the new content strictly within the white mask region.
   * Match the scene's perspective, scale, composition, and placement.
   * Ensure the generated content integrates naturally with the surrounding environment.

4. Seamless Integration

   * Match the surrounding lighting conditions exactly.
   * Match shadow direction, intensity, and softness.
   * Match color grading, exposure, contrast, and white balance.
   * Preserve scene consistency and realism.
   * Ensure the transition between edited and unedited regions is completely invisible.

5. Texture Matching

   * Replicate the exact texture characteristics of the original image.
   * Match film grain, digital noise, sharpness, detail level, and focus characteristics.
   * Prevent any pasted, artificial, or generated appearance.
   * Maintain visual consistency across the entire image.

6. Boundary Quality

   * The mask boundary must be undetectable.
   * Avoid visible seams, halos, artifacts, blending errors, or edge inconsistencies.
   * Produce a final result that appears as a single untouched photograph.

Final Requirement:

* All generated, modified, replaced, or reconstructed content must remain strictly confined to the white mask area while perfectly matching the original image's environment, lighting, perspective, texture, and overall visual quality.
`;

      const data = await editImage({
        imageUrl,
        prompt: finalPrompt,
        usersFiles,
        maskImageUrl,
      });
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
    maskImageUrl: null,
    setMaskImageUrl: (maskImageUrl: string) => set({ maskImageUrl }),
  })),
);
