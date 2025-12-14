const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const HEALTH_CHECK_FILE = path.join(__dirname, '..', 'health.txt');

// Create health check file if it doesn't exist
if (!fs.existsSync(HEALTH_CHECK_FILE)) {
  fs.writeFileSync(HEALTH_CHECK_FILE, 'healthy');
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

server.listen(PORT + 1, () => {
  console.log(`Health check server listening on port ${PORT + 1}`);
});