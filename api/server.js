import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 🔒 Rate limit (prevents API abuse)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per minute
  message: { reply: "Too many requests. Slow down." }
});

app.use("/chat", limiter);

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-4o-mini";

// 🧠 SYSTEM PROMPT (improved personality control)
const SYSTEM_PROMPT = `
You are OMKAR AI, a premium AI assistant.

Rules:
- Be intelligent, precise, and concise
- Avoid unnecessary long explanations
- Focus on clarity and usefulness
- Maintain a calm, confident, high-end assistant tone
- If user is unclear, ask short clarifying questions
`;

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // ✅ Input validation
    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Invalid input" });
    }

    const requestBody = {
      model: MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT.trim()
        },
        {
          role: "user",
          content: message.trim()
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    };

    const response = await axios.post(OPENROUTER_API_URL, requestBody, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "OMKAR AI"
      },
      timeout: 30000
    });

    // ✅ Safe response extraction
    const choice = response.data?.choices?.[0];

    if (!choice?.message?.content) {
      return res.json({
        reply: "No valid response from AI"
      });
    }

    const aiReply = choice.message.content.trim();

    return res.json({
      reply: aiReply
    });

  } catch (error) {
    // 🔥 Detailed logging for debugging
    console.error("OMKAR AI ERROR:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // ⚠️ Proper fallback responses
    if (error.response) {
      return res.status(error.response.status).json({
        reply: "AI service error. Please try again."
      });
    }

    return res.status(500).json({
      reply: "OMKAR AI is currently unavailable. Try again later."
    });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OMKAR AI running on http://localhost:${PORT}`);
});
