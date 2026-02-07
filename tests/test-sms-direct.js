
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Mock request parameters (similar to what the app sends)
// Note: You might want to use a real number for a real test, or just check the handshake
const TEST_MOBILE = "09123456789";
const TEST_TEMPLATE_ID = process.env.SMS_IR_TEMPLATE_ID;
const API_KEY = process.env.SMS_IR_API_KEY;

if (!API_KEY) {
    console.error("❌ SMS_IR_API_KEY is missing in .env.local");
    process.exit(1);
}

if (!TEST_TEMPLATE_ID) {
    console.error("❌ SMS_IR_TEMPLATE_ID is missing in .env.local");
    process.exit(1);
}

console.log("🛠️ Testing SMS.ir Connection...");
console.log(`🔑 API Key: ${API_KEY.substring(0, 5)}...`);
console.log(`YZ Template ID: ${TEST_TEMPLATE_ID}`);
console.log(`📱 Mobile: ${TEST_MOBILE}`);

async function testSms() {
    try {
        const payload = {
            mobile: TEST_MOBILE,
            templateId: parseInt(TEST_TEMPLATE_ID),
            parameters: [
                { name: "Code", value: "12345" } // Assuming 'Code' is the parameter name from your service file
            ],
        };

        // Note: 'verify' endpoint is usually distinct from 'bulk'
        // Your code uses: https://api.sms.ir/v1/send/verify

        const response = await fetch('https://api.sms.ir/v1/send/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log("---------------------------------------------------");
        console.log(`📡 Status: ${response.status} ${response.statusText}`);
        console.log("💾 Response Data:", JSON.stringify(data, null, 2));
        console.log("---------------------------------------------------");

        if (response.ok) {
            console.log("✅ SMS API Connection SUCCESSFUL!");
        } else {
            console.error("❌ SMS API Connection FAILED.");
            if (data.message === "Limited ip invalid") {
                console.warn("⚠️  Hint: Your IP might be blocked or you need to whitelist server IP in SMS.ir panel.");
            }
        }

    } catch (error) {
        console.error("❌ Network or Execution Error:", error);
    }
}

testSms();
