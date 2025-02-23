import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();

    if (!messages) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content
    });
    
  } catch (error: unknown) {
    console.error('[CHAT ERROR]', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'An error occurred' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
