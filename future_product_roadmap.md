# VersaCRM: Strategic Future Product Roadmap

This document outlines the strategic vision for VersaCRM, building upon our completed foundational platform. It serves as the single source of truth for our development priorities.

---

## In Progress (Phase 12)

### Pillar 6 - Onboarding & Guidance 2.0
-   [ ] **Interactive Guided Tours for Users:** Role-based product tours providing step-by-step walkthroughs for Admins (configuration) and Team Members (daily workflow).

---

## Next Up

### Pillar 6 - Onboarding & Guidance 2.0
-   [ ] **Personalized, Habit-Forming AI Tips Engine:** A toggleable AI tips engine that learns from each user's habits and proactively suggests workflow improvements (e.g., "You frequently filter by 'Status is Lead'. Would you like to save this as a reusable 'Audience Profile'?").

### Pillar 7 - Platform Optimization & Scalability
-   [ ] **API Call Optimization:** Implement a smart caching strategy by configuring appropriate `staleTime` for different data types within React Query to significantly reduce unnecessary API calls.
-   [ ] **Real-time Data Sync with WebSockets:** For high-frequency data like notifications and chat, investigate and implement a WebSocket-based push system to replace polling, ensuring instant updates and lower server load.

---

## Completed Features

### Pillar 1 - The Collaborative Hub
-   [x] **Internal Team Chat:** A full, Slack-like chat experience within the CRM, including channels, @mentions, and threaded replies.
-   [x] **Contextual Chat Channels:** Ability to link a chat channel to a specific record (Deal, Project) to keep all communication in context.
-   [x] **@Mention Notifications:** @mentions in chat trigger global notifications for the mentioned user.

### Pillar 2 - The Intelligence Layer 2.0
-   [x] **Conversational BI (Business Intelligence):** Enhanced AI Co-pilot that can understand natural language queries about data and generate charts/tables on the fly.
-   [x] **Automated Data Hygiene:** A centralized "Data Health" center that automatically runs AI analysis to find duplicates and formatting errors, with one-click fixes.
-   [x] **Vertical-Specific AI Models:** Fine-tuned AI models for each industry vertical (Health, Finance, etc.) that understand specific terminology and provide more relevant, persona-aware suggestions and insights across all AI features.

### Pillar 3 - The Commerce & Billing Engine
-   [x] **Subscription Management:** Ability to create and manage recurring subscription plans.
-   [x] **Payment Gateway Integration:** Connect a Stripe account to accept payments directly through the Client Portal.
-   [x] **CPQ (Configure, Price, Quote) Engine:** Support for creating configurable products, product bundles, and dynamic, rule-based pricing, all integrated into the Document Builder for interactive quoting.
-   [x] **Revenue Recognition:** Tools to create and manage revenue recognition schedules for "Won" deals to properly account for revenue over time.

### Pillar 4 - Verticalization 2.0
-   [x] **Financial Services Cloud:**
    -   [x] **Compliance Center:** A centralized dashboard for monitoring KYC/AML status.
    -   [x] **Relationship Mapping:** A visual, node-based tool for mapping complex client relationships.

### Pillar 5 - Mobile Experience 2.0
-   [x] **Mobile-Optimized Dashboard:** A streamlined, single-column dashboard tailored for mobile devices, focusing on daily agenda and urgent tasks.
-   [x] **Offline Mode & Sync:** Ability to view cached data (Contacts, Calendar) and create notes while offline, with automatic syncing upon reconnection.
-   [x] **Push Notifications:** Integrate with native mobile OS to send real-time alerts for high-priority events (e.g., @mentions, critical deal updates).

### Pillar 6 - Onboarding & Guidance 2.0
-   [x] **AI-Powered "5-Minute CRM":** An intelligent onboarding interview that asks about the user's business, sales process, and marketing goals, allowing the AI to automatically configure deal stages, custom fields, and a starter lead-nurturing campaign.
-   [x] **Proactive AI Feature Onboarding:** After the initial setup, the system will suggest a set of AI features to activate based on the user's answers, explaining the value of each one (e.g., "Since you have a sales team, we recommend activating AI Deal Forecasting.").

---
_This roadmap is a living document and will be updated as strategic priorities evolve._