
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import handler from './api/proxy.js'; // Import the Vercel handler

dotenv.config();

const app = express();
const PORT = 3001;

// Use CORS to allow requests from the Vite frontend (port 3000)
app.use(cors({
    origin: ['http://localhost:3000', 'https://manapalm.com'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Helper to adapt Express req/res to Vercel handler if needed
// Vercel handlers usually take (req, res). Express does too.
// We just need to ensure req.body is available (handled by express.json above)

app.post('/api/proxy', async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error("Local Server Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});

// Also handle OPTIONS directly here if the handler doesn't (though handler does)
app.options('/api/proxy', async (req, res) => {
    await handler(req, res);
});

app.listen(PORT, () => {
    console.log(`Local AI API Server running at http://localhost:${PORT}`);
    console.log(`Proxy endpoint available at http://localhost:${PORT}/api/proxy`);
});
