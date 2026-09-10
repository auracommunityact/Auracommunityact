const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  'const ai = new GoogleGenAI({ apiKey });',
  `const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });`
);
code = code.replace("model: 'gemini-3.6-flash',", "model: 'gemini-3.8-flash',");

fs.writeFileSync('server.ts', code);
