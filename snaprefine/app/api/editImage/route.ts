import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
/**
 *
 * @param request  Api call to llm with data
 * @returns
 */
export async function POST(request: Request) {
  const { imageUrl, prompt } = await request.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' });
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  // const imagePath = "path/to/cat_image.png";
  // const imageData = fs.readFileSync(imagePath);
  // const base64Image = imageData.toString("base64");

  const parts = [
    {
      text: prompt,
    },
    {
      inlineData: {
        mimeType: getImageMimeType(imageUrl), // TODO: get the mime type from the image url
        data: cleanImageUrl(imageUrl),
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: parts,
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, 'base64');
      fs.writeFileSync(`gemini-native-image-${Date.now()}.png`, buffer);
      return NextResponse.json({
        imageUrl: `gemini-native-image-${Date.now()}.png`,
      });
    }
  }

  return NextResponse.json({ error: 'No image data found' });
}

//AIzaSyCTPEj98JgAndjdK0GPELFXlTWtRFZW25U

const cleanImageUrl = (imageUrl: string) => {
  return imageUrl.replace(/^data:(.*);base64,/, '');
};

const getImageMimeType = (imageUrl: string) => {
  return imageUrl.match(/^data:(.*);base64,/)?.[1];
};
