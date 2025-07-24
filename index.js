// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lizz AI Backend is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Chat endpoint - SECURE implementation with real OpenAI API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, mode } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Import OpenAI library only when needed
    const OpenAI = require('openai');
    
    // Initialize OpenAI with API key from environment variables
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY // Securely loaded from environment
    });
    
    let responseText = '';
    
    if (mode === 'websearch') {
      // For web search mode, we'll simulate search results
      // In a real implementation, you would call Google Search API here
      const searchResults = `[Web Search Mode] Results for "${message}":\n\n` +
        `🔍 Found 4 relevant results:\n` +
        `1. Official definition of ${message}\n` +
        `2. Practical applications of ${message}\n` +
        `3. Recent research on ${message}\n` +
        `4. Community discussions about ${message}\n\n`;
      
      // Get AI response based on search results
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are Lizz AI, a comprehensive artificial intelligence assistant. You have access to real-time web search results. Provide a concise, accurate response based on the search results."
          },
          {
            role: "user",
            content: `Based on these search results:\n${searchResults}\n\nAnswer the question: ${message}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });
      
      responseText = searchResults + completion.choices[0].message.content;
    } else if (mode === 'deepthink') {
      // Deep thinking mode - enhanced reasoning
      const completion = await openai.chat.completions.create({
        model: "gpt-4", // Using GPT-4 for deeper reasoning
        messages: [
          {
            role: "system",
            content: "You are Lizz AI in DeepThink mode. Provide a comprehensive, multi-perspective analysis of the query. Break down complex topics into understandable components and provide actionable insights."
          },
          {
            role: "user",
            content: `Provide a deep analysis of: ${message}`
          }
        ],
        temperature: 0.8,
        max_tokens: 1200
      });
      
      responseText = `[DeepThink Mode] Comprehensive Analysis:\n\n` + 
                     completion.choices[0].message.content;
    } else {
      // Normal mode
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are Lizz AI, a comprehensive artificial intelligence assistant. You have access to all human knowledge and can help with scientific research, education, creative projects, and more."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      responseText = completion.choices[0].message.content;
    }
    
    res.json({ response: responseText });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔑 OpenAI API configured: ${!!process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🔑 Google API configured: ${!!process.env.GOOGLE_API_KEY ? 'Yes' : 'No'}`);
});
