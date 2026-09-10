const fs = require('fs');
let code = fs.readFileSync('src/pages/AuraAI.tsx', 'utf-8');
code = code.replace(
  "if (error.code === '42P01') {",
  "if (error.code === '42P01' || error.code === 'PGRST205') {"
);
fs.writeFileSync('src/pages/AuraAI.tsx', code);
