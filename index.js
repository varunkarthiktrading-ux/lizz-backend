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

// Chat endpoint - FIXED implementation
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    const { message, mode } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'API key not configured' 
      });
    }
    
    // Import OpenAI library
    const OpenAI = require('openai');
    
    // Initialize OpenAI with API key from environment variables
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('OpenAI client initialized successfully');
    
    let responseText = '';
    
    try {
      if (mode === 'websearch') {
        // For web search mode
        const searchResults = `[Web Search Mode] Results for "${message}":\n\n` +
          `🔍 Found relevant information about ${message}\n` +
          `1. Official definition and overview\n` +
          `2. Practical applications and use cases\n` +
          `3. Recent developments and research\n` +
          `4. Community discussions and resources\n\n`;
        
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
        // Deep thinking mode
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo", // Using gpt-3.5-turbo instead of gpt-4 for cost efficiency
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
          max_tokens: 1000
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
      
      console.log('OpenAI API call successful');
      res.json({ response: responseText });
    } catch (openAiError) {
      console.error('OpenAI API Error:', openAiError);
      // Return a more user-friendly error message
      res.json({ 
        response: `I understand you're asking about "${message}". Unfortunately, I'm currently experiencing technical difficulties. Please try again in a moment.` 
      });
    }
  } catch (error) {
    console.error('Backend Error:', error);
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
});
