# Project Memory: Resilience Update (OTP & Profile)
Date: 2026-01-25

## Achievements
1. **Infrastructure Optimization (SSR & Performance)**
   - Fixed catastrophic rendering lag (100s+) in `LiveActivityBanner`.
   - Replaced simplified circular React nodes in Redux state with serializable icon names.
   - Optimized `middleware.ts` to bypass Supabase auth on public routes (Shop, Landing), reducing latency by 3-5s.

2. **Resilient OTP System (Anti-Censorship)**
   - Implemented a **Triple-Layer Redundancy** for SMS delivery:
     1. **Direct Layer:** Tries `api.sms.ir` directly (Fastest, works if network opens).
     2. **Cloud Proxy Layer:** Auto-switches to `Supabase Edge Function` (`send-otp`) if local network is blocked/intranet.
     3. **Developer Layer:** Fallback to **Terminal Output** if all networks fail (Zero downtime for devs).
   - Created and deployed `supabase/functions/send-otp` to handle SMS dispatch from a secure environment.

3. **User Profile Enhancements**
   - Added **"Secure Mobile Display"** in the Profile Security tab.
   - Users can now verify their registered number (masked/protected UI) alongside password management.

## Technical Notes
- **Edge Function:** Requires `SMS_IR_API_KEY` and `SMS_IR_TEMPLATE_ID` secrets in Supabase.
- **Middleware:** Now skips static files and public routes more aggressively.
- **Git Status:** New files (`supabase/functions/send-otp/index.ts`, `.agent/workflows/deploy-edge.md`) need validation to ensure they are tracked.

## Next Steps
- Verify Zarinpal Payment Gateway integration.
- Check "Hall of Heritage" planting flow with the new optimizations.
