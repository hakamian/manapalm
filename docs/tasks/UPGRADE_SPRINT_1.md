# 🚀 Upgrade Sprint 1: Stability & Growth

**Status:** In Progress
**Start Date:** 2026-02-12
**Team:** Full Agent Squad

## 🎯 Objectives
1.  **Fortify (Sentinel):** Implement E2E testing with Playwright to ensure core flows (Login, Shop, Checkout) never break.
2.  **Retain (Verdant/Root):** accurate data modeling for a Subscription/Guardianship system to increase user LTV (Lifetime Value).
3.  **Unify (Canopy):** Establish a programmable Design System to ensure visual consistency and speed up development.

## 🛠️ Tasks

### 1. 🛡️ Automated Testing (Sentinel)
- [ ] **Install Playwright**: Setup testing framework.
- [ ] **Test Case 1 (Public):** Verify Home page loads and Shop is accessible.
- [ ] **Test Case 2 (Auth):** Verify Login flow (using test credentials).
- [ ] **Test Case 3 (Critical):** Verify "Add to Cart" functionality.
- [ ] **CI Integration:** Add `test` script to `package.json`.

### 2. 💎 Subscription System (Verdant & Root)
- [ ] **Database Schema:** Design `subscriptions` and `plans` tables in Supabase.
- [ ] **Plan Definitions:** Define the "Grove Guardian" tiers (e.g., Seedling, Sapling, Palm).
- [ ] **API Logic:** Create draft server actions for handling subscriptions.

### 3. 🎨 Design System (Canopy)
- [ ] **Token Configuration:** Create `tailwind.config.tokens.ts` (or similar) to centralize colors, easy animations, and spacing.
- [ ] **Component Audit:** Identify hardcoded values in `index.css` and components to replace with tokens.
- [ ] **Style Guide Page:** Create a hidden `/design-system` route to visualize the system.

## 📝 Activity Log
- **2026-02-12:** Sprint started. Playwright installation initiated.
