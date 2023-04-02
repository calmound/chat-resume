import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';
import { createParser } from 'eventsource-parser';
import { NextRequest, NextResponse } from 'next/server';
import { count } from 'console';

type Data = {
  name: string;
};

async function createStream(payload) {
  let apiKey = process.env.OPENAI_API_KEY;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${'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'}`,
      },
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        function onParse(event: any) {
          if (event.type === 'event') {
            const data = event.data;
            if (data === '[DONE]') {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta.content;
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        }

        const parser = createParser(onParse);
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });

    return stream;
  } catch (error) {
    console.log(error);
  }
}

export default async function handler(req: Request, res: NextResponse) {
  try {
    const { messages } = await req.json();

    const payload = {
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 1000,
      stream: true,
      n: 1,
    };
    const stream = await createStream(payload);
    return new Response(stream);
  } catch (error) {
    console.error(error);
  }
}

export const config = {
  runtime: 'edge',
};
