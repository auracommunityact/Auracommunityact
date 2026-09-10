import express from 'express';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import * as dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Set up multer for file uploads (in-memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// API Routes

import { GoogleGenAI } from '@google/genai';

app.post('/api/ai/generate', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload error', details: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const apiKey = process.env.KITS_AI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(500).json({ error: 'Aura AI is temporarily unavailable (Missing API Key)' });
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    
    let messages = [];
    if (req.body.messages) {
      try {
        messages = JSON.parse(req.body.messages);
      } catch (e) {
        console.error("Failed to parse messages");
      }
    }
    
    const latestMessage = req.body.message || '';
    const file = req.file;

    const systemInstruction = `You are Aura AI, your intelligent assistant for the Aura Community ACT ecosystem.
Owner: Shaan Mohammad.
Aura Community ACT: Ecosystem of projects, community, support.
Aura Learning: Education platform, videos, books.
Aura Play: Gaming platform, game listings, downloads.
Other projects: Aura Studio, Aura Store, Aura Movie, Aura Search, Aura Arrow, Aura Esport, Aura Hub.

Guidelines:
1. Use the Aura Knowledge Base first for Aura-related questions. Give detailed, accurate answers.
2. Never invent Aura-specific information. If unavailable, say it is not currently confirmed.
3. For technical problems, provide step-by-step solutions. Analyze screenshots if provided.
4. Support general questions too (Programming, Tech, Education, etc.).
5. Automatically respond in the user's language (Hindi, Hinglish, English). Example: If user asks in Hinglish, reply in Hinglish.`;

    const contents = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const latestParts = [];
    if (latestMessage) {
      latestParts.push({ text: latestMessage });
    }
    
    if (file) {
       latestParts.push({
         inlineData: {
           data: file.buffer.toString('base64'),
           mimeType: file.mimetype
         }
       });
    }
    
    // Ensure we don't send an empty user turn
    if (latestParts.length > 0) {
      contents.push({ role: 'user', parts: latestParts });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
            systemInstruction: { parts: [{ text: systemInstruction }] }
        }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response. Please try again.',
      details: error.message 
    });
  }
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AI Chat Endpoint

// Global error handler for API routes
app.use('/api', (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

async function startServer() {

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
