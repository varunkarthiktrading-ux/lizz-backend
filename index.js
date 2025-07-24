// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Premium user list
const premiumUsers = [
  "haivarunkarthik@gmail.com",
  "varunkarthiktrading@gmail.com",
  "aiwinsvarun@gmail.com"
];

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lizz AI Backend is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, mode, user, isPremium } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Verify premium access
    const userIsActuallyPremium = premiumUsers.includes(user);
    
    // Restrict premium modes to premium users
    if ((mode === 'deepthink' || mode === 'websearch') && !userIsActuallyPremium) {
      return res.status(403).json({ 
        error: 'Premium feature access denied. Upgrade to premium for advanced features.' 
      });
    }
    
    // Initialize OpenAI client
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    let responseText = '';
    
    if (mode === 'websearch' && userIsActuallyPremium) {
      // Web search mode (premium only)
      try {
        // Using Google Custom Search API
        const searchQuery = encodeURIComponent(message);
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${searchQuery}&num=5`;
        
        const searchResponse = await fetch(searchUrl);
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          let searchResults = `[Web Search Results for "${message}"]:\n\n`;
          
          if (searchData.items && searchData.items.length > 0) {
            searchData.items.slice(0, 5).forEach((item, index) => {
              searchResults += `${index + 1}. ${item.title}\n`;
              searchResults += `   ${item.snippet}\n`;
              searchResults += `   URL: ${item.link}\n\n`;
            });
          } else {
            searchResults += "No relevant search results found.\n\n";
          }
          
          // Get AI response based on search results
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are Lizz AI, a comprehensive artificial intelligence assistant with access to real-time web search results. Provide a concise, accurate response based on the search results."
              },
              {
                role: "user",
                content: `Based on these search results:\n${searchResults}\n\nAnswer the question: ${message}`
              }
            ],
            temperature: 0.7,
            max_tokens: 800
          });
          
          responseText = searchResults + "\n" + completion.choices[0].message.content;
        } else {
          // Fallback if search fails
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are Lizz AI, a comprehensive artificial intelligence assistant. You have access to all human knowledge and can help with scientific research, education, creative projects, and more."
              },
              { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 1000
          });
          
          responseText = "[Web search temporarily unavailable]\n\n" + completion.choices[0].message.content;
        }
      } catch (searchError) {
        console.error('Search Error:', searchError);
        // Fallback to normal response
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are Lizz AI, a comprehensive artificial intelligence assistant. You have access to all human knowledge and can help with scientific research, education, creative projects, and more."
            },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });
        
        responseText = "[Web search temporarily unavailable]\n\n" + completion.choices[0].message.content;
      }
    } else if (mode === 'deepthink' && userIsActuallyPremium) {
      // Deep thinking mode (premium only)
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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
      // Normal mode (available to all users)
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
    console.error('Backend Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.use(cors({
  origin: 'https://varunkarthiktrading-ux.github.io', // Allow requests from your frontend
  methods: ['GET', 'POST'],
  credentials: true
})); 

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔑 OpenAI API configured: ${!!process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🔑 Google API configured: ${!!process.env.GOOGLE_API_KEY ? 'Yes' : 'No'}`);
});
