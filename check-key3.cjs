require('dotenv').config();
console.log("GEMINI_API_KEY prefix:", process.env.GEMINI_API_KEY?.substring(0, 10));
console.log("KITS_AI_API_KEY prefix:", process.env.KITS_AI_API_KEY?.substring(0, 10));
