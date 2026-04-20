import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Serve the static files from the Vite build folder
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Handle React routing (send all requests to index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 3. Azure uses a dynamic PORT provided via environment variables
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`The TieBreaker is live on port ${PORT}`);
});