import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});
ai.interactions.create({
  model: 'gemini-3.8-flash',
  input: 'hello',
}).then(res => console.log(res.output_text)).catch(console.error);
