const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Initialize dotenv at the top
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Health check route to verify server status
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

/**
 * AI Chat Route
 * This is where the magic happens.
 */
app.all('/chat', (req, res, next) => {
  if (req.method === 'POST') {
    return next();
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  res.set('Allow', 'POST,OPTIONS');
  return res.status(405).json({
    error: 'Method Not Implemented',
    message: 'Use POST /chat for conversation requests'
  });
});

app.post('/chat', async (req, res) => {
  // TODO: Implement the AI chat route
  // 1. Extract `messages` from req.body
  // 2. Read API key from process.env.OPENROUTER_API_KEY
  // 3. POST to https://openrouter.ai/api/v1/chat/completions
  //    with Authorization: Bearer <key> and the messages array
  // 4. Return the AI reply as { reply: "..." }
  try {
    const { messages } = req.body;
    const API_KEY = process.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        reply: null,
        message: 'OPENROUTER_API_KEY is missing in environment variables'
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: messages
      })
    });

    const data = await response.json();
    console.log('FULL API RESPONSE:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(response.status).json({
        reply: null,
        message: data.error?.message || data.error || 'OpenRouter API request failed'
      });
    }

    const reply = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.choices?.[0]?.delta?.content || null;

    if (!reply) {
      return res.status(500).json({
        reply: null,
        message: 'No response from AI (empty choices or unexpected response format)'
      });
    }

    res.status(200).json({ reply });
}catch(error){
  console.error(error);
  res.status(500).json({
    error: true,
    message: 'Something went wrong'
  });
}
});

// console.log("API KEY:", process.env.OPENROUTER_API_KEY);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
