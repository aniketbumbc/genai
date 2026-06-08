import { FileUIPart } from 'ai';

type EditImageParams = {
  imageUrl: string | null;
  prompt: string;
  usersFiles?: FileUIPart[];
  aspectRatio?: string;
};

type EditImageResponse = {
  imageUrl: string;
};

export async function editImage(
  params: EditImageParams,
): Promise<EditImageResponse> {
  const response = await fetch('/api/editImage', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error('Failed to edit image');
  }
  return response.json();
}
