app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ reply: 'Invalid input' });
    }

    const requestBody = {
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `
You are OMKAR AI.

Personality rules:
- Be intelligent, concise, and slightly premium in tone
- Do not give long unnecessary explanations unless asked
- Focus on clarity and usefulness
- Act like a high-end AI assistant inside a luxury product
          `.trim()
        },
        {
          role: 'user',
          content: message.trim()
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    };

    const response = await axios.post(OPENROUTER_API_URL, requestBody, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'OMKAR AI'
      },
      timeout: 30000
    });

    const aiReply =
      response.data?.choices?.[0]?.message?.content?.trim();

    res.json({
      reply: aiReply || 'No response generated'
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      reply: 'OMKAR AI is currently unavailable. Try again later.'
    });
  }
});
