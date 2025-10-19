import React from 'react';
import { KBArticleType } from '../types'; // Assuming KBArticleType is in types

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="p-3 my-2 bg-gray-800 text-white rounded-md text-sm overflow-x-auto">
        <code>{children}</code>
    </pre>
);

export const kbArticles: KBArticleType[] = [
    // --- GENERAL ---
    {
        id: 'getting-started',
        title: 'Getting Started',
        category: 'General',
        content: (
            <>
                <h2 id="welcome">Welcome to VersaCRM</h2>
                <p>
                    VersaCRM is a powerful, all-in-one platform designed to manage your customer relationships, sales pipeline, marketing efforts, and support desk. Its key benefit is its adaptability—it can be tailored to fit the specific needs of various industries, from Healthcare to Finance and beyond. This guide will walk you through the initial setup and basic features to get you up and running.
                </p>

                <h3 id="first-steps">First Steps</h3>
                <ol>
                    <li>
                        <strong>AI-Powered Onboarding:</strong> If you're a new organization admin, you'll be greeted with the "5-Minute CRM" wizard. By answering a few questions about your business, our AI will automatically configure your deal stages and create relevant custom objects for you.
                    </li>
                    <li>
                        <strong>Invite Your Team:</strong> Navigate to <strong>Team</strong> from the sidebar to invite your team members. You can assign them specific roles to control what they can see and do.
                    </li>
                    <li>
                        <strong>Add a Contact:</strong> Go to the <strong>Contacts</strong> page and click the "New Contact" button. Fill in the details for your first contact to see how the industry-specific fields appear.
                    </li>
                    <li>
                        <strong>Explore the Dashboard:</strong> The Dashboard provides a high-level overview of your CRM data, including Key Performance Indicators (KPIs) and charts. It's the best place to start your day.
                    </li>
                </ol>
            </>
        ),
    },

    // --- CORE FEATURES ---
    {
        id: 'managing-contacts',
        title: 'Managing Contacts',
        category: 'Core Features',
        content: (
            <>
                <h2 id="overview">Overview</h2>
                <p>
                    Contacts are the heart of your CRM. This feature allows you to store, manage, and track all information related to your customers, patients, or clients. A well-maintained contact list is crucial for effective sales, marketing, and support.
                </p>
                <h3 id="how-to-use">How to Use It</h3>
                <ol>
                    <li>
                        <strong>View All Contacts:</strong> Navigate to the <strong>Contacts</strong> page from the main sidebar. You'll see a table of all your contacts.
                    </li>
                    <li>
                        <strong>Filter and Search:</strong> Use the "Add Filter" button at the top of the contacts table to narrow down your list based on specific criteria like status or lead source.
                    </li>
                    <li>
                        <strong>Create Audience Profiles:</strong> For complex filters you use often, create a reusable <strong>Audience Profile</strong>. Go to the "Audience Profiles" page, give your segment a name, and define your filter conditions. This saved profile can then be used as a target audience in your marketing campaigns.
                    </li>
                    <li>
                        <strong>View Contact Details:</strong> Click on any contact's name in the table to open their detailed 360-degree profile. Here you can see everything about them across various tabs.
                    </li>
                </ol>
            </>
        ),
    },
     {
        id: 'customer-journey',
        title: 'Customer Journey Visualizer',
        category: 'Core Features',
        content: (
            <>
                <h2 id="overview-journey">Overview</h2>
                <p>
                    The Customer Journey Visualizer provides the ultimate 360-degree view of a contact. It's a single, chronological timeline that displays every touchpoint a contact has had with your organization, from their very first anonymous website visit to their latest support ticket.
                </p>
                <h3 id="how-to-use-journey">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access the Journey:</strong> Open any contact's detail modal from the <strong>Contacts</strong> page.
                    </li>
                    <li>
                        <strong>Navigate to the Journey Tab:</strong> Click on the <strong>"Journey"</strong> tab.
                    </li>
                    <li>
                        <strong>Analyze the Timeline:</strong> You will see a vertical timeline of every event in the contact's history, sorted from most recent to oldest. Each event type has a unique icon and color, making it easy to distinguish between marketing, sales, and support interactions.
                    </li>
                </ol>
                <p className="mt-4">
                    This powerful view allows anyone in your organization to instantly understand the complete context of a customer's relationship with your company, leading to more informed and effective conversations.
                </p>
            </>
        ),
    },
    {
        id: 'deals-pipeline',
        title: 'Deals Pipeline',
        category: 'Core Features',
        content: (
            <>
                <h2 id="overview-deals">Overview</h2>
                <p>
                    The Deals Pipeline is a visual tool that helps you track potential sales opportunities from initiation to closure. It provides a clear overview of your sales process and helps your team stay focused on moving deals forward.
                </p>
                <h3 id="how-to-use-deals">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access the Pipeline:</strong> Click on <strong>Deals</strong> in the main sidebar.
                    </li>
                    <li>
                        <strong>Move Deals Between Stages:</strong> Simply click and drag a deal card from one column (stage) to another to update its status.
                    </li>
                    <li>
                        <strong>View Deal Details:</strong> Click on any deal card to open a modal where you can edit its details, update its value, or change its stage.
                    </li>
                     <li>
                        <strong>Generate Documents:</strong> From the Deal edit modal, you can click <strong>"Generate Document"</strong> to create a professional proposal or quote using a pre-defined template, automatically populated with this deal's information.
                    </li>
                    <li>
                        <strong>Create a Project (Post-Sale):</strong> When you drag a deal into a "Won" stage, you will be prompted to automatically create a new project from it. This seamlessly transitions the customer from the sales process to your delivery or onboarding workflow.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'team-chat',
        title: 'Team Chat',
        category: 'Core Features',
        content: (
            <>
                <h2 id="overview-chat">Overview</h2>
                <p>
                    Team Chat is a complete, Slack-like chat experience built directly into VersaCRM. It centralizes all internal communication, eliminating the need for a separate messaging tool and ensuring conversations about customers stay within the CRM.
                </p>
                <h3 id="how-to-use-chat">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access Team Chat:</strong> Click on the <strong>"Team Chat"</strong> icon in the main sidebar to open the chat interface.
                    </li>
                    <li>
                        <strong>Create Channels:</strong> Create public channels for team-wide discussions (e.g., `#sales`) or private channels for specific topics.
                    </li>
                    <li>
                        <strong>Use @mentions:</strong> Mention a team member (e.g., `@Alice Admin`) to send them a notification and bring their attention to a conversation.
                    </li>
                    <li>
                        <strong>Reply in Threads:</strong> Click "Reply" on any message to start a threaded conversation. This keeps the main channel clean and organized.
                    </li>
                </ol>
            </>
        )
    },
    {
        id: 'unified-inbox',
        title: 'Unified Inbox',
        category: 'Core Features',
        content: (
            <>
                <h2 id="overview-inbox">Overview</h2>
                <p>
                    The Unified Inbox is your central hub for all one-on-one customer communications across multiple channels. It consolidates conversations from Email, LinkedIn, and X (formerly Twitter) into a single, threaded view.
                </p>
                <h3 id="how-to-use-inbox">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access the Inbox:</strong> Click on the <strong>"Inbox"</strong> icon in the main sidebar.
                    </li>
                    <li>
                        <strong>View Conversations:</strong> The left panel lists all conversations, grouped by contact and channel. Click any conversation to view the full history.
                    </li>
                    <li>
                        <strong>Reply Directly:</strong> Use the reply box at the bottom of the conversation view to send a new message.
                    </li>
                    <li>
                        <strong>Use Productivity Tools:</strong> Speed up your replies by using <strong>Canned Responses</strong> for common questions or clicking <strong>"AI Suggestions"</strong> to let Gemini draft a reply for you based on the conversation context.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'tasks-and-calendar',
        title: 'Tasks & Calendar',
        category: 'Core Features',
        content: (
            <>
                <h2 id="overview-tasks">Overview</h2>
                <p>
                    Manage your to-do list and schedule with integrated Tasks and Calendar. This ensures you never miss a follow-up, meeting, or important deadline.
                </p>
            </>
        ),
    },
    {
        id: 'inventory-management',
        title: 'Inventory Management',
        category: 'Core Features',
        content: (
            <>
                <h2 id="overview-inventory">Overview</h2>
                <p>
                    The Inventory module allows you to track products, suppliers, and warehouses. This is essential for businesses that sell physical goods and need to manage stock levels and procurement.
                </p>
            </>
        ),
    },

    // --- SALES ENABLEMENT ---
    {
        id: 'document-generator',
        title: 'Document Generator & CPQ',
        category: 'Sales Enablement',
        content: (
            <>
                <h2 id="overview-docs">Overview</h2>
                <p>
                    The Document Generator is a powerful sales enablement tool that includes a full CPQ (Configure, Price, Quote) engine. It allows you to create professional, data-driven documents like quotes and proposals directly within VersaCRM.
                </p>
                <h3 id="how-to-use-docs">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Configure Products:</strong> In the <strong>Inventory</strong> section, you can now create complex products. Use the "Configuration" tab in the product editor to define product **options** (e.g., "Support Tier" with choices like "Standard" and "Premium") and create **bundles** of other products.
                    </li>
                    <li>
                        <strong>Set Pricing Rules:</strong> Use the "Pricing Rules" tab to set up volume-based discounts (e.g., "10% off if quantity is greater than 5").
                    </li>
                    <li>
                        <strong>Create a Template:</strong> Navigate to <strong>Documents</strong>. Build a new template using content blocks and dynamic placeholders.
                    </li>
                    <li>
                        <strong>Generate an Interactive Quote:</strong> From a Deal, click "Generate Document" and select your template. When you add a configurable product to the Line Items block, dropdowns for its options will appear. Selecting an option or changing the quantity will instantly recalculate the price, applying all rules automatically.
                    </li>
                </ol>
            </>
        ),
    },
    
    // --- AUTOMATION ---
    {
        id: 'workflow-automation',
        title: 'Workflow Automation',
        category: 'Automation',
        content: (
            <>
                <h2 id="overview-workflows">Overview</h2>
                <p>
                    Workflows are powerful automations that handle internal processes. The unified visual builder allows you to create everything from simple "if this, then that" automations to complex processes with multiple conditions and approval steps.
                </p>
                <h3 id="how-to-use-workflows">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access Workflows:</strong> Navigate to <strong>Workflows</strong> from the sidebar.
                    </li>
                    <li>
                        <strong>Build Your Workflow:</strong> Click "New Workflow" to open the visual canvas. Drag nodes from the Toolbox (left) onto the canvas and connect them to build your process.
                    </li>
                    <li>
                        <strong>Set the Trigger:</strong> The first node defines what event should start the workflow (e.g., "When a Deal Stage Changes").
                    </li>
                    <li>
                        <strong>Add Actions & Logic:</strong> Add actions like "Create a Task" or "Send an Email." Use "If/Then" nodes for branching logic and "Request Approval" nodes to create multi-step approval processes.
                    </li>
                    <li>
                        <strong>Get AI Suggestions:</strong> Use the "AI Process Optimization" tool in the toolbox to let Gemini analyze your CRM data for bottlenecks and suggest ready-to-use workflows.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'lead-scoring',
        title: 'AI Predictive Lead Scoring',
        category: 'Automation',
        content: (
            <>
                <h2 id="overview-scoring">Overview</h2>
                <p>
                    The AI-Powered Predictive Lead Scoring system replaces manual guesswork with data-driven insights. It analyzes your historical won and lost deals to automatically identify the key attributes of your best leads, helping your sales team prioritize their efforts.
                </p>
                <h3 id="how-to-use-scoring">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Train the AI Model:</strong> Go to <strong>Settings > Channels & Lead Gen</strong>. In the "AI-Powered Lead Scoring" section, click <strong>"Train Model"</strong>. The AI will analyze your sales history to build a predictive model.
                    </li>
                    <li>
                        <strong>Review Identified Factors:</strong> Once trained, the system will show you the top positive and negative factors it discovered (e.g., "Lead Source is Referral" is a positive factor).
                    </li>
                    <li>
                        <strong>Automatic Scoring:</strong> All new and existing contacts will be automatically scored based on this intelligent model. You can see the score on any contact's profile and in the main contacts table.
                    </li>
                    <li>
                        <strong>Recalculate Scores:</strong> You can click <strong>"Recalculate All Scores"</strong> at any time to re-score all contacts, which is useful after re-training the model or importing new data.
                    </li>
                </ol>
            </>
        ),
    },

    // --- ANALYTICS ---
    {
        id: 'custom-reports',
        title: 'Custom Reports & Snapshots',
        category: 'Analytics',
        content: (
            <>
                <h2 id="overview-reports">Overview</h2>
                <p>
                    The Custom Report Builder lets you create charts and tables from your CRM data. You can also create Data Snapshots to save a point-in-time copy of your data for historical analysis.
                </p>
                <h3 id="how-to-use-reports">How to Use Reports</h3>
                <ol>
                    <li>
                        <strong>Access Reports:</strong> Navigate to <strong>Reports</strong> from the sidebar.
                    </li>
                    <li>
                        <strong>Create a Custom Report:</strong> Configure your data source, columns, filters, and visualization type. The Live Preview updates in real-time.
                    </li>
                    <li>
                        <strong>Create a Snapshot:</strong> Click "Create Snapshot" to save a read-only copy of your current contacts or deals data, which can be viewed later for comparison.
                    </li>
                </ol>
            </>
        ),
    },
    
    // --- ADMINISTRATION ---
    {
        id: 'billing-and-commerce',
        title: 'Billing & Commerce',
        category: 'Administration',
        content: (
            <>
                <h2 id="overview-billing">Overview</h2>
                <p>
                    The Billing & Commerce settings allow you to manage subscription plans and connect to a payment gateway, enabling you to automate billing and accept payments through the Client Portal.
                </p>
                <h3 id="how-to-use-billing">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Set Up Plans:</strong> Go to <strong>Settings > Billing & Commerce</strong>. Create your recurring subscription plans (e.g., "Basic Plan - $49/month").
                    </li>
                    <li>
                        <strong>Connect a Gateway:</strong> In the same settings area, connect your Stripe account. This enables the "Pay Now" functionality in the Client Portal.
                    </li>
                    <li>
                        <strong>Subscribe a Contact:</strong> Open a contact's profile, go to the "Subscriptions" tab, and subscribe them to one of your plans.
                    </li>
                    <li>
                        <strong>Client Payments:</strong> Your clients can now log into their portal, view their active subscriptions under the "Billing" tab, and click "Pay Now" to complete a payment through a secure modal.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'data-health',
        title: 'Data Health Center',
        category: 'Administration',
        content: (
            <>
                <h2 id="overview-health">Overview</h2>
                <p>
                    The Data Health Center is a centralized hub that uses AI to proactively find and help you fix data quality issues, ensuring your CRM data remains clean, accurate, and reliable.
                </p>
                <h3 id="how-to-use-health">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access the Center:</strong> Navigate to <strong>Settings > Developer & Data > Data Health</strong>.
                    </li>
                    <li>
                        <strong>View Your Health Score:</strong> The dashboard provides an at-a-glance summary of your data quality, including a Health Score and counts of potential issues.
                    </li>
                    <li>
                        <strong>Review Duplicates:</strong> The system automatically groups potential duplicate contacts and products for your review.
                    </li>
                    <li>
                        <strong>Apply Formatting Fixes:</strong> Review a list of AI-suggested formatting corrections (e.g., "Capitalize name") and apply each fix with a single click.
                    </li>
                </ol>
            </>
        ),
    },

    // --- AI & PREDICTIVE INTELLIGENCE ---
    {
        id: 'conversational-bi',
        title: 'Conversational BI',
        category: 'AI & Predictive Intelligence',
        content: (
            <>
                <h2 id="overview-conv-bi">Overview</h2>
                <p>
                    Conversational Business Intelligence transforms the Growth Co-pilot into an on-demand data analyst. You can ask complex questions about your CRM data in plain English and get instant visualizations and summaries in response.
                </p>
                <h3 id="how-to-use-conv-bi">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Open the Co-pilot:</strong> On the Dashboard, use the Growth Co-pilot card.
                    </li>
                    <li>
                        <strong>Ask Analytical Questions:</strong> Type or speak questions like:
                        <ul>
                            <li className="!mt-2">"Show me our top 5 deals in the Proposal stage"</li>
                            <li className="!mt-2">"Chart the number of tickets by priority"</li>
                            <li className="!mt-2">"What is the total value of deals we won this month?"</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Get Instant Visualizations:</strong> The AI will query your data and generate a chart or table to visualize the answer directly within the chat interface, along with a written summary.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'vertical-ai',
        title: 'Vertical-Specific AI Models',
        category: 'AI & Predictive Intelligence',
        content: (
            <>
                <h2 id="overview-vertical-ai">Overview</h2>
                <p>
                    This feature makes all AI interactions in VersaCRM smarter and more relevant to your business. The AI automatically adopts the persona of an expert in your selected industry, understanding and using the correct terminology.
                </p>
                <h3 id="how-it-works">How It Works</h3>
                <p>
                    This feature works automatically based on the industry you select for your organization in <strong>Settings > Organization</strong>.
                </p>
                <ul>
                    <li className="!mt-2">
                        If you're in the **Health Cloud**, the AI will understand terms like "Patient," "Practitioner," and "Appointment."
                    </li>
                    <li className="!mt-2">
                        If you're in the **Finance Cloud**, it will talk about "Clients," "Advisors," and "Portfolios."
                    </li>
                </ul>
                <p className="mt-2">
                    This deeper context allows all AI features—from the Growth Co-pilot to Deal Forecasting—to provide more insightful and actionable recommendations that speak your language.
                </p>
            </>
        ),
    },
];