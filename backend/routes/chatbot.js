const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getGeminiResponse(question) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are an e-waste management expert.
Answer the following question in **clear, well-formatted** Markdown:
- Use short paragraphs
- Use bullet points for lists
- Highlight important terms in bold
Question: ${question}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return { answer: text, source: 'gemini', confidence: 0.95 };
  } catch (error) {
    console.error('Gemini API error:', error);
    return { answer: "Sorry, I'm having trouble connecting to Gemini AI right now.", source: 'error', confidence: 0 };
  }
}

router.post('/query', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  const geminiResponse = await getGeminiResponse(question);
  res.json(geminiResponse);
});

module.exports = router;
