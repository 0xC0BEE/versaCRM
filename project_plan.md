# VersaCRM: Strategic Project Plan

This document outlines the phased development plan for VersaCRM, a foundational, multi-tenant CRM application.

---

## Phase 1: Core CRM Foundation (Complete)

Build the essential, rock-solid foundation of the CRM.

-   [x] **User & Organization Management:** Multi-tenant organization structure, user roles, and permissions.
-   [x] **Contact Management:** A centralized place to store and manage contact information.
-   [x] **Deal Pipeline:** A visual, Kanban-style pipeline to track sales opportunities.
-   [x] **Task Management:** A simple to-do list for users.
-   [x] **Ticket System:** A basic helpdesk for managing customer support requests.
-   [x] **Industry Configuration:** Allow admins to select an industry to dynamically change terminology and custom fields.

---

## Phase 2: Platform Extensibility & Developer Tools (Complete)

Empower admins and developers to customize and integrate with the platform.

-   [x] **Custom Objects:** Allow organizations to define their own data objects (e.g., Properties, Cases, Projects) with custom fields.
-   [x] **API Key Management:** A settings page for admins to generate and revoke API keys for integrations.
-   [x] **API Documentation:** A browsable, in-app page explaining how to use the VersaCRM API.
-   [x] **App Marketplace:** A gallery of third-party apps that can be "installed" to extend functionality.
-   [x] **Sandbox Environments:** Create safe, isolated copies of the production environment for testing and training.

---

## Phase 3: Automation & Lead Generation (Complete)

Build the tools necessary to automate processes and capture new leads.

-   [x] **Workflow Automation:**
    -   [x] Simple, trigger-action based workflows (e.g., "When contact is created, create a task").
    -   [x] Advanced, visual workflow builder for multi-step logic.
-   [x] **Lead Scoring Engine:** Define rules to automatically score leads based on interactions and status.
-   [x] **Visual Form Builder:** Create public-facing forms to embed on websites for lead capture.
-   [x] **Landing Page Builder:** Create simple, public-facing landing pages that can host lead capture forms.
-   [x] **Website Activity Tracking:** A script to track anonymous visitor activity and stitch it to a contact record upon form submission.
-   [x] **Visual Campaign Journey Builder:** Advanced, node-based marketing automation for creating email sequences with branching logic.

---

## Phase 4: AI & Predictive Intelligence (Complete)

Integrate artificial intelligence to provide proactive insights and guidance.

-   [x] **"5-Minute CRM" AI Onboarding:** An AI wizard that asks about a user's business and automatically configures custom objects and sales pipelines.
-   [x] **AI Deal Forecasting:** Analyze open deals to predict win probability and surface key risk/success factors.
-   [x] **AI Churn Prediction:** Analyze active contacts to identify customers at risk of churning.
-   [x] **AI "Next Best Action":** For any contact, provide a single, actionable recommendation (e.g., "Call this lead," "Email this at-risk client") with one-click execution.
-   [x] **AI Content Studio:** An AI-powered modal for generating marketing copy for emails and landing pages.
-   [x] **Smart Search:** A natural language search modal that can answer questions, apply filters, or find knowledge base articles.
-   [x] **VoIP Integration & AI Call Summaries:** Enable click-to-call and use AI to summarize call logs.
-   [x] **Growth Co-pilot (Phase 1 - The Analyst):** An interactive AI on the dashboard that can answer natural language questions about CRM data by generating dynamic charts and lists from a static data snapshot.
-   [x] **Growth Co-pilot (Phase 2 - The Live Agent):** Enhance the co-pilot with **Function Calling**, allowing it to use "tools" to query the live CRM database for accurate, real-time answers.
-   [x] **Growth Co-pilot (Phase 3 - The Action Taker):** Extend function calling to include "write" actions (e.g., `createTask`), with a crucial user confirmation step before execution.
-   [x] **Growth Co-pilot (Phase 4 - The Conversationalist):** Implement a voice-activated "Live Conversation" mode using the Gemini Live API, allowing users to talk to their CRM.

**Phase Complete!** The Growth Co-pilot now functions as a multi-modal, action-oriented, and conversational assistant, fulfilling the core vision for this strategic feature.

---

## **Phase 5: Sales Enablement & Document Automation (Complete)**

**Goal:** Bridge the gap between a deal and a signed contract by building document generation tools directly into the CRM. This keeps users on the platform and professionalizes their sales output.

-   [x] **New "Documents" Hub & Template Builder:**
    -   [x] Create a new top-level page for managing document templates.
    -   [x] Build a simple, block-based editor for creating and styling templates.
-   [x] **Dynamic Data Engine:**
    -   [x] Implement a placeholder system (e.g., `{{contact.name}}`, `{{deal.value}}`) that can be used in templates.
    -   [x] When generating a document from a Deal, automatically populate all placeholders with live CRM data.
-   [x] **Line Item & Quoting Integration:**
    -   [x] Create a "Line Item Table" block for the template editor.
    -   [x] Allow users to add products directly from the Inventory module to a quote.
    -   [x] Automatically calculate quantities, subtotals, taxes, and grand totals.
-   [x] **AI Content Integration:**
    -   [x] Integrate the AI Content Studio into the document editor for text generation.
    -   [x] Integrate a new AI Image Studio for on-demand image creation.
-   [x] **"Generate Document" from Deal Record:**
    -   [x] Add a "Generate Document" button to the Deal detail view.
    -   [x] This button will launch a modal allowing the user to select a template, preview the final document, and download it.
-   [ ] **PDF Generation Service:**
    -   Implement a service that takes the final, populated HTML document and converts it into a professional, downloadable PDF. (Currently exports as HTML).