const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Remove kits endpoints
code = code.replace(/app\.post\('\/api\/kits\/convert'[\s\S]*?\/\/ For polling the job status/m, '// AI Chat Endpoint\n// For polling the job status');
code = code.replace(/\/\/ For polling the job status[\s\S]*?async function startServer\(\)/m, 'async function startServer()');

// Insert new Gemini endpoint
const geminiEndpoint = `
import { GoogleGenAI } from '@google/genai';

app.post('/api/ai/generate', upload.single('image'), async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Aura AI is temporarily unavailable (Missing API Key)' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
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

    const systemInstruction = \`You are Aura AI, your intelligent assistant for the Aura Community ACT ecosystem.
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
5. Automatically respond in the user's language (Hindi, Hinglish, English). Example: If user asks in Hinglish, reply in Hinglish.\`;

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
        model: 'gemini-2.5-flash',
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

`;

code = code.replace('// API Routes', '// API Routes\n' + geminiEndpoint);

// Check if GoogleGenAI is already imported, if so, remove the duplicate import I just added
if (code.match(/import \{ GoogleGenAI \} from '@google\/genai'/g)?.length > 1) {
  code = code.replace("import { GoogleGenAI } from '@google/genai';\n", "");
}

fs.writeFileSync('server.ts', code);
