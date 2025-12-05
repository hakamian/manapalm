
// api/payment.js
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, amount, description, email, mobile, authority } = req.body;
  
  // CONFIGURATION
  // Use a real MerchantID for production, or a sandbox ID for testing
  const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || '00000000-0000-0000-0000-000000000000'; 
  const IS_SANDBOX = true; // Set to false for production
  
  const BASE_URL = IS_SANDBOX 
    ? 'https://sandbox.zarinpal.com/pg/v4/payment' 
    : 'https://api.zarinpal.com/pg/v4/payment';
    
  const PAYMENT_GATEWAY_URL = IS_SANDBOX
    ? 'https://sandbox.zarinpal.com/pg/StartPay/'
    : 'https://www.zarinpal.com/pg/StartPay/';

  // --- REQUEST PAYMENT ---
  if (action === 'request') {
    try {
      // Callback URL: Where ZarinPal sends the user back (Assuming Vercel deployment or localhost)
      // In production, ensure this matches your domain.
      const callbackUrl = `${req.headers.origin}/?view=PAYMENT_CALLBACK`;

      const response = await fetch(`${BASE_URL}/request.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: MERCHANT_ID,
          amount: amount * 10, // ZarinPal uses Rials (Toman * 10)
          callback_url: callbackUrl,
          description: description,
          metadata: { email, mobile }
        })
      });

      const data = await response.json();

      if (data.data && data.data.code === 100) {
        return res.status(200).json({
          success: true,
          authority: data.data.authority,
          url: `${PAYMENT_GATEWAY_URL}${data.data.authority}`
        });
      } else {
        return res.status(400).json({ success: false, error: data.errors });
      }

    } catch (error) {
      console.error('ZarinPal Request Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // --- VERIFY PAYMENT ---
  else if (action === 'verify') {
    try {
      const response = await fetch(`${BASE_URL}/verify.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: MERCHANT_ID,
          amount: amount * 10, // Convert Toman to Rial
          authority: authority
        })
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
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}
