import { createParser } from 'eventsource-parser';
import { NextResponse } from 'next/server';

type Data = {
  name: string;
};

async function createStream(payload: any) {
  let apiKey = payload.apiKey || process.env.OPENAI_API_KEY;
  console.log(
    '%c [ apiKey ]-13',
    'font-size:13px; background:pink; color:#bf2c9f;',
    apiKey
  );
  delete payload.apiKey;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
    const { messages, apiKey } = await req.json();

    const payload = {
      model: 'gpt-3.5-turbo',
      messages,
      apiKey,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 3000,
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
