
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  console.log(`💳 [API] Payment Request started for ${req.body.action || 'unknown action'}`);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, amount, description, email, mobile, authority } = req.body;

  // CONFIGURATION
  const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;
  const IS_SANDBOX = process.env.ZARINPAL_SANDBOX !== 'false';

  const BASE_URL = IS_SANDBOX
    ? 'https://sandbox.zarinpal.com/pg/v4/payment'
    : 'https://api.zarinpal.com/pg/v4/payment';

  const PAYMENT_GATEWAY_URL = IS_SANDBOX
    ? 'https://sandbox.zarinpal.com/pg/StartPay/'
    : 'https://www.zarinpal.com/pg/StartPay/';

  if (!MERCHANT_ID && !IS_SANDBOX) {
    console.error("CRITICAL: Missing ZARINPAL_MERCHANT_ID in production mode.");
    return res.status(500).json({ error: 'Server Payment Configuration Error' });
  }

  // --- REQUEST PAYMENT ---
  if (action === 'request') {
    try {
      const callbackUrl = `${req.headers.origin}/?view=PAYMENT_CALLBACK`;

      // 🛡️ CTO TEST MODE: If no merchant ID and explicitly allowed or in development
      if (!MERCHANT_ID || MERCHANT_ID === 'TEST') {
        console.log('🧪 [API] TEST MODE: Simulating payment request. Returning instant response.');
        return res.status(200).json({
          success: true,
          authority: 'TEST_AUTHORITY_' + Date.now(),
          url: `${callbackUrl}&Authority=TEST_TOKEN&Status=OK`
        });
      }

      console.log(`🔗 [API] Calling ZarinPal API: ${BASE_URL}/request.json`);
      const payload = {
        merchant_id: MERCHANT_ID,
        amount: amount * 10, // Convert Toman to Rial
        callback_url: callbackUrl,
        description: description,
        metadata: { email, mobile }
      };

      const response = await fetch(`${BASE_URL}/request.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.data && data.data.code === 100) {
        return res.status(200).json({
          success: true,
          authority: data.data.authority,
          url: `${PAYMENT_GATEWAY_URL}${data.data.authority}`
        });
      } else {
        console.error('ZarinPal Request Error Data:', data);
        return res.status(400).json({ success: false, error: data.errors });
      }

    } catch (error) {
      console.error('ZarinPal Request Network Error:', error);
      return res.status(500).json({ error: 'Payment Gateway Connection Failed' });
    }
  }

  // --- VERIFY PAYMENT ---
  else if (action === 'verify') {
    try {
      if (authority === 'TEST_TOKEN') {
        console.log('🧪 [API] TEST MODE: Simulating payment verification');
        return res.status(200).json({
          success: true,
          refId: 999999,
          message: 'تراکنش تستی با موفقیت تایید شد.'
        });
      }

      const payload = {
        merchant_id: MERCHANT_ID || '00000000-0000-0000-0000-000000000000',
        amount: amount * 10, // Convert Toman to Rial
        authority: authority
      };

      const response = await fetch(`${BASE_URL}/verify.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Code 100 = Success, Code 101 = Verified Already
      if (data.data && (data.data.code === 100 || data.data.code === 101)) {
        return res.status(200).json({
          success: true,
          refId: data.data.ref_id,
          message: 'تراکنش با موفقیت انجام شد.'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'تراکنش ناموفق بود یا لغو شده است.',
          code: data.data?.code
        });
      }

    } catch (error) {
      console.error('ZarinPal Verify Error:', error);
      return res.status(500).json({ error: 'Internal Server Error during Verification' });
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}
