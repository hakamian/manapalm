---
description: how to deploy the send-otp Supabase Edge Function to bypass internet restrictions
---

# Deploy Guidelines for Supabase Edge Functions

To deploy the `send-otp` function which handles SMS sending from a secure environment (bypassing local internet restrictions), follow these steps.

### Prerequisites

Ensure you have the Supabase CLI installed, or use `npx supabase`.
You also need your `SMS_IR_API_KEY` and `SMS_IR_TEMPLATE_ID` handy.

### 1. Login to Supabase

If you haven't logged in via CLI before:

```powershell
npx supabase login
```

### 2. Set Secrets (Environment Variables)

Upload your sensitive API keys to the Supabase restricted environment so the function can use them.

```powershell
npx supabase secrets set SMS_IR_API_KEY="f9yuKM1HcPFbblQKxlepQAS50MJZbF7Emlz6DxGhrO31Dmpr"
npx supabase secrets set SMS_IR_TEMPLATE_ID="459472"
```

### 3. Deploy the Function

Push the code to the cloud.

```powershell
npx supabase functions deploy send-otp --no-verify-jwt
```

*(Note: `--no-verify-jwt` is optional but useful if you want to allow public access or handle auth manually inside the function, although our code verifies signatures or is internal. For stricter security, remove the flag and ensure you pass the Authorization header, which our code does.)*

### 4. Verify

Check the Dashboard in Supabase under "Edge Functions" to see `send-otp` listed with a "Green" status.
