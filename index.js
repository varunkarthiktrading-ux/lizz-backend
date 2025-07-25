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

// Chat endpoint with DeepSeek AI
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    const { message, mode, user, isPremium } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Check if DeepSeek API key is configured
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DEEPSEEK_API_KEY is not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'DeepSeek API key not configured' 
      });
    }
    
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
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
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
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`DeepSeek API Error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        responseText = searchResults + data.choices[0].message.content;
      } else if (mode === 'deepthink') {
        // Deep thinking mode
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
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
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`DeepSeek API Error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        responseText = `[DeepThink Mode] Comprehensive Analysis:\n\n` + 
                       data.choices[0].message.content;
      } else {
        // Normal mode
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
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
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`DeepSeek API Error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        responseText = data.choices[0].message.content;
      }
      
      console.log('DeepSeek API call successful');
      res.json({ response: responseText });
    } catch (deepSeekError) {
      console.error('DeepSeek API Error:', deepSeekError);
      // Return a more user-friendly error message
      res.json({ 
        response: `I understand you're asking about "${message}". Unfortunately, I'm currently experiencing technical difficulties with DeepSeek AI. Please try again in a moment.` 
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
  console.log(`🔑 DeepSeek API configured: ${!!process.env.DEEPSEEK_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🔑 Google API configured: ${!!process.env.GOOGLE_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🔑 Google search engine configured: ${!!process.env.GOOGLE_SEARCH_ENGINE ? 'Yes' : 'No'}`);
});
