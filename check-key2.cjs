require('dotenv').config();
const key1 = process.env.KITS_AI_API_KEY;
const key2 = process.env.GEMINI_API_KEY;
console.log("KITS_AI_API_KEY:", key1 ? (key1.startsWith("AIza") ? "Valid Gemini Key Format" : "Invalid Gemini Key Format (Length: " + key1.length + ")") : "Not Found");
console.log("GEMINI_API_KEY:", key2 ? (key2.startsWith("AIza") ? "Valid Gemini Key Format" : "Invalid Gemini Key Format (Length: " + key2.length + ")") : "Not Found");
