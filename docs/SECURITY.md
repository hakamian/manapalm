# Security Documentation - ManaPalm

## ⚠️ CRITICAL: API Key Exposure in Git History

**Status:** API keys were previously committed to the git repository. 

### Immediate Action Required:

1. **Rotate ALL API Keys:**
   - [ ] Gemini API Key (Google Cloud Console)
   - [ ] SMS.ir API Key (SMS.ir Panel)
   - [ ] Cloudinary API Secret (Cloudinary Dashboard)
   - [ ] Supabase Service Role Key (Supabase Dashboard)

2. **Update Vercel Environment Variables** after rotation

3. **Never commit `.env` again** - It's already in `.gitignore`

---

## Security Measures Implemented

### 1. XSS Protection ✅
- **File:** `components/MenteeBriefingModal.tsx`
- **Solution:** DOMPurify sanitization for HTML content
- **Package:** `dompurify`

### 2. Rate Limiting ✅
- **File:** `api/otp.js`
- **Limits:** 5 OTP requests per mobile per 10 minutes
- **Response:** HTTP 429 with Persian error message
- **Note:** In-memory store (resets on cold start). For production scale, use Redis/Upstash.

### 3. API Key Security ✅
- All API keys stored in environment variables
- Server-side only access for sensitive keys
- `NEXT_PUBLIC_*` prefix only for client-side safe values

---

## Security Best Practices

### Environment Variables
```
✅ DO:
- Store API keys in Vercel Environment Variables
- Use server-side endpoints for sensitive operations
- Rotate keys periodically

❌ DON'T:
- Never commit .env files
- Never expose SERVICE_ROLE keys to client
- Never log full API keys
```

### Input Validation
- All user inputs should be sanitized
- Use DOMPurify for HTML content
- Validate phone numbers before processing

### Authentication
- Supabase Auth handles session management
- OTP verification with expiry (5 minutes)
- Admin routes protected with role checks

---

## Future Improvements

1. **Persistent Rate Limiting** - Migrate to Upstash Redis
2. **Web Application Firewall** - Consider Cloudflare WAF
3. **Security Headers** - Add CSP, HSTS via Vercel
4. **Dependency Auditing** - Regular `npm audit` checks
5. **Penetration Testing** - Before major launch

---

## Incident Response

If you suspect a security breach:
1. Immediately rotate all API keys
2. Check Supabase logs for unauthorized access
3. Review Vercel deployment logs
4. Contact security@manapalm.com

---

**Last Updated:** December 27, 2025
**Version:** 1.0
