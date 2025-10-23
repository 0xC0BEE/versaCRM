import React from 'react';
import { KBArticleType } from '../types';

export const kbArticles: KBArticleType[] = [
    // --- Getting Started ---
    {
        id: 'getting-started',
        title: 'Getting Started with VersaCRM',
        category: 'Getting Started',
        content: (
            <>
                <h2>Welcome to VersaCRM!</h2>
                <p>This guide will walk you through the initial steps to get your CRM up and running. Our goal is to make this process as quick and intuitive as possible.</p>
                <h3>1. AI-Powered Onboarding</h3>
                <p>If you're an Organization Admin setting up a new account, you'll first be guided through the **AI Onboarding Wizard**. This powerful tool configures your CRM's terminology, custom fields, and sales pipeline based on a simple description of your business. This "5-Minute CRM" setup is the fastest way to get a tailored experience.</p>
                <h3>2. Navigating the Interface</h3>
                <p>The main interface is divided into two parts:</p>
                <ul>
                    <li><strong>The Sidebar:</strong> On the left, this is your main navigation. It gives you access to all the major hubs of the CRM like Dashboard, Contacts, Deals, and Settings.</li>
                    <li><strong>The Header:</strong> At the top, you can find the global Smart Search, your notifications, and your user profile menu for switching themes or logging out.</li>
                </ul>
                <h3>3. Exploring Your Dashboard</h3>
                <p>The Dashboard is your command center. Here you'll find key performance indicators (KPIs), charts, and AI-powered insights to give you a real-time overview of your business health. You can even customize the layout to suit your needs.</p>
            </>
        )
    },
    {
        id: 'dashboard-explained',
        title: 'Your Dashboard Explained',
        category: 'Getting Started',
        content: (
            <>
                <h2>Understanding Your Dashboard</h2>
                <p>The dashboard provides a high-level overview of your most important metrics and activities. It's composed of several widgets that you can customize.</p>
                <h3>Key Widgets</h3>
                <ul>
                    <li><strong>KPI Cards:</strong> These show your most important numbers at a glance, such as Total Contacts or New Leads this month.</li>
                    <li><strong>Charts:</strong> Visual representations of your data, like a pie chart of contacts by status or a bar chart of deals by stage.</li>
                    <li><strong>AI Growth Co-pilot:</strong> This is your conversational AI assistant. Ask it questions about your data in plain English (e.g., "Show me all deals over $10,000") and it will generate reports and charts for you.</li>
                </ul>
                <h3>Customization</h3>
                <p>Click the <strong>"Edit Layout"</strong> button to enter customization mode. You can drag to move widgets, resize them from the bottom-right corner, and add or remove them from your dashboard to create a view that's perfect for you.</p>
            </>
        )
    },

    // --- Core CRM ---
    {
        id: 'managing-contacts',
        title: 'Managing Contacts',
        category: 'Core CRM',
        content: (
            <>
                <h2>Working with Contacts</h2>
                <p>The Contacts page is where you'll manage all your customers, patients, or clients. The term used (e.g., "Patients") is automatically configured based on your industry.</p>
                <h3>Creating & Editing</h3>
                <p>Click the "New Contact" button to add someone to your CRM. To edit an existing contact, simply click on their name in the table to open the detailed view.</p>
                <h3>Filtering</h3>
                <p>Use the filter bar at the top of the table to narrow down your list. You can add multiple conditions to create precise segments of your audience.</p>
                <h3>AI Features for Contacts</h3>
                <ul>
                    <li><strong>AI Churn Risk:</strong> For active contacts, the AI can predict the likelihood of churn, helping you proactively retain customers. Toggle this view on the main contacts page.</li>
                    <li><strong>AI Data Hygiene:</strong> In Settings, you can run an AI analysis to find potential duplicates and formatting errors in your contact list.</li>
                </ul>
            </>
        )
    },
    {
        id: 'managing-deals',
        title: 'Managing Deals & Sales Pipeline',
        category: 'Core CRM',
        content: (
            <>
                <h2>Visualizing Your Sales Pipeline</h2>
                <p>The Deals page provides a Kanban-style board to visualize your sales process from start to finish.</p>
                <h3>Working with the Pipeline</h3>
                <ul>
                    <li><strong>Stages:</strong> Each column represents a stage in your sales process. These are configured by your administrator.</li>
                    <li><strong>Moving Deals:</strong> Simply drag and drop a deal card from one column to another to update its stage.</li>
                    <li><strong>Deal Value:</strong> The total value of all deals in a stage is displayed at the top of the column.</li>
                </ul>
                <h3>AI Forecasting</h3>
                <p>If enabled by your admin, you can click the "AI Forecast" button. This will show a win probability percentage on each deal card, calculated by an AI model that analyzes historical data. Click the percentage to see the positive and negative factors influencing the score.</p>
            </>
        )
    },

    // --- Marketing & Sales ---
    {
        id: 'creating-a-campaign',
        title: 'Creating a Marketing Campaign',
        category: 'Marketing & Sales',
        content: (
            <>
                <h2>Building Customer Journeys</h2>
                <p>The Campaigns feature allows you to build automated marketing sequences using a visual journey builder.</p>
                <h3>The Journey Builder Canvas</h3>
                <p>When you create or edit a campaign, you are presented with a canvas and a toolbox. You can drag nodes from the toolbox onto the canvas and connect them to build your flow.</p>
                <ul>
                    <li><strong>Trigger:</strong> The starting point of the journey. This is defined by the "Target Audience" settings (e.g., all contacts with status "Lead").</li>
                    <li><strong>Actions:</strong> These are the steps in your journey, such as "Send Email", "Wait for 3 days", or "Create Task".</li>
                    <li><strong>Conditions:</strong> These nodes split the path based on customer behavior, such as "If/Then (Email Opened)".</li>
                </ul>
                <h3>AI Content Studio</h3>
                <p>Need inspiration for your marketing emails? Use the **AI Content Studio** (accessible from the main Campaigns page) to generate compelling subject lines and body copy based on a simple prompt.</p>
            </>
        )
    },
    {
        id: 'what-is-lead-scoring',
        title: 'What is Lead Scoring?',
        category: 'Marketing & Sales',
        content: (
            <>
                <h2>Understanding Lead Scoring</h2>
                <p>Lead scoring is a methodology used to rank prospects based on their engagement and fit, helping your team prioritize who to contact first.</p>
                <h3>How it Works in VersaCRM</h3>
                <p>You can set up manual lead scoring rules in <strong>Settings &gt; Channels & Lead Gen &gt; Lead Scoring</strong>. Assign positive or negative points for events like:</p>
                <ul>
                    <li>Logging an interaction (e.g., +10 points for an Appointment)</li>
                    <li>A contact's status changing (e.g., +20 points when a 'Lead' becomes 'Active')</li>
                </ul>
                <h3>AI-Powered Lead Scoring</h3>
                <p>VersaCRM also offers an AI-powered lead scoring model. By clicking "Train Model", the AI analyzes your past won and lost deals. It identifies the key characteristics of a successful lead for your business and automatically scores new leads based on these insights, showing you the positive and negative factors it found.</p>
            </>
        )
    },

    // --- Service & Support ---
    {
        id: 'managing-tickets',
        title: 'Managing Support Tickets',
        category: 'Service & Support',
        content: (
            <>
                <h2>Providing Excellent Support</h2>
                <p>The Tickets hub is your central location for managing all customer support requests.</p>
                <h3>Ticket Lifecycle</h3>
                <p>When a ticket is created, it's assigned a priority. Based on this priority, an SLA (Service Level Agreement) timer starts, tracking the time until a first response is due. You can reply to customers, add internal notes for your team, and change the ticket's status until it's resolved and closed.</p>
                <h3>Internal vs. Public Replies</h3>
                <p>When replying to a ticket, you can choose to make it an "Internal note". This allows your team to discuss the ticket privately without the customer seeing the message.</p>
            </>
        )
    },
    {
        id: 'client-portal',
        title: 'Using the Client Portal',
        category: 'Service & Support',
        content: (
            <>
                <h2>Empowering Your Customers</h2>
                <p>The Client Portal is a secure space where your customers can log in to manage their relationship with your business. This reduces the burden on your support team and provides a better customer experience.</p>
                <h3>What Clients Can Do</h3>
                <ul>
                    <li><strong>View Profile:</strong> See their own contact information.</li>
                    <li><strong>Track Projects:</strong> View the status of their projects, see shared tasks, and complete assigned checklist items.</li>
                    <li><strong>Manage Billing:</strong> View their subscription plans and make payments if a payment gateway is connected.</li>
                    <li><strong>Access Documents:</strong> View and download files that have been explicitly shared with them.</li>
                    <li><strong>Submit Tickets:</strong> Create new support tickets and reply to existing ones.</li>
                </ul>
            </>
        )
    },

    // --- Advanced Features ---
    {
        id: 'creating-a-workflow',
        title: 'Creating an Automation Workflow',
        category: 'Advanced Features',
        content: (
            <>
                <h2>Automating Your Processes</h2>
                <p>Workflows allow you to automate repetitive internal tasks based on triggers in the CRM.</p>
                <h3>Simple vs. Advanced Workflows</h3>
                <p>The builder you use depends on the complexity of your task.</p>
                <ul>
                    <li><strong>Simple Workflows:</strong> Follow a linear "When this happens, do that" structure. Ideal for straightforward tasks like creating a follow-up task when a deal enters a new stage.</li>
                    <li><strong>Advanced Workflows:</strong> Use a visual drag-and-drop canvas for more complex logic. This allows you to add conditional branches (If/Then), approval steps, and multi-step action chains.</li>
                </ul>
                <h3>AI Process Optimization</h3>
                <p>Not sure what to automate? On the Workflows page, click "Analyze with AI". The system will review your recent deal and ticket history to find potential bottlenecks and suggest ready-to-use workflows to solve them.</p>
            </>
        )
    },
    {
        id: 'custom-objects',
        title: 'Using Custom Objects',
        category: 'Advanced Features',
        content: (
            <>
                <h2>Tailoring the CRM to Your Business</h2>
                <p>Custom Objects are the key to making VersaCRM a perfect fit for your unique business processes. They allow you to create and manage data types that aren't included by default.</p>
                <h3>Example Use Cases</h3>
                <ul>
                    <li>A real estate agency could create a "Property" object.</li>
                    <li>A law firm could create a "Case" or "Matter" object.</li>
                    <li>A financial advisory firm could create an "Insurance Policy" object.</li>
                </ul>
                <h3>How to Create One</h3>
                <ol>
                    <li>Go to <strong>Settings &gt; Objects & Fields</strong>.</li>
                    <li>Under Custom Objects, click "New Object". Define its singular and plural names (e.g., Property, Properties).</li>
                    <li>Once created, click "Configure" to add custom fields to your new object (e.g., Address, Price, Bedrooms for a Property).</li>
                    <li>The new object will appear in your sidebar, ready for you to create and manage records.</li>
                </ol>
            </>
        )
    },
    {
        id: 'ai-copilot',
        title: 'AI Co-pilot & Smart Search',
        category: 'Advanced Features',
        content: (
            <>
                <h2>Your Intelligent Assistant</h2>
                <p>VersaCRM has AI assistants built-in to help you find information and get work done faster.</p>
                <h3>Growth Co-pilot (on Dashboard)</h3>
                <p>This is your conversational business intelligence tool. Ask it questions in plain English, and it will analyze your data and generate charts, lists, or KPIs in response.</p>
                <p>Example questions:</p>
                <ul>
                    <li><code>"Show me a list of all contacts with the status 'Lead'"</code></li>
                    <li><code>"Create a bar chart of deals grouped by stage"</code></li>
                    <li><code>"What is the total value of deals in the 'Proposal Sent' stage?"</code></li>
                </ul>
                <h3>Smart Search (in Header)</h3>
                <p>This global search bar is also AI-powered. You can use it to ask questions or find records. It can understand natural language and will either apply a filter, generate a report, or find a relevant Knowledge Base article to answer your question.</p>
            </>
        )
    },
    {
        id: 'project-management',
        title: 'Project Management Basics',
        category: 'Advanced Features',
        content: (
            <>
                <h2>From Deal to Delivery</h2>
                <p>The Projects hub helps you manage post-sale work, ensuring a smooth handoff from your sales team to your delivery team.</p>
                <h3>Project Lifecycle</h3>
                <ul>
                    <li><strong>Creation:</strong> Projects can be created automatically when a Deal is moved to the "Won" stage, or created manually. You can use templates to automatically add a standard set of tasks.</li>
                    <li><strong>Workspace:</strong> Each project has its own workspace with tabs for Tasks, Discussion, Files, and client-facing Checklists.</li>
                    <li><strong>Client Collaboration:</strong> You can make specific tasks, files, and checklists visible to the client in their Client Portal, allowing them to track progress and complete items you've assigned to them.</li>
                </ul>
            </>
        )
    },
];
