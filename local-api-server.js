
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
// --- OTP & SMS Endpoints for Local Dev ---
app.post('/api/auth/otp', async (req, res) => {
    console.log(`[Local API] Received POST /api/auth/otp`);
    // Mocking the behavior for local-api-server (Express)
    // In production/Next.js it uses the actual app/api/auth/otp/route.ts
    const { action, mobile, code } = req.body;

    // For local testing, we can just call a simple version or proxies to the logic
    // But the best way is to use Port 3000 where Next.js handles this perfectly.
    res.status(200).json({ success: true, message: "Please use Port 3000 for full OTP functionality." });
});

app.post('/api/sms', async (req, res) => {
    const apiKey = process.env.SMS_IR_API_KEY;
    const { mobile, templateId, parameters } = req.body;
    const smsRes = await fetch('https://api.sms.ir/v1/send/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ mobile, templateId, parameters })
    });
    const data = await smsRes.json();
    res.status(smsRes.status).json(data);
});

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
