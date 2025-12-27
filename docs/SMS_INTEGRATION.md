# SMS Integration - Technical Documentation

## Overview
ManaPalm uses [SMS.ir](https://sms.ir) for sending OTP verification codes.

## Architecture Decision

### ⚠️ IMPORTANT: Use Vercel Serverless Functions for SMS

After debugging production issues, we discovered that:
- **Next.js App Router endpoints** (`/app/api/.../route.ts`) had issues with SMS.ir API in production
- **Vercel Serverless Functions** (`/api/*.js`) work correctly in both local and production

### Why This Matters
The same code that works locally may fail in production when using App Router endpoints. 
The error manifested as: `"کلید پارامتر: templateId.$"` which suggested JSON serialization issues.

## Current Implementation

### Primary Endpoint: `/api/otp.js`
Location: `api/otp.js`

This is a **Vercel Serverless Function** that handles:
- `action: 'send'` - Send OTP via SMS
- `action: 'verify'` - Verify OTP code
- `action: 'set-password'` - Set user password after verification

### Backward Compatibility: `/api/secure/otp`
Location: `app/api/secure/otp/route.ts`

This endpoint forwards requests to `/api/otp` for backward compatibility.

## Environment Variables Required

```env
SMS_IR_API_KEY=your_api_key_here
SMS_IR_TEMPLATE_ID=459472
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

## SMS.ir Template Configuration

Template ID: `459472`
Parameters:
- `CODE` - The 6-digit verification code
- `EXPIRE_TIME` - Expiry time in minutes (default: 5)

## Troubleshooting

### If SMS stops working in production:
1. Check Vercel Environment Variables are set correctly
2. Test with: `https://manapalm.com/api/testsms?m=YOUR_PHONE`
3. Check SMS.ir panel for template status (must be "تایید")
4. Verify API key hasn't expired

### Debug Endpoint (for development only)
Create `api/testsms.js` temporarily to test SMS directly.

## Best Practices for Future Development

1. **Always use `/api/*.js` for external API calls** in production
2. **Test in production** after any SMS-related changes
3. **Keep `/api/otp.js`** as the primary OTP handler
4. **Don't migrate back to App Router** for SMS endpoints without thorough production testing
