import { NextResponse } from 'next/server';
import fs from 'fs';
import OpenAI from 'openai';
/**
 *
 * @param request  Api call to llm with data
 * @returns
 */
export async function POST(request: Request) {
  const { imageUrl, prompt } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not set' });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // const imagePath = "path/to/cat_image.png";
  // const imageData = fs.readFileSync(imagePath);
  // const base64Image = imageData.toString("base64");

  // const parts = [
  //   {
  //     text: prompt,
  //   },
  //   {
  //     inlineData: {
  //       mimeType: getImageMimeType(imageUrl), // TODO: get the mime type from the image url
  //       data: cleanImageUrl(imageUrl),
  //     },
  //   },
  // ];

  // const response = await ai.models.generateContent({
  //   model: 'gemini-3.1-flash-image-preview',
  //   contents: parts,
  // });

  const response = await openai.responses.create({
    model: 'gpt-5.5',
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: prompt },
          {
            type: 'input_image',
            image_url: imageUrl,
          },
        ],
      },
    ],
    tools: [{ type: 'image_generation' }],
  });

  // for (const part of response.candidates[0].content.parts) {
  //   if (part.text) {
  //     console.log(part.text);
  //   } else if (part.inlineData) {
  //     const imageData = part.inlineData.data;
  //     const buffer = Buffer.from(imageData, 'base64');
  //     fs.writeFileSync(`gemini-native-image-${Date.now()}.png`, buffer);
  //     return NextResponse.json({
  //       imageUrl: `gemini-native-image-${Date.now()}.png`,
  //     });
  //   }
  // }
  const imageData = response.output
    .filter((output: any) => output.type === 'image_generation_call')
    .map((output: any) => output.result);

  if (imageData.length > 0) {
    const imageBase64 = imageData[0];
    const fs = await import('fs');
    fs.writeFileSync(
      `edit-images/image-${Date.now()}.png`,
      Buffer.from(imageBase64, 'base64'),
    );
    return NextResponse.json({
      imageUrl: `${imageBase64}`,
    });
  } else {
    console.log(response.output.content);
    return NextResponse.json({ error: 'No image data found' });
  }
}

// const cleanImageUrl = (imageUrl: string) => {
//   return imageUrl.replace(/^data:(.*);base64,/, '');
// };

// const getImageMimeType = (imageUrl: string) => {
//   return imageUrl.match(/^data:(.*);base64,/)?.[1];
// };
