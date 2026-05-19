export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: 'You are EcoVitals AI, a friendly and knowledgeable health assistant. You help users with questions about BMI, fitness, nutrition, heart rate, hydration, sleep, and general wellness. Keep responses concise, warm, and easy to understand. Use emojis occasionally to make responses friendly.'
          },
          ...messages
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
