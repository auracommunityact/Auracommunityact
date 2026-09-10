const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  "app.post('/api/ai/generate', upload.single('image'), async (req, res) => {",
  `app.post('/api/ai/generate', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload error', details: err.message });
    }
    next();
  });
}, async (req, res) => {`
);

fs.writeFileSync('server.ts', code);
