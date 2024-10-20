import { Configuration, OpenAIApi } from 'openai-edge'
import { createParser } from 'eventsource-parser'
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const runtime = 'edge'

export async function POST(req: Request) {
  const { prompt, model } = await req.json()

  if (model === 'openai') {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that analyzes survey results and provides insights.'
        },
        {
          role: 'user',
          content: `Analyze the following survey results and provide insights: ${prompt}`
        }
      ]
    })

    if (!response) {
      return new Response(JSON.stringify({ error: 'No response body received.' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const stream = new ReadableStream({
      async start(controller) {
        function onParse(event: any) {
          if (event.type === 'event') {
            const data = event.data
            if (data === '[DONE]') {
              controller.close()
              return
            }
            const queue = encoder.encode(data)
            controller.enqueue(queue)
          }
        }

        const parser = createParser(onParse)
        if (response !== null) {
          for await (const chunk of response) {
            parser.feed(decoder.decode(chunk))
          }
        }
      }
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' }
    })
  } else if (model === 'huggingface') {
    // Add logic to handle Hugging Face API or local model processing

    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt })
    });
    const result = await response.json();
    return new Response(JSON.stringify({ result: result[0]?.generated_text || 'No response received.' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } else {
    return new Response(JSON.stringify({ error: 'Invalid model specified.' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
