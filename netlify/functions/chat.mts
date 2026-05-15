import type { Context } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `You are EcoVitals AI, a friendly and knowledgeable health assistant for the EcoVitals Hub platform. You help users with:
- BMI calculations and healthy weight guidance
- Health tracking insights (heart rate, steps, water intake)
- Emergency health information and first aid tips
- General wellness, nutrition, and fitness advice

Keep responses concise, clear, and supportive. Always recommend consulting a healthcare professional for medical decisions.`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Invalid request body' }, { status: 400, headers: CORS_HEADERS })
    }

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return Response.json({ reply }, { headers: CORS_HEADERS })
  } catch (err) {
    console.error('Chat function error:', err)
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}

export const config = {
  path: '/api/chat',
}
