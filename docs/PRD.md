# Product Requirements Document (PRD)
# نخلستان معنا (Manapalm) - Garden of Meaning

**Version:** 1.1  
**Date:** December 27, 2025  
**Status:** Production Ready (Phase 1)  
**Project URL:** https://manapalm.com  
**Repository:** https://github.com/hakamian/manapalm

---

## Executive Summary

**نخلستان معنا (Manapalm)** is a comprehensive social enterprise platform that combines e-commerce, education, AI-powered personal development tools, and community engagement around the symbolic act of planting palm trees. The platform represents a unique blend of cultural heritage preservation, environmental sustainability, and personal growth through technology.

### Vision
To create a thriving digital ecosystem where individuals can discover and cultivate meaning in their lives while contributing to environmental and social impact through the symbolic and actual planting of palm trees.

### Mission
- **Heritage Preservation:** Connect people to their cultural roots through symbolic palm tree planting
- **Personal Growth:** Provide AI-powered tools and educational resources for self-discovery and development
- **Social Impact:** Generate employment opportunities in rural communities through environmental initiatives
- **Community Building:** Foster a vibrant community of meaning-seekers and change-makers

### Core Value Proposition
Manapalm offers users a unique combination of:
1. **Symbolic Legacy Creation** - Plant a palm tree to commemorate life events and create lasting impact
2. **AI-Powered Personal Development** - Access cutting-edge AI tools for self-discovery and content creation
3. **Educational Excellence** - Learn business, AI, English, and life skills through interactive academies
4. **Community Impact** - Contribute to environmental restoration and rural employment
5. **Gamified Engagement** - Earn points and unlock features through meaningful actions

---

## Market & User Analysis

### Target Users

#### Primary Personas

**1. The Meaning Seeker (سالک معنا)**
- **Demographics:** 25-45 years old, urban professionals
- **Psychographics:** Seeking purpose, interested in personal growth
- **Pain Points:** Feeling disconnected from roots, lack of meaning in daily life
- **Goals:** Find purpose, create lasting legacy, contribute to society
- **Use Cases:** Plant memorial palms, take personality tests, engage with AI coaches

**2. The Digital Entrepreneur (کارآفرین دیجیتال)**
- **Demographics:** 22-40 years old, freelancers, content creators
- **Psychographics:** Tech-savvy, ambitious, seeking new skills
- **Pain Points:** Need to upskill in AI and digital marketing
- **Goals:** Build online business, master AI tools, increase income
- **Use Cases:** Take courses, use AI content creation tools, build websites

**3. The Cultural Patron (حامی میراث)**
- **Demographics:** 35-65 years old, established professionals
- **Psychographics:** Value tradition, want to give back
- **Pain Points:** Want meaningful ways to contribute to society
- **Goals:** Preserve heritage, support communities, leave legacy
- **Use Cases:** Purchase premium palm packages, gift palms, crowdfund projects

**4. The Community Builder (معمار جامعه)**
- **Demographics:** 25-50 years old, educators, social activists
- **Psychographics:** Community-oriented, collaborative
- **Pain Points:** Limited platforms for collective action
- **Goals:** Create impact, build networks, inspire others
- **Use Cases:** Create community projects, mentor others, share experiences

#### Secondary Personas

**5. The Corporate Partner**
- Organizations seeking CSR initiatives and team building activities
- Use Cases: Corporate palm planting, employee engagement programs

**6. The International Supporter**
- Persian diaspora wanting to connect with homeland
- Use Cases: Remote palm planting, cultural education, heritage preservation

### Market Size & Opportunity

**Total Addressable Market (TAM):**
- Iranian digital services market: ~$5B+
- Online education market in Iran: ~$500M+
- E-commerce market in Iran: ~$8B+

**Serviceable Addressable Market (SAM):**
- Persian-speaking professionals interested in personal development: ~5M users
- Potential market value: ~$250M

**Serviceable Obtainable Market (SOM - Year 1):**
- Target: 10,000 active users
- Revenue projection: $500K-$1M (Year 1)

---

## Product Architecture

### Technical Stack

**Frontend:**
- **Framework:** Next.js 14.2.35 with React 18 and TypeScript
- **Build Tool:** Next.js built-in bundler (Turbopack/Webpack)
- **Styling:** TailwindCSS (via utility classes)
- **State Management:** React Context API (AppContext)
- **Routing:** Next.js App Router
- **PWA:** Service Worker for offline support and installability

**Backend & Services:**
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth, Phone/OTP via SMS.ir)
- **SMS Provider:** SMS.ir (OTP verification and notifications)
- **AI Services:** Google Gemini API (gemini-2.5-flash, imagen-4.0)
- **File Storage:** Cloudinary
- **Payment Gateway:** ZarinPal (Iranian payment processor)
- **Hosting:** Vercel
- **API Proxy:** Vercel Serverless Functions for API key security

**AI Integration:**
- **Primary Model:** Gemini 2.5 Flash for content generation and analysis
- **Image Generation:** Imagen 4.0 for visual content
- **Fallback System:** Built-in resilience for service interruptions
- **Safety:** Configurable content filtering and moderation

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React SPA)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Components  │  │  AppContext  │  │   Services   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────┬────────────────────────────────┬──────────┘
                 │                                 │
         ┌───────▼────────┐              ┌────────▼─────────┐
         │  Vercel Edge   │              │    Supabase      │
         │   Functions    │              │   (Database)     │
         │  (API Proxy)   │              └──────────────────┘
         └───────┬────────┘
                 │
         ┌───────▼────────┐              ┌──────────────────┐
         │  Gemini API    │              │   Cloudinary     │
         │  (Google AI)   │              │  (Media CDN)     │
         └────────────────┘              └──────────────────┘
```

### Data Model

**Core Entities:**

1. **User**
   - Profile information (name, email, phone, avatar)
   - Points system (Barkat points, Mana points)
   - Timeline and achievements
   - Course enrollments and progress
   - Unlocked features and tools

2. **Order**
   - User reference
   - Cart items with quantities
   - Payment details (including installment plans)
   - Associated deeds (palm planting records)
   - Order status history

3. **Deed** (Palm Planting Record)
   - Product reference (palm type)
   - Intention/dedication message
   - Recipient information
   - Planting status and photos
   - Updates from grove keepers
   - Certificate ID

4. **Product**
   - Heritage palms (different types and prices)
   - Digital products (courses, tools access)
   - Physical products (dates, handicrafts)
   - Subscription services

5. **Course**
   - Academy reference (AI, English, Business, etc.)
   - Lessons and modules
   - Assessments and quizzes
   - Personalization settings
   - Completion tracking

6. **Community Post**
   - User reference
   - Content (text, images, reflections)
   - Engagement metrics (likes, comments)
   - Moderation status

### Security & Privacy

**Authentication:**
- OAuth 2.0 via Supabase Auth
- Phone number verification via OTP
- Session management with secure tokens
- Admin role-based access control

**Data Protection:**
- API keys stored in environment variables
- Serverless proxy to hide sensitive keys
- HTTPS enforcement
- User data encryption at rest (Supabase)
- GDPR-compliant data handling

**AI Safety:**
- Content moderation system
- Configurable safety thresholds
- Manual review for community posts
- Fraud detection for transactions

---

## Feature Specifications

### 1. Heritage & Planting System

#### 1.1 Palm Selection & Customization

**User Stories:**
- As a user, I want to browse different types of palm trees so I can choose one that resonates with my intention
- As a user, I want to personalize my palm with a dedication message so I can create a meaningful gesture
- As a user, I want to see the cultural and botanical significance of each palm type

**Features:**
- **Palm Types Catalog:**
  - نخل معنا (Meaning Palm) - Premium option for purpose discovery - 30M IRR
  - نخل ایران (Iran Palm) - Patriotic dedication - 9M IRR
  - نخل گروهی (Group Palm) - Collaborative planting - 15M IRR
  - نخل یادبود (Memorial Palm) - Honor loved ones - 8.9M IRR
  - نخل مناسبت (Occasion Palm) - Celebrate events - 8.8M IRR
  - نخل تولد (Birthday Palm) - Birthday commemorations - 8.6M IRR

- **Deed Personalization:**
  - Intention/dedication field (required)
  - Recipient name and relationship
  - Personal message (optional)
  - Selection of grove keeper (caretaker)
  - Gift option for other users

- **Information Display:**
  - Cultural significance explanation
  - Botanical information
  - Impact metrics (jobs created, CO2 absorbed)
  - Photos of actual palms in groves

**Acceptance Criteria:**
- Users can view all palm types with pricing
- Personalization form captures all required information
- System validates message content (no profanity)
- Cultural information is displayed accurately
- Mobile-responsive design

#### 1.2 Digital Certificate System

**User Stories:**
- As a user, I want to receive a beautiful digital certificate after planting
- As a user, I want to share my certificate on social media
- As a user, I want to view all my planted palms in one place

**Features:**
- **Certificate Generation:**
  - Auto-generated unique certificate ID
  - Palm type and dedication message
  - Planting date and location
  - Beautiful Persian calligraphy design
  - QR code for verification

- **Certificate Wall:**
  - Timeline view of all planted palms
  - Filter by date, type, occasion
  - Search functionality
  - Share buttons for social media
  - Download as PDF/image

- **Social Sharing:**
  - AI-generated social media posts
  - Pre-designed templates
  - Multiple platform support (Instagram, Twitter, LinkedIn)
  - Privacy controls (public/private)

**Acceptance Criteria:**
- Certificates are generated immediately after purchase
- All information is accurate and properly displayed
- PDF download works on all devices
- Sharing generates proper Open Graph meta tags
- Certificate wall loads performantly with 100+ certificates

#### 1.3 Planting Updates & Tracking

**User Stories:**
- As a user, I want to receive updates about my planted palm
- As a grove keeper, I want to post photos and updates about palms
- As a user, I want to verify that my palm was actually planted

**Features:**
- **Update System:**
  - Grove keeper dashboard for posting updates
  - Photo uploads with date stamps
  - Growth milestones (planted, sprouted, mature)
  - Seasonal photos (4 times per year)
  - Notification system for new updates

- **Verification:**
  - Geo-tagged photos
  - Grove location on interactive map
  - Certificate validation via QR code
  - Transparency dashboard showing all plantings

**Acceptance Criteria:**
- Grove keepers can upload photos with 1-click
- Photos are optimized and stored in Cloudinary
- Users receive push notifications for updates
- Map displays accurate grove locations
- Update timeline is chronologically sorted

### 2. Gamification & Points System

#### 2.1 Dual Currency System

**Barkat Points (برکت):**
- Earned through purchases (5 points per 1,000 IRR spent)
- Daily check-ins and mystery chests
- Course completions and achievements
- Community contributions
- Used for discounts and unlocking features

**Mana Points (مانا):**
- Premium currency for advanced features
- Earned through meaningful actions:
  - Deep reflections and insights
  - Creating community value
  - Helping others succeed
- Used for AI tools and premium content

**User Stories:**
- As a user, I want to earn points for my activities so I feel rewarded
- As a user, I want to see my point balance and history clearly
- As a user, I want to spend points on discounts or unlock features

**Features:**
- **Points Dashboard:**
  - Current balance display (Barkat + Mana)
  - Points history log
  - Earning opportunities feed
  - Redemption catalog

- **Daily Mystery Chest:**
  - Once per day reward
  - Random amounts (100-5000 Barkat or 50-500 Mana)
  - Streak bonus system
  - Celebration animations

- **Point Activities:**
  - Purchase rewards (automatic)
  - Daily check-in (100 Barkat)
  - Profile completion (500 Barkat)
  - Course completion (1000-5000 Barkat)
  - Review submission (50 Barkat)
  - Helping another user (100 Mana)
  - Deep reflection (200 Mana)

**Acceptance Criteria:**
- Points are awarded immediately after actions
- Points history shows all transactions
- Mystery chest appears once per 24 hours
- Streak counter resets if user misses a day
- Point balance is always accurate and synced

#### 2.2 Levels & Achievements

**User Stories:**
- As a user, I want to level up as I engage more with the platform
- As a user, I want to unlock badges for accomplishments
- As a user, I want to see what I need to do to reach the next level

**Features:**
- **Level System:**
  - 10 levels: جوانه (Sprout) → استاد کهنسال (Grand Master)
  - XP calculated from points and actions
  - Level-up celebrations with rewards
  - Title display on profile and posts
  - Exclusive perks per level

- **Achievement Badges:**
  - First Palm Planted
  - Course Master (complete 3 courses)
  - Community Champion (10+ helpful posts)
  - Reflection Sage (20+ deep reflections)
  - Heritage Ambassador (refer 5 users)
  - 50+ unique achievements

- **Progress Tracking:**
  - Visual progress bar to next level
  - Achievement checklist
  - Suggested next steps
  - Comparison with community average

**Acceptance Criteria:**
- Level calculation is accurate and fair
- Level-up triggers proper animations and notifications
- Badges appear on user profile correctly
- Progress bar updates in real-time
- Achievement requirements are clearly stated

### 3. AI-Powered Tools (Creation Studio)

#### 3.1 Content Generation Tools

**User Stories:**
- As a user, I want AI to help me create professional content quickly
- As a content creator, I want to generate articles, videos, and courses from a single source
- As a business owner, I want to create marketing materials easily

**Features:**

**A. Article Alchemist (خیمیاگر مقاله)**
- Convert any input (link, PDF, audio) to SEO-optimized article
- 2000-5000 word outputs
- Automatic heading structure
- Citation and source integration
- Multiple tone options (academic, conversational, persuasive)

**B. Omni Course Creator (سازنده دوره جامع)**
- Generate complete courses from topics
- Automatic module breakdown
- Quiz generation
- Slide deck creation
- Video script writing
- Student workbook generation

**C. Podcast Producer (تولیدکننده پادکست)**
- Convert text/article to podcast script
- Multiple host personas
- Natural conversation flow
- Intro/outro generation
- Time-stamped outline

**D. Presentation Architect (معمار ارائه)**
- Create professional slide decks
- Auto-design layout
- Icon and image suggestions
- Speaker notes
- Export to PowerPoint/Google Slides

**E. Social Media Manager (مدیر رسانه اجتماعی)**
- Generate posts for all platforms
- Hashtag recommendations
- Optimal posting time suggestions
- Multi-post campaigns
- A/B testing copy variations

**F. Code Architect (معمار کد)**
- Generate clean, documented code
- Multiple language support
- Architecture pattern implementation
- Test case generation
- Security best practices built-in

**Acceptance Criteria:**
- All tools respond within 30 seconds
- Generated content is high-quality and relevant
- Users can regenerate or refine outputs
- Export/download works for all formats
- Mobile-friendly interfaces

#### 3.2 Personal Development AI

**User Stories:**
- As a user, I want an AI companion to help me reflect on my life
- As a user, I want personalized coaching based on my goals
- As a user, I want AI to analyze my personality and give insights

**Features:**

**A. Meaning Companion (همراه معنا)**
- Daily check-in conversations
- Emotion tracking and analysis
- Goal setting and accountability
- Personalized affirmations
- Crisis support and resources

**B. AI Life Coach (مشاور هوشمند)**
- Career guidance
- Relationship advice
- Work-life balance strategies
- Stress management techniques
- Evidence-based psychological insights

**C. Business Mentor (منتور بیزینس)**
- Business strategy consultation
- Market analysis
- Growth tactics
- Financial planning
- Pitch deck reviews

**D. Personality Analysis:**
- DISC assessment (behavioral style)
- Enneagram test (core motivations)
- Ikigai discovery (life purpose)
- Strengths finder
- Values clarification

**Acceptance Criteria:**
- AI responses are empathetic and helpful
- Personality tests produce accurate results
- Coaching advice is actionable and personalized
- User data is private and secure
- Emergency resources are provided when needed

### 4. Educational Academies

#### 4.1 AI Academy (آکادمی هوش مصنوعی)

**Curriculum:**
- **Module 1:** Introduction to AI (history, concepts, ethics)
- **Module 2:** Prompt Engineering Mastery
- **Module 3:** AI Agents & Automation
- **Module 4:** Building AI Products
- **Module 5:** AI for Business & Marketing
- **Module 6:** Custom GPTs & Fine-tuning

**Features:**
- Interactive lessons with embedded AI exercises
- Live coding environments
- Project-based assessments
- Certificate upon completion
- Community of learners
- Weekly live Q&A sessions (premium)

**Price:** 
- Self-paced: 2,500,000 IRR
- With mentorship: 5,000,000 IRR

#### 4.2 English Academy (آکادمی زبان جهانی)

**Curriculum:**
- **Module 1:** Foundations (grammar, vocabulary)
- **Module 2:** Conversational Fluency
- **Module 3:** Business English
- **Module 4:** IELTS/TOEFL Preparation
- **Module 5:** Writing Excellence
- **Module 6:** Public Speaking

**Features:**
- AI conversation partner with speech recognition
- Personalized lesson paths based on placement test
- Vocabulary builder with spaced repetition
- Pronunciation feedback
- Real-world scenario practice
- Cultural context lessons

**Price:**
- Basic: 1,500,000 IRR
- Premium (with live sessions): 3,500,000 IRR
- Kids version (6-12 years): 1,200,000 IRR

#### 4.3 Business Academy (آکادمی برند و محتوا)

**Tracks:**

**Track 1: Creator Economy**
- Building your personal brand
- Content strategy
- Monetization methods
- Community building
- Sponsorships and partnerships

**Track 2: Digital Marketing**
- SEO and content marketing
- Social media advertising
- Email marketing
- Funnel optimization
- Analytics and data-driven decisions

**Track 3: Leadership & Systems**
- Business model canvas
- Team building
- Process automation
- Scaling strategies
- Exit planning

**Features:**
- Case studies from Iranian entrepreneurs
- Template library (business plans, pitch decks)
- Mentor matching
- Peer mastermind groups
- Guest speaker sessions

**Price:** 3,000,000 IRR per track

#### 4.4 Life Mastery Academy (آکادمی عملکرد زیستی)

**Curriculum:**
- Biohacking fundamentals
- Sleep optimization
- Nutrition and energy
- Exercise science
- Stress resilience
- Focus and flow states
- Longevity practices

**Features:**
- Personalized plans based on lifestyle
- Tracking integrations (wearables)
- Habit formation system
- 30-day challenges
- Expert interviews

**Price:** 2,000,000 IRR

**Acceptance Criteria for All Academies:**
- Course progress is saved automatically
- Videos load quickly with adaptive quality
- Quizzes provide instant feedback
- Certificates are professional and verifiable
- Mobile app-like experience on phone

### 5. Community Features

#### 5.1 Community Hub

**User Stories:**
- As a user, I want to connect with like-minded people
- As a user, I want to share my journey and learn from others
- As a community manager, I want to foster healthy discussions

**Features:**

**A. Posts & Discussions:**
- Text, image, and video posts
- Rich text formatting
- Hashtag system
- Topic categories
- Trending posts algorithm

**B. Engagement:**
- Likes and reactions
- Comments with threading
- Share to profile/groups
- Save/bookmark posts
- Report inappropriate content

**C. User Profiles:**
- Bio and achievements
- Recent activity feed
- Planted palms showcase
- Completed courses display
- Contribution score

**D. Moderation:**
- AI content filtering
- Community guidelines enforcement
- Admin review queue
- User reputation system
- Strike and ban system

**Acceptance Criteria:**
- Posts load in <2 seconds
- Moderation catches 95%+ inappropriate content
- Users can report effectively
- Comments support Persian and English
- Images are optimized automatically

#### 5.2 Mentorship Program

**User Stories:**
- As an expert, I want to offer mentorship and earn recognition
- As a learner, I want to find mentors in my areas of interest
- As a platform, I want to facilitate quality mentor relationships

**Features:**

**A. Mentor Discovery:**
- Browse mentor profiles
- Filter by expertise, availability, price
- Reviews and ratings
- Calendly/scheduling integration
- Video introduction clips

**B. Session Management:**
- Booking system with payment
- Video call integration (Zoom/Google Meet)
- Session notes and action items
- Follow-up reminders
- Progress tracking

**C. Mentor Dashboard:**
- Earnings overview
- Schedule management
- Mentee notes
- Session history
- Performance analytics

**Pricing Model:**
- Platform takes 20% commission
- Mentors set own rates (50,000 - 500,000 IRR/hour)
- Package deals available

**Acceptance Criteria:**
- Mentor profiles are comprehensive
- Booking flow is seamless (< 3 clicks)
- Payment processing is secure
- Reminders are sent 24h before sessions
- Users can reschedule easily

#### 5.3 Microfinance (صندوق رویش)

**User Stories:**
- As an entrepreneur, I want to pitch my project and get funding
- As a user, I want to invest in meaningful projects
- As a platform, I want to enable ethical crowdfunding

**Features:**

**A. Project Submission:**
- Project pitch template
- Budget breakdown
- Expected impact metrics
- Repayment terms
- Admin review process

**B. Investment:**
- Browse active projects
- Invest with money or Barkat points
- Track investment portfolio
- Receive repayment notifications
- Impact reports from entrepreneurs

**C. Risk Management:**
- Credit scoring for entrepreneurs
- Escrow payment system
- Milestone-based fund release
- Investor protection policies
- Default resolution process

**Acceptance Criteria:**
- Projects are reviewed within 48 hours
- Investment process is transparent
- Users receive monthly impact updates
- Repayments are processed automatically
- Default rate is tracked and displayed

### 6. E-Commerce & Shop

#### 6.1 Product Categories

**Heritage Products (Palm Trees):**
- Premium palms (8M - 30M IRR)
- Entry-level contributions (200K IRR for sapling share)
- Gift packages

**Digital Products:**
- Course access
- Tool subscriptions
- E-books and guides
- Templates and resources
- Music and meditation audio

**Physical Products:**
- Premium dates (150K - 300K IRR)
- Local handicrafts
- Honey and natural products
- Books and journals
- Manapalm merchandise

**Subscriptions:**
- Monthly Meaning Companion access (200K IRR/month)
- Weekly live sessions (150K IRR/week)
- Coaching Lab access (500K IRR/month)

#### 6.2 Shopping Experience

**User Stories:**
- As a user, I want to easily find and purchase products
- As a user, I want flexible payment options
- As a user, I want to track my orders

**Features:**

**A. Product Discovery:**
- Category navigation
- Search with filters
- Recommendations based on user profile
- Trending and popular items
- Wishlist functionality

**B. Product Pages:**
- High-quality images (Cloudinary optimization)
- Detailed descriptions
- Impact metrics (jobs created, CO2 saved)
- Reviews and ratings
- Related products

**C. Cart & Checkout:**
- Persistent cart (saved to DB)
- Quantity adjustment
- Coupon code support
- Point redemption (10% max discount)
- Multiple payment methods

**D. Payment Options:**
- Full payment via ZarinPal
- Installment plans (3, 6, 12 months)
- Barkat points discount
- Corporate invoice for bulk orders

**E. Order Management:**
- Order confirmation email
- Status tracking (registered, processing, shipped, delivered)
- Invoice download
- Return/refund requests
- Reorder functionality

**Acceptance Criteria:**
- Checkout completes in < 60 seconds
- Payment gateway integration is seamless
- Order confirmation is instant
- Users receive SMS/email updates
- 99.9% payment success rate

#### 6.3 Installment System

**Algorithm:**
Based on user's Barkat points:
- < 5,000 points: No installments
- 5,000 - 20,000 points: 3 installments available
- 20,000 - 50,000 points: 6 installments available
- 50,000+ points: 12 installments available

**Features:**
- Clear display of monthly payment
- Auto-deduction from payment method
- Reminder notifications before due date
- Early payoff option
- Late payment handling (grace period + warning)

**Acceptance Criteria:**
- Installment eligibility calculated correctly
- Monthly charges process automatically
- Users can view payment schedule
- Late payment grace period is 7 days
- Failed payments trigger appropriate notifications

### 7. Admin & Management

#### 7.1 Executive Dashboard

**User Stories:**
- As an admin, I want to see overall platform health at a glance
- As an admin, I want AI-powered insights and recommendations
- As an admin, I want to make data-driven decisions

**Features:**

**A. KPI Overview:**
- Active users (daily/monthly)
- Revenue (today, week, month, year)
- Orders and conversion rate
- Course enrollments
- Community engagement metrics
- AI tool usage statistics

**B. AI CEO Assistant:**
- Automatic anomaly detection
- Growth opportunity identification
- User segment analysis
- Churn prediction
- Smart action recommendations
  - Launch a campaign
  - Offer promotions
  - Send notifications
  - Create content

**C. Real-time Monitoring:**
- Live activity feed
- AI agent task logs
- Error tracking (Sentry integration)
- API usage and costs
- System health indicators

**Acceptance Criteria:**
- Dashboard loads in < 3 seconds
- All metrics are accurate
- AI recommendations are actionable
- Anomalies are detected within 5 minutes
- Export reports as PDF/Excel

#### 7.2 User Management

**Features:**
- User search and filtering
- Profile editing
- Points granting/adjustment
- Account suspension/unsuspension
- Login history viewing
- Impersonation for support (with audit log)
- Bulk actions (email, notifications)

#### 7.3 Content Management

**Features:**
- Product CRUD operations
- Course management (lessons, quizzes)
- Community post moderation queue
- Review approval/rejection
- Campaign creation and scheduling
- Announcement system
- SEO meta tag editing

#### 7.4 Financial Management

**Features:**
- Transaction history
- Revenue analytics
- Refund processing
- Mentor payout management
- Tax report generation
- Fraud detection dashboard

#### 7.5 AI & System Settings

**Features:**
- AI provider switching (Google, OpenAI, etc.)
- Model selection (Gemini 2.5 Flash, Pro, etc.)
- API budget management
- Safety threshold configuration
- Fallback rules
- System-wide prompts editing
- Feature flags (enable/disable features)

**Acceptance Criteria:**
- All admin actions are logged
- Changes take effect immediately
- Permissions are role-based
- UI is efficient for bulk operations
- Data export works for all tables

---

## User Journeys

### Journey 1: New User Onboarding

**Entry Point:** Landing page discovery via social media or search

**Steps:**
1. **Landing Page:** User arrives and sees hero section explaining the concept
2. **Interest Trigger:** Sees compelling video or testimonial
3. **Sign Up:** Clicks "شروع سفر" (Start Journey)
4. **Authentication:** Chooses Google OAuth or phone number
5. **Welcome Tour:** Interactive walkthrough of key features (skippable)
6. **First Gift:** Prompted to claim free 100 Barkat points
7. **Profile Setup:** Basic information form (incentivized with bonus points)
8. **First Action Prompt:** Guided to either:
   - Plant first palm (with special discount)
   - Take personality test (free)
   - Explore AI tools (trial)
9. **First Achievement:** Earns "جوانه نخلستان" (Grove Sprout) badge
10. **Retention Hook:** Daily mystery chest notification next day

**Success Metrics:**
- 60%+ complete signup after starting
- 40%+ complete profile setup
- 25%+ take first paid action within 7 days
- 50%+ return within 48 hours

### Journey 2: Palm Planting & Gift

**Entry Point:** User wants to commemorate a special event

**Steps:**
1. **Browse Palms:** Views catalog with filters (occasion, price)
2. **Learn:** Reads about cultural significance and impact
3. **Select:** Chooses "نخل یادبود" (Memorial Palm)
4. **Personalize:** Fills deed form:
   - Intention: "To honor my grandmother's memory"
   - Recipient: Her name
   - Message: Personal tribute
   - Grove keeper selection
5. **Review:** Sees cart with pricing and impact summary
6. **Payment Options:** Chooses 6 installments (qualified via points)
7. **Checkout:** Completes ZarinPal payment
8. **Confirmation:** Receives immediate confirmation with:
   - Order number
   - Certificate preview
   - Expected planting date
   - Points earned (44,500 Barkat)
9. **Certificate Delivery:** Within 24 hours, certificate is available
10. **Social Share:** Prompted to share on social media (AI-generated post)
11. **First Update:** 2 weeks later, receives photo of planted palm
12. **Ongoing:** Quarterly updates with growth photos

**Success Metrics:**
- 70%+ complete purchase after personalizing
- 85%+ payment success rate
- 40%+ share certificate on social media
- 90%+ satisfaction rating

### Journey 3: Course Learning & Skill Development

**Entry Point:** User wants to learn AI skills

**Steps:**
1. **Discovery:** Finds AI Academy via homepage or search
2. **Curriculum Review:** Reviews syllabus and learning outcomes
3. **Pricing Decision:** Chooses self-paced vs. mentorship track
4. **Purchase:** Completes checkout (can use points for 10% discount)
5. **Enrollment:** Immediately gains access to Module 1
6. **Lesson 1:** Watches video, takes notes, completes exercise
7. **Progress Tracking:** Sees 5% completion indicator
8. **Quiz:** Takes module quiz (must score 80%+ to advance)
9. **Community:** Joins course discussion group
10. **Project:** Builds final project (e.g., custom ChatGPT)
11. **Submission:** Uploads project for mentor review (if applicable)
12. **Completion:** Receives certificate after finishing all modules
13. **Reward:** Earns 5,000 Barkat points and "AI Apprentice" badge
14. **Upsell:** Prompted to enroll in next level course

**Success Metrics:**
- 70%+ complete Module 1 within 3 days
- 50%+ complete entire course within 60 days
- 4.5+ star average rating
- 30%+ enroll in follow-up course

### Journey 4: AI Tool Usage (Content Creation)

**Entry Point:** User needs to create a LinkedIn article

**Steps:**
1. **Tool Discovery:** Clicks "خلوت آفرینش" (Creation Studio) in header
2. **Tool Grid:** Browses available tools
3. **Selection:** Chooses "Article Alchemist"
4. **Access Check:** 
   - Has free trial (3 uses remaining) OR
   - Needs to unlock (costs 500 Mana points)
5. **Input:** Pastes YouTube video link about AI trends
6. **Configuration:**
   - Language: Farsi
   - Length: 2000 words
   - Tone: Professional
   - SEO keywords: هوش مصنوعی, آینده کار
7. **Processing:** AI analyzes video and generates article (30 sec)
8. **Review:** Reads generated article with formatting
9. **Refinement:** Asks AI to add more examples
10. **Export:** Downloads as:
    - Markdown
    - Word document
    - Direct share to LinkedIn (via API)
11. **Feedback:** Rates output (5 stars)
12. **Usage Tracking:** 2 free uses remaining

**Success Metrics:**
- 80%+ complete generation after starting
- 4.2+ star average quality rating
- 60%+ use refine feature
- 45%+ export/share content
- 35%+ return to use tool again within 7 days

---

## Success Metrics & KPIs

### North Star Metric
**Meaningful Actions Taken** - Defined as:
- Palm planted
- Course module completed
- AI tool used productively
- Community contribution made
- Mentorship session attended

Target: 10,000 meaningful actions per month by end of Year 1

### Primary KPIs

**Acquisition:**
- Website visitors: 50,000/month (Year 1)
- Sign-up rate: 5% (2,500 new users/month)
- Acquisition cost (CAC): < 100,000 IRR
- Organic vs. paid split: 60/40

**Activation:**
- Onboarding completion: 60%+
- Time to first value: < 10 minutes
- First meaningful action within 24h: 40%+

**Engagement:**
- Daily Active Users (DAU): 15%+ of total users
- Monthly Active Users (MAU): 60%+ of total users
- Average session duration: 12+ minutes
- Sessions per week: 3+ per active user

**Retention:**
- D7 retention: 40%+
- D30 retention: 25%+
- D90 retention: 15%+
- Churn rate: < 10%/month

**Revenue:**
- Monthly Recurring Revenue (MRR): 50M IRR (Year 1)
- Average Revenue Per User (ARPU): 500K IRR/year
- Customer Lifetime Value (LTV): 2M IRR
- LTV:CAC ratio: > 3:1
- Revenue by category:
  - Heritage (palms): 50%
  - Education (courses): 30%
  - Tools & subscriptions: 15%
  - Physical products: 5%

**Referral:**
- Viral coefficient: > 0.3
- NPS score: > 50
- Social shares per user: 2+ per month

**Impact:**
- Palms planted: 2,000+ (Year 1)
- Jobs created: 50+ full-time equivalent
- CO2 absorbed: 40+ tons (Year 1)
- User satisfaction: 4.5+ stars

### Secondary KPIs

**Community Health:**
- Posts per week: 200+
- Engagement rate: 15%+ (likes/comments per post)
- Mentor sessions booked: 100+ per month
- Project funding success rate: 60%+

**AI Performance:**
- Tool usage per user: 5+ per month
- AI generation success rate: 95%+
- Content quality rating: 4.3+ stars
- Prompt engineering improvement: Tracked via version

**Education:**
- Course enrollment: 500+ students (Year 1)
- Course completion rate: 50%+
- Student satisfaction: 4.5+ stars
- Knowledge gain (pre/post test): 30%+ improvement

**Technical:**
- Page load time: < 2 seconds
- Uptime: 99.9%+
- Error rate: < 0.1%
- API cost per user: < 5,000 IRR/month

---

## Roadmap

### Phase 1: Foundation (COMPLETED - Current State)
**Status:** ✅ Live in Production

**Achievements:**
- ✅ Core React SPA with routing and state management
- ✅ Supabase authentication (Google, Phone)
- ✅ Database schema and models
- ✅ Palm selection and deed personalization
- ✅ E-commerce with cart and checkout
- ✅ ZarinPal payment integration (sandbox tested)
- ✅ Points and gamification system
- ✅ Digital certificate generation
- ✅ Community posting system
- ✅ Admin dashboard (basic)
- ✅ 15+ AI tools integrated (Gemini API)
- ✅ Course infrastructure
- ✅ PWA setup (installable, offline-capable)
- ✅ Mobile responsive design
- ✅ SEO optimization (meta tags, sitemap)

### Phase 2: Launch & Stabilization (Current - Next 4 Weeks)
**Status:** 🚧 In Progress

**Goals:**
- Onboard first 1,000 real users
- Process first 100 palm plantings
- Achieve product-market fit validation
- Stabilize infrastructure under real load

**Key Initiatives:**

**Week 1-2: Production Hardening**
- ✅ Migrate mock data to real Supabase queries
- ✅ Deploy API proxy for Gemini key security
- ✅ Complete ZarinPal webhook implementation
- ⏳ Load testing and performance optimization
- ⏳ Error tracking and monitoring (Sentry setup)
- ⏳ Backup and disaster recovery procedures

**Week 3-4: Go-to-Market**
- ⏳ Launch marketing campaign
  - Social media presence (Instagram, LinkedIn, Twitter)
  - Content marketing (blog posts, videos)
  - Influencer partnerships
  - PR outreach
- ⏳ Early adopter program (50 beta users)
  - Special pricing
  - Direct feedback channel
  - Co-creation opportunities
- ⏳ Coordinate first batch of real palm plantings
- ⏳ Set up customer support system (WhatsApp, email)

**Success Criteria:**
- 1,000 registered users
- 100 palm plantings completed
- 50 course enrollments
- $20K+ revenue
- 4.0+ star user satisfaction
- < 5% critical bug rate

### Phase 3: Growth & Optimization (Month 2-4)
**Status:** 📅 Planned

**Goals:**
- Scale to 10,000 users
- Expand product catalog
- Improve retention and engagement
- Build sustainable growth engine

**Key Initiatives:**

**Product Enhancements:**
- ⏳ Mobile app (React Native)
- ⏳ Advanced AI personalization
- ⏳ Live video sessions infrastructure
- ⏳ Mentorship marketplace v2
- ⏳ Microfinance loan processing
- ⏳ Subscription management system
- ⏳ Referral program with rewards
- ⏳ Affiliate program for creators

**Content & Community:**
- ⏳ Launch 5 complete courses
- ⏳ Weekly live Q&A sessions
- ⏳ User-generated content campaigns
- ⏳ Community moderation team
- ⏳ Ambassador program

**Marketing & Growth:**
- ⏳ SEO content strategy (50+ articles)
- ⏳ Paid advertising campaigns (Google, Meta)
- ⏳ Email marketing automation
- ⏳ Retargeting and remarketing
- ⏳ Partnership with NGOs and corporations

**Operations:**
- ⏳ Grove operations scaling (hire 5 grove keepers)
- ⏳ Physical product supply chain
- ⏳ Customer support team (3 agents)
- ⏳ Financial ops (accounting, taxes)

**Success Criteria:**
- 10,000 total users (5,000 MAU)
- 1,000 palms planted
- 500 course completions
- $100K+ revenue
- 40%+ Month-2 retention
- Break-even on marketing spend

### Phase 4: Scale & Diversification (Month 5-12)
**Status:** 📅 Planned

**Goals:**
- Reach 50,000 users
- Expand to international markets (diaspora)
- Launch B2B offerings
- Achieve profitability

**Key Initiatives:**

**Product:**
- ⏳ English language version of platform
- ⏳ Advanced AI agents (autonomous assistants)
- ⏳ API for third-party integrations
- ⏳ White-label solutions for organizations
- ⏳ Physical grove experiences (tours, events)
- ⏳ Blockchain-based certificates (NFTs)

**Expansion:**
- ⏳ International payment gateways (Stripe)
- ⏳ Multi-currency support
- ⏳ Regional grove locations (Tehran, Isfahan, Shiraz)
- ⏳ Partnership with universities for courses

**B2B Offerings:**
- ⏳ Corporate CSR packages
- ⏳ Team building workshops
- ⏳ Enterprise AI tool subscriptions
- ⏳ Bulk course licensing

**Fundraising:**
- ⏳ Seed round ($500K-$1M)
- ⏳ Pitch deck and financial model
- ⏳ Investor relations

**Success Criteria:**
- 50,000 total users (20,000 MAU)
- 5,000 palms planted
- $500K+ annual revenue
- Positive unit economics
- 10+ corporate clients
- 25%+ Month-6 retention

### Phase 5: Ecosystem & Impact (Year 2+)
**Status:** 🔮 Vision

**Goals:**
- Become the leading platform for meaning-driven living in Persian-speaking world
- 100,000+ users creating lasting impact
- Self-sustaining grove network
- International recognition

**Visionary Features:**
- AI-powered life operating system
- Virtual reality grove experiences
- Global meaning summit (annual event)
- Manapalm Foundation (non-profit arm)
- Book publishing arm (member stories)
- Documentary series production
- Academic research partnerships

---

## Technical Requirements

### Performance

**Page Load:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

**API Response:**
- Database queries: < 200ms (p95)
- Gemini API calls: < 30s (content generation)
- Image generation: < 60s
- Payment processing: < 10s

**Scalability:**
- Support 10,000 concurrent users
- Handle 100 transactions per minute
- Process 1,000 AI generations per hour
- Store 1TB+ media files (Cloudinary)

### Browser & Device Support

**Desktop Browsers:**
- Chrome 90+ (primary)
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Browsers:**
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**Responsive Breakpoints:**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+
- Wide: 1440px+

**PWA Requirements:**
- Installable on all supported devices
- Offline access to key features
- Push notifications
- Add to home screen prompts

### Accessibility

**WCAG 2.1 Level AA:**
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast (4.5:1 minimum)
- Alt text for all images
- ARIA labels where appropriate
- Focus indicators visible

**Internationalization:**
- RTL (Right-to-Left) support for Farsi
- Unicode support for Persian characters
- Date/time localization
- Currency formatting (IRR)
- Number formatting (Persian numerals option)

### Security

**Authentication:**
- OAuth 2.0 (Google)
- SMS OTP verification (phone auth)
- Session tokens (JWT)
- HTTPS enforcement
- CSRF protection
- Rate limiting on login attempts

**Data Protection:**
- Database encryption at rest
- Sensitive data hashing (passwords via Supabase)
- API keys in environment variables only
- Secure payment tokenization (ZarinPal)
- GDPR compliance (user data export/delete)

**Content Security:**
- AI output moderation
- User-generated content filtering
- XSS attack prevention
- SQL injection protection (parameterized queries)
- File upload validation and sanitization

### Monitoring & Observability

**Error Tracking:**
- Sentry integration for frontend errors
- Backend error logs (Supabase logs)
- User session replay for debugging

**Analytics:**
- User behavior tracking
- Conversion funnel analysis
- A/B test framework
- Custom event tracking
- Retention cohort analysis

**Infrastructure:**
- Uptime monitoring (99.9% target)
- API latency tracking
- Database performance metrics
- Cost monitoring (Gemini API usage)
- Alert system for critical failures

### Third-Party Integrations

**Current:**
- Supabase (database, auth, storage)
- Google Gemini API (AI content generation)
- Google Imagen (AI image generation)
- Cloudinary (media CDN)
- ZarinPal (payment gateway)
- SMS.ir (SMS OTP and notifications)
- Vercel (hosting)

**Planned:**
- Sentry (error tracking)
- Google Analytics 4
- Hotjar (user behavior)
- Mailchimp/SendGrid (email marketing)
- Calendly (scheduling)
- Zoom API (video calls)
- Stripe (international payments)

---

## Risk Analysis & Mitigation

### Technical Risks

**Risk 1: AI API Costs Spiral**
- **Impact:** High
- **Likelihood:** Medium
- **Mitigation:**
  - Implement strict rate limiting
  - Cache AI responses where possible
  - Set daily budget caps
  - Monitor usage dashboards
  - Provide AI access tiers (free/premium)
  - Fallback to cheaper models when possible

**Risk 2: Payment Gateway Downtime**
- **Impact:** Critical
- **Likelihood:** Low
- **Mitigation:**
  - Multiple payment provider integration
  - Clear user communication during outages
  - Order queuing system
  - 24-hour support for payment issues

**Risk 3: Database Performance Degradation**
- **Impact:** High
- **Likelihood:** Medium
- **Mitigation:**
  - Query optimization and indexing
  - Database connection pooling
  - Read replicas for scaling
  - Regular performance audits
  - Caching layer (Redis if needed)

**Risk 4: Security Breach**
- **Impact:** Critical
- **Likelihood:** Low
- **Mitigation:**
  - Regular security audits
  - Penetration testing
  - Bug bounty program
  - Compliance certifications
  - Incident response plan

### Business Risks

**Risk 5: Low User Acquisition**
- **Impact:** Critical
- **Likelihood:** Medium
- **Mitigation:**
  - Diverse marketing channels
  - Referral incentives
  - Free trial offerings
  - PR and content marketing
  - Partnership strategies

**Risk 6: Poor Unit Economics**
- **Impact:** High
- **Likelihood:** Medium
- **Mitigation:**
  - Detailed financial modeling
  - Regular cohort analysis
  - Pricing experiments
  - Cost reduction initiatives
  - Premium tier expansions

**Risk 7: Grove Operations Fail**
- **Impact:** Critical
- **Likelihood:** Low
- **Mitigation:**
  - Partner with established nurseries
  - Contracts with SLAs
  - Multiple grove locations
  - Regular audits and photos
  - Insurance for plantings

**Risk 8: Competition**
- **Impact:** Medium
- **Likelihood:** High
- **Mitigation:**
  - Unique positioning (heritage + AI)
  - Strong community building
  - Continuous innovation
  - Brand loyalty programs
  - First-mover advantages

### Operational Risks

**Risk 9: Content Moderation Overload**
- **Impact:** Medium
- **Likelihood:** High
- **Mitigation:**
  - AI-powered pre-moderation
  - Community reporting system
  - Clear guidelines
  - Moderation team scaling
  - User reputation system

**Risk 10: Customer Support Overwhelm**
- **Impact:** Medium
- **Likelihood:** High
- **Mitigation:**
  - Comprehensive FAQ and docs
  - AI chatbot for common questions
  - Support ticket system
  - Response time SLAs
  - Escalation procedures

### Legal & Compliance Risks

**Risk 11: Data Privacy Violations**
- **Impact:** Critical
- **Likelihood:** Low
- **Mitigation:**
  - Legal counsel consultation
  - Privacy policy clarity
  - User consent mechanisms
  - Data minimization practices
  - GDPR/Iranian data law compliance

**Risk 12: Payment Regulatory Issues**
- **Impact:** High
- **Likelihood:** Medium
- **Mitigation:**
  - Proper business licensing
  - Tax compliance
  - Financial audits
  - Transparent record-keeping
  - Legal payment processor relationships

---

## Appendices

### A. Glossary of Persian Terms

- **نخلستان معنا (Nakhlestan-e Mana):** Garden of Meaning - The platform name
- **برکت (Barkat):** Blessing points - Primary currency
- **مانا (Mana):** Mana points - Premium currency
- **کار نیک (Kar-e Nik):** Good deed - Actions that earn points
- **خلوت آفرینش (Khalvat-e Afarinesh):** Creation Sanctuary - AI tools section
- **نگهبان نخلستان (Negahban-e Nakhlestan):** Grove Keeper - Caretaker role
- **سند نخل (Sanad-e Nakhl):** Palm Certificate - Digital certificate
- **سفر قهرمانی (Safar-e Ghahremani):** Hero's Journey - Onboarding path
- **همراه معنا (Hamrah-e Mana):** Meaning Companion - AI assistant
- **آینه رفتار (Ayne-ye Raftar):** Behavior Mirror - Personality tests
- **صندوق رویش (Sanduq-e Ruye):** Growth Fund - Microfinance feature

### B. User Personas (Detailed)

**Persona 1: Sara - The Meaning Seeker**
- Age: 32
- Location: Tehran
- Occupation: Marketing Manager
- Income: 50M IRR/month
- Tech Savviness: High
- Personality: INFP, Enneagram Type 4
- Pain Points:
  - Feels stuck in corporate routine
  - Disconnected from cultural roots
  - Searching for deeper purpose
- Goals:
  - Find meaningful work
  - Connect with like-minded people
  - Create lasting legacy
- Manapalm Usage:
  - Plants "نخل معنا" for her grandmother's memory
  - Takes Ikigai test to discover life purpose
  - Enrolls in Life Mastery Academy
  - Uses AI companion for daily reflection
  - Actively participates in community discussions
- Preferred Features: Personality tests, AI coaching, community
- Lifetime Value: 15M IRR (high engagement, multiple courses)

**Persona 2: Amir - The Digital Entrepreneur**
- Age: 28
- Location: Mashhad
- Occupation: Freelance designer & content creator
- Income: 30M IRR/month (variable)
- Tech Savviness: Expert
- Personality: ENTP, Enneagram Type 3
- Pain Points:
  - Needs to learn AI to stay competitive
  - Wants to scale beyond hourly work
  - Struggles with consistent client pipeline
- Goals:
  - Master AI tools for content production
  - Build passive income streams
  - Grow personal brand
- Manapalm Usage:
  - Enrolls in AI Academy
  - Heavily uses content generation tools (Article Alchemist, Social Media Manager)
  - Attends business mentorship sessions
  - Creates courses to sell (future feature)
  - Refers other creators (affiliate potential)
- Preferred Features: AI tools, courses, mentorship
- Lifetime Value: 20M IRR (power user, tool subscriptions)

**Persona 3: Dr. Rezaei - The Cultural Patron**
- Age: 52
- Location: Isfahan
- Occupation: University Professor
- Income: 80M IRR/month
- Tech Savviness: Medium
- Personality: ISTJ, Enneagram Type 1
- Pain Points:
  - Concerned about cultural erosion
  - Wants to contribute to society
  - Limited time for hands-on volunteering
- Goals:
  - Preserve Iranian heritage
  - Support education for underprivileged
  - Leave meaningful legacy
- Manapalm Usage:
  - Plants multiple "نخل ایران" palms
  - Gifts palms to students who graduate
  - Invests in microfinance projects
  - Occasional use of English Academy (modest interest)
  - Donates points to community causes
- Preferred Features: Heritage palms, gifting, microfinance
- Lifetime Value: 50M IRR (high-value transactions)

### C. Competitive Analysis

**Direct Competitors:**

1. **کارما (Karma) - Iranian Social Impact Platform**
   - Focus: Volunteer matching and NGO donations
   - Strengths: Established brand, NGO partnerships
   - Weaknesses: No educational content, limited gamification
   - Differentiation: Manapalm offers AI tools and courses

2. **دانشیار (Daneshyar) - Online Education**
   - Focus: Technical courses (programming, design)
   - Strengths: Large course library, quality instructors
   - Weaknesses: No social impact angle, no AI integration
   - Differentiation: Manapalm combines learning with meaning

**Indirect Competitors:**

3. **Faradars - Online Courses**
   - Focus: Technical education
   - Strengths: High-quality video production
   - Weaknesses: Traditional course format, expensive
   - Differentiation: Manapalm has AI-personalized learning

4. **Digikala - E-Commerce**
   - Focus: General online shopping
   - Strengths: Market leader, fast delivery
   - Weaknesses: No social impact narrative
   - Differentiation: Manapalm products have meaning and impact

5. **Fidibo - Digital Content Marketplace**
   - Focus: E-books and audiobooks
   - Strengths: Large content library
   - Weaknesses: Pure content consumption, no community
   - Differentiation: Manapalm enables creation and connection

**International Inspiration:**

6. **MasterClass - Premium Education**
   - Lesson: High-quality production, celebrity instructors
   - Adaptation: Persian influencers and thought leaders

7. **Duolingo - Gamified Learning**
   - Lesson: Points, streaks, and engagement loops
   - Adaptation: Applied to our entire platform, not just language

8. **Notion - Life Operating System**
   - Lesson: Flexible, user-empowering tools
   - Adaptation: AI tools customized to user needs

**Competitive Advantages:**
- **Unique Positioning:** Only platform combining heritage + AI + education
- **Cultural Resonance:** Palm tree symbolism deeply rooted in Persian culture
- **AI Edge:** Cutting-edge Gemini integration for powerful tools
- **Community:** Not just transactional, but transformational
- **Impact:** Clear environmental and social outcomes

### D. Marketing & Growth Strategies

**Content Marketing:**
- Blog: 2-3 articles per week on meaning, AI, personal growth
- YouTube: Weekly videos (tutorials, stories, behind-the-scenes)
- Podcast: "گفتگوهای معنادار" (Meaningful Conversations) with guests
- Social Media: Daily posts on Instagram, LinkedIn, Twitter
- SEO: Target keywords like "کاشت درخت آنلاین", "دوره هوش مصنوعی", "کشف معنای زندگی"

**Paid Advertising:**
- Google Ads: Search campaigns for high-intent keywords
- Instagram/Facebook Ads: Story ads, carousel ads for courses
- LinkedIn Ads: Targeting professionals for business courses
- YouTube Ads: Pre-roll on related content

**Partnerships:**
- NGOs: Co-branded campaigns for environmental causes
- Universities: Student discounts, curriculum integration
- Corporations: CSR programs, team building events
- Influencers: Affiliate partnerships with content creators
- Media: Guest articles, podcast appearances, interviews

**Community Building:**
- Weekly live sessions with founders
- User spotlights and success stories
- Ambassador program (super users)
- Local meetups and events (post-COVID)
- Online challenges and competitions

**Referral Program:**
- Give 500 Barkat points for each referred user who signs up
- Receive 10% of friend's first purchase as points
- Special rewards at milestones (5, 10, 25 referrals)
- Leaderboard for top referrers

**Lifecycle Marketing:**
- Welcome email series (Days 0, 1, 3, 7)
- Onboarding push notifications
- Re-engagement campaigns for inactive users
- Win-back campaigns for churned users
- Upsell emails for course completions

**PR Strategy:**
- Launch press release to major Iranian tech media
- Pitch founder story (social entrepreneurship angle)
- Environmental impact reporting (annual)
- User success stories for case studies
- Awards and recognition submissions

### E. Financial Projections (Year 1)

**Revenue Streams:**
- Palm Sales: 500M IRR (50%)
- Course Sales: 300M IRR (30%)
- AI Tool Subscriptions: 100M IRR (10%)
- Physical Products: 50M IRR (5%)
- Mentorship Commissions: 30M IRR (3%)
- B2B Partnerships: 20M IRR (2%)
- **Total Year 1 Revenue: 1,000M IRR ($125K USD equivalent)**

**Cost Structure:**
- Grove Operations: 200M IRR (20%)
- AI API Costs: 100M IRR (10%)
- Marketing & Acquisition: 250M IRR (25%)
- Team Salaries: 300M IRR (30%)
- Infrastructure (Hosting, Tools): 50M IRR (5%)
- Operations & Admin: 100M IRR (10%)
- **Total Year 1 Costs: 1,000M IRR**

**Break-Even:** Month 9 (projected)

**Year 2 Projection:**
- Revenue: 5,000M IRR (5x growth)
- Profit Margin: 20%
- Team Size: 20 people

**Funding Needs:**
- Bootstrap Phase: Current (using founder savings + revenue)
- Seed Round: Month 6-9 ($250K-$500K)
- Series A: Year 2 ($2M-$5M) if hyper-growth trajectory

### F. Technical Documentation Links

(For Development Team Reference)

- **Database Schema:** `supabase_schema.sql`
- **SMS Integration:** `docs/SMS_INTEGRATION.md` ✅
- **API Documentation:** `docs/API.md` (to be created)
- **Component Library:** `docs/COMPONENTS.md` (to be created)
- **Deployment Guide:** `docs/DEPLOYMENT.md` (to be created)
- **Contribution Guidelines:** `CONTRIBUTING.md`
- **Changelog:** `CHANGELOG.md`
- **Roadmap:** `ROADMAP.md`

---

## Document Control

**Prepared by:** Pochi AI Assistant (based on comprehensive project analysis)  
**Reviewed by:** Product Team  
**Approved by:** [Pending]  
**Version History:**
- v1.1 - December 27, 2025 - Technical Stack Update (Next.js, SMS.ir)
- v1.0 - December 9, 2025 - Initial PRD Creation

**Distribution:**
- Product Team
- Engineering Team
- Design Team
- Marketing Team
- Investors (selected sections)

**Next Review Date:** January 9, 2026 (Monthly review cycle)

---

## Conclusion

Manapalm represents a unique convergence of cultural heritage, personal development, cutting-edge AI technology, and social impact. By enabling users to plant palm trees as symbols of meaning while providing them with world-class educational and AI-powered tools, we are building more than a platform—we are cultivating a movement.

This PRD serves as the North Star for our product development, ensuring that every feature we build, every line of code we write, and every user interaction we design contributes to our ultimate mission: **helping people discover, cultivate, and share meaning in their lives while creating lasting positive impact on the world.**

The foundation is strong, the vision is clear, and the opportunity is vast. Now begins the journey of transforming this vision into reality, one palm tree—and one meaningful action—at a time.

**🌴 نخلستان معنا - جایی که معنا می‌روید (Where Meaning Grows)**

---

*End of Product Requirements Document*
