import { NextResponse } from 'next/server';
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

  const imageData = response.output
    .filter((output: any) => output.type === 'image_generation_call')
    .map((output: any) => output.result);

  if (imageData.length > 0) {
    const imageBase64 = imageData[0];
    return NextResponse.json({
      imageUrl: `data:image/png;base64,${imageBase64}`,
    });
  } else {
    console.log(response.output.content);
    return NextResponse.json({ error: 'No image data found' });
  }
}
