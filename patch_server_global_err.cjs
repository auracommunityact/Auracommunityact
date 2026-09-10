const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const errHandler = `
// Global error handler for API routes
app.use('/api', (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

async function startServer() {
`;

code = code.replace("async function startServer() {", errHandler);

fs.writeFileSync('server.ts', code);
