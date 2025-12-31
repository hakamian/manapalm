# Implementation Plan: Next Steps (Post-Fix)

## Completed in Previous Session
-   ✅ **Address Validation:** Shopping Cart now checks for address before proceeding.
-   ✅ **Search:** Full search functionality implemented (`SearchResultsView`).
-   ✅ **Scalability:** `AppContext` optimized to load essential data only. Admin data is lazy-loaded.

## Outstanding Items (Deferred)

### 1. Payment Gateway Integration
> **Dependency:** Waiting for User to provide ZarinPal Merchant ID / Credentials.
-   **Task:** Connect `CheckoutView` to ZarinPal API.
-   **Task:** Route Shopping Cart "Checkout" button to `View.Checkout`.

### 2. Architecture Cleanup
> **Goal:** Standardize on Next.js App Router and remove Vite dependencies to simplify build process.
-   **Task:** Remove `vite.config.ts` and `index.html`.
-   **Task:** Ensure all assets are loaded via Next.js `public` folder.

### 3. Production Verification
-   **Task:** Deploy to Vercel/Netlify.
-   **Task:** Verify `SMS_IR_API_KEY` environment variable in the cloud dashboard.

### 4. Search Engine Optimization (SEO)
> **Goal:** Increase visibility on Google for "کاشت نخل", "خیرات اموات", etc.
-   ✅ **Technical Foundation:** `sitemap.ts`, `robots.ts`, `manifest.ts` created.
-   ✅ **Metadata:** Upgrade `layout.tsx` with OpenGraph/Twitter tags.
-   ✅ **Programmatic SEO:** Create `/story/[id]` dynamic route for server-side rendering of Deeds.
-   ✅ **Structured Data:** Inject JSON-LD Schema (Organization) globally.

## Suggested Next Command
When you are ready to resume:
`"I have the payment credentials. Let's finish the checkout flow."`
