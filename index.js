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

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, mode } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Simulate different modes
    let responseText = '';
    
    if (mode === 'websearch') {
      responseText = `[Web Search Mode] Results for "${message}":\n\n` +
        `🔍 Found 4 relevant results:\n` +
        `1. Official definition of ${message}\n` +
        `2. Practical applications of ${message}\n` +
        `3. Recent research on ${message}\n` +
        `4. Community discussions about ${message}\n\n` +
        `Based on these results, ${message} refers to...`;
    } else if (mode === 'deepthink') {
      responseText = `[DeepThink Mode] Comprehensive Analysis:\n\n` +
        `🧠 Analyzing "${message}" from multiple perspectives:\n\n` +
        `🔬 Scientific View:\n` +
        `From a scientific standpoint, this involves...\n\n` +
        `📚 Philosophical Perspective:\n` +
        `Philosophically, we must consider...\n\n` +
        `🔧 Practical Implementation:\n` +
        `To implement this effectively, one should...\n\n` +
        `🎯 Conclusion:\n` +
        `The optimal approach combines all perspectives...`;
    } else {
      responseText = `Lizz AI Response:\n\n` +
        `I've processed your query about "${message}".\n\n` +
        `In a production environment, this would connect to:\n` +
        `- OpenAI API for natural language processing\n` +
        `- Google Search API for real-time information\n` +
        `- Internal knowledge bases for comprehensive responses\n\n` +
        `How else can I assist you with this topic?`;
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({ response: responseText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔑 OpenAI API configured: ${!!process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🔑 Google API configured: ${!!process.env.GOOGLE_API_KEY ? 'Yes' : 'No'}`);
});
