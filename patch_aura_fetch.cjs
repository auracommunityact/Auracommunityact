const fs = require('fs');
let code = fs.readFileSync('src/pages/AuraAI.tsx', 'utf-8');
code = code.replace(
  'const data = await response.json();\n\n      if (!response.ok) {\n        throw new Error(data.error || \'Failed to generate response\');\n      }',
  `let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(\`Server returned an invalid response (Status: \${response.status})\`);
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate response');
      }`
);
fs.writeFileSync('src/pages/AuraAI.tsx', code);
