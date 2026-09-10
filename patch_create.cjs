const fs = require('fs');
let code = fs.readFileSync('src/pages/AuraAI.tsx', 'utf-8');
code = code.replace(
  'console.error("Failed to create chat:", err);',
  `if (err?.code === '42P01' || err?.code === 'PGRST205') {
        console.warn("Aura AI tables not found. Running in local-only mode.");
      } else {
        console.error("Failed to create chat:", JSON.stringify(err));
      }`
);
code = code.replace(
  'console.error("Failed to load chats:", error);',
  'console.error("Failed to load chats:", JSON.stringify(error));'
);
fs.writeFileSync('src/pages/AuraAI.tsx', code);
