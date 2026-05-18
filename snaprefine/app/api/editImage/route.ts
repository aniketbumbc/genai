import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { imageUrl, prompt } = await request.json();
  return NextResponse.json({ imageUrl, prompt });
}
