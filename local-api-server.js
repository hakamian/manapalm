
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import proxyHandler from './api/proxy.js';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware to parse JSON bodies (mimicking Vercel's automatic parsing)
app.use(express.json());

// Enable CORS for local dev
app.use(cors({
    origin: ['http://localhost:3002', 'http://localhost:3000', 'https://manapalm.com'],
    credentials: true
}));

// Mock Vercel Request/Response if needed, but Express is close enough
app.post('/api/proxy', async (req, res) => {
    console.log(`[Local API] Received POST /api/proxy`);

    // Pass raw req/res to the handler
    // The handler expects req.body which Express provides
    try {
        await proxyHandler(req, res);
    } catch (err) {
        console.error("Local API Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Build fallback for GET to prove it's running
app.get('/', (req, res) => {
    res.send('Local API Server Running.');
});

app.listen(PORT, () => {
    console.log(`✅ Local API Server running at http://localhost:${PORT}`);
    console.log(`   - Proxying AI requests...`);
});
