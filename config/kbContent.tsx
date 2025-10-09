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
                        <strong>Choose Your Industry:</strong> The first step is to select an industry that best matches your business. This will tailor the CRM's terminology (e.g., "Patients" vs. "Clients") and add industry-specific custom fields to your contact profiles. You can do this in the top navigation bar.
                    </li>
                    <li>
                        <strong>Invite Your Team:</strong> Navigate to <strong>Settings &gt; Team</strong> to invite your team members. You can assign them specific roles to control what they can see and do.
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
                        <strong>Create a New Contact:</strong> Click the <strong>"New Contact"</strong> button on the top right. A modal will appear where you can fill in the contact's details, including any custom fields specific to your industry.
                    </li>
                    <li>
                        <strong>View Contact Details:</strong> Click on any contact's name in the table to open their detailed 360-degree profile. Here you can see everything about them across various tabs:
                        <ul>
                            <li className="!mt-2"><strong>Profile:</strong> Core contact information and custom fields.</li>
                            <li className="!mt-2"><strong>History:</strong> A timeline of all interactions like emails, calls, and notes.</li>
                            <li className="!mt-2"><strong>Website Activity:</strong> If the contact was captured via a tracked form or landing page, this tab shows you every page they viewed <em>before</em> they converted, providing valuable sales intelligence.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Filter and Search:</strong> Use the "Add Filter" button at the top of the contacts table to narrow down your list based on specific criteria like status or lead source.
                    </li>
                    <li>
                        <strong>Bulk Actions:</strong> Select multiple contacts by checking the boxes next to their names. A toolbar will appear allowing you to delete them or update their status in bulk.
                    </li>
                </ol>
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
                        <strong>Create a New Deal:</strong> Click the <strong>"New Deal"</strong> button. Fill in the deal's name, value, associated contact, and expected close date.
                    </li>
                    <li>
                        <strong>Move Deals Between Stages:</strong> Simply click and drag a deal card from one column (stage) to another to update its status. This action is automatically saved.
                    </li>
                    <li>
                        <strong>View Deal Details:</strong> Click on any deal card to open a modal where you can edit its details, update its value, or change its stage.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'support-tickets',
        title: 'Support Tickets',
        category: 'Core Features',
        content: (
            <>
                <h2 id="overview-tickets">Overview</h2>
                <p>
                    The ticketing system is your central hub for managing all customer support requests. It allows you to track issues from creation to resolution, ensuring timely responses and a complete history of all support interactions.
                </p>
                <h3 id="how-to-use-tickets">How to Use It</h3>
                <ol>
                    <li>
                        <strong>View Tickets:</strong> Navigate to the <strong>Tickets</strong> page from the sidebar to see a table of all support tickets.
                    </li>
                    <li>
                        <strong>Create a New Ticket:</strong> Click <strong>"New Ticket"</strong>, associate it with a contact, and fill in the subject and description. Assign it to a team member and set its priority.
                    </li>
                    <li>
                        <strong>Reply to a Ticket:</strong> Click on a ticket to open its detail modal. Here you can view the conversation history and add a new reply. You can also add internal notes that are only visible to your team by checking the "Internal note only" box.
                    </li>
                    <li>
                        <strong>Update Ticket Status:</strong> In the ticket's "Details" tab, you can change its status (e.g., from 'Open' to 'Pending' or 'Closed') and reassign it to another team member.
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
                <h3 id="how-to-use-tasks">How to Use Tasks</h3>
                <ol>
                    <li>
                        <strong>Access Your Tasks:</strong> Click on <strong>Tasks</strong> in the sidebar.
                    </li>
                    <li>
                        <strong>Create a Task:</strong> Simply type a title in the input field at the top and press Enter or click "Add". The task will be created with a default due date.
                    </li>
                    <li>
                        <strong>Complete a Task:</strong> Click the checkbox next to a task to mark it as complete. It will move to the "Completed" section.
                    </li>
                </ol>
                <h3 id="how-to-use-calendar">How to Use the Calendar</h3>
                <ol>
                    <li>
                        <strong>Access the Calendar:</strong> Click on <strong>Calendar</strong> in the sidebar.
                    </li>
                    <li>
                        <strong>Create an Event:</strong> Click on any time slot in the calendar. A modal will appear where you can enter the event title and confirm the start/end times.
                    </li>
                    <li>
                        <strong>View Event Details:</strong> Click on an existing event in the calendar to view or edit its details.
                    </li>
                </ol>
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
                <h3 id="how-to-use-inventory">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access Inventory:</strong> Navigate to <strong>Inventory</strong> in the sidebar.
                    </li>
                    <li>
                        <strong>Manage Products:</strong> On the "Products" tab, you can add new products, edit existing ones (including name, SKU, prices, and stock level), and view your entire product catalog.
                    </li>
                    <li>
                        <strong>Manage Suppliers & Warehouses:</strong> Use the "Suppliers" and "Warehouses" tabs to keep a directory of your vendors and storage locations.
                    </li>
                </ol>
            </>
        ),
    },

    // --- AUTOMATION ---
    {
        id: 'visual-journeys',
        title: 'Visual Campaign Journeys',
        category: 'Automation',
        content: (
            <>
                <h2 id="overview-journeys">Overview</h2>
                <p>
                    The Visual Journey Builder is an advanced marketing automation tool. It allows you to create multi-step marketing campaigns with branching logic, enabling you to send the right message to the right person at the right time based on their behavior.
                </p>
                <h3 id="how-to-use-journeys">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access Campaigns:</strong> Navigate to <strong>Campaigns</strong> in the sidebar.
                    </li>
                    <li>
                        <strong>Create a New Journey:</strong> Click <strong>"New Campaign"</strong>. This will open the Visual Journey Builder.
                    </li>
                    <li>
                        <strong>Define Your Audience:</strong> The first node, "Target Audience," is already on the canvas. Click it to configure which contacts will be enrolled (e.g., all contacts with status 'Lead').
                    </li>
                    <li>
                        <strong>Build Your Journey:</strong> Drag nodes from the Toolbox on the left onto the canvas. You can add actions like "Send Email," "Wait (Delay)," or "Create Task."
                    </li>
                    <li>
                        <strong>Add Branching Logic:</strong> Drag an "If/Then" node to create different paths based on user behavior, such as whether a contact opened a previous email.
                    </li>
                    <li>
                        <strong>Connect the Nodes:</strong> Click and drag from the handle at the bottom of a node to the handle at the top of the next node to create a sequence. For "If/Then" nodes, connect from the green (Yes) and red (No) handles to define the different paths.
                    </li>
                    <li>
                        <strong>Save and Launch:</strong> Give your journey a name, save it, and then click "Launch" from the main campaigns page to activate it.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'workflow-automation',
        title: 'Workflow Automation',
        category: 'Automation',
        content: (
            <>
                <h2 id="overview-workflows">Overview</h2>
                <p>
                    Workflows are powerful automations that handle internal processes. They react to events happening within your CRM (like a deal changing stage) and perform actions automatically, saving your team time and ensuring no steps are missed.
                </p>
                <h3 id="how-to-use-workflows">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access Workflows:</strong> Navigate to <strong>Workflows</strong> from the sidebar.
                    </li>
                    <li>
                        <strong>Choose a Workflow Type:</strong>
                        <ul>
                            <li><strong>Simple Workflows:</strong> Best for linear "if this, then that" logic. Click "New Simple Workflow".</li>
                            <li><strong>Advanced Workflows:</strong> Best for complex processes with multiple conditions. Click "New Advanced Workflow" to open a visual builder similar to the campaign journey builder.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Set the Trigger:</strong> In the builder, define what event should start the workflow (e.g., "When a Ticket is Created" and its priority is "High").
                    </li>
                    <li>
                        <strong>Add Actions:</strong> Define what should happen when the trigger fires. You can add actions like "Create a Task," "Send an Email," or "Update a Contact Field."
                    </li>
                    <li>
                        <strong>Save and Activate:</strong> Give your workflow a name and make sure it is set to "Active" to start running.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'lead-scoring',
        title: 'Lead Scoring',
        category: 'Automation',
        content: (
            <>
                <h2 id="overview-scoring">Overview</h2>
                <p>
                    Lead Scoring is a system that automatically ranks your leads based on their engagement and profile data. It helps your sales team prioritize their efforts by focusing on the "hottest" leads who are most likely to convert.
                </p>
                <h3 id="how-to-use-scoring">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Configure Scoring Rules:</strong> Go to <strong>Settings &gt; Lead Scoring</strong>. Here, you can define your rules. For example:
                        <ul>
                            <li>Add `+10` points when an "Appointment" is logged.</li>
                            <li>Add `+1` point when an "Email" is logged.</li>
                            <li>Subtract `-5` points if a contact's status becomes "Inactive."</li>
                        </ul>
                    </li>
                    <li>
                        <strong>View Scores:</strong> The lead score will automatically appear on the contact's profile and as a column in the main contacts table. Scores are recalculated automatically whenever a relevant event (like a new interaction) occurs.
                    </li>
                    <li>
                        <strong>Use Scores in Automation:</strong>
                        <ul>
                            <li>In the **Campaign Journey Builder**, you can set your target audience to only include contacts with a lead score greater than 50.</li>
                            <li>In the **Advanced Workflow Builder**, you can use an "If/Then" node to check a contact's lead score and trigger actions, like creating a task for a sales rep when a lead's score crosses 75.</li>
                        </ul>
                    </li>
                </ol>
            </>
        ),
    },

    // --- LEAD GENERATION ---
     {
        id: 'public-forms',
        title: 'Public Forms',
        category: 'Lead Generation',
        content: (
            <>
                <h2 id="overview-forms">Overview</h2>
                <p>
                    The Public Form Builder is the cornerstone of your lead generation strategy. It allows you to create custom forms that you can embed on your website to capture new leads directly into VersaCRM, triggering automations instantly.
                </p>
                <h3 id="how-to-use-forms">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access Forms:</strong> Navigate to <strong>Forms</strong> in the sidebar.
                    </li>
                    <li>
                        <strong>Create a New Form:</strong> Click <strong>"New Form"</strong> to open the interactive builder.
                    </li>
                    <li>
                        <strong>Build Your Form:</strong>
                        <ul>
                           <li className="!mt-2"><strong>Add Fields:</strong> Use the Toolbox on the left to add fields. You can add standard fields (Name, Email) and any custom fields you've configured for your industry.</li>
                           <li className="!mt-2"><strong>Arrange Fields:</strong> In the central preview panel, you can drag and drop fields to reorder them.</li>
                           <li className="!mt-2"><strong>Edit Fields:</strong> Click on a field in the preview to select it. The Configuration panel on the right will then allow you to edit its label, placeholder text, and mark it as required.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Configure Actions:</strong> In the configuration panel on the right (when no specific field is selected), you can define what happens after submission. You can set a custom "thank you" message and, most importantly, choose a <strong>Marketing Journey</strong> to automatically enroll the new contact in.
                    </li>
                    <li>
                        <strong>Embed Your Form:</strong> Once saved, click the <strong>"Embed"</strong> icon from the main forms page. Copy the HTML snippet and paste it into your website's code where you want the form to appear.
                    </li>
                    <li>
                        <strong>Test Your Form:</strong> Use the <strong>"Test"</strong> button to fill out and submit the form yourself. You'll see a new contact created in your CRM, an interaction logged, and the linked automation will begin.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'landing-pages',
        title: 'Landing Pages',
        category: 'Lead Generation',
        content: (
            <>
                <h2 id="overview-lp">Overview</h2>
                <p>
                    The Landing Page Builder allows you to create simple, effective marketing pages directly within VersaCRM. This is perfect for campaigns where you need a dedicated page to host a lead capture form, without needing a web developer.
                </p>
                <h3 id="how-to-use-lp">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access Landing Pages:</strong> Navigate to <strong>Landing Pages</strong> in the sidebar.
                    </li>
                    <li>
                        <strong>Create a New Page:</strong> Click <strong>"New Landing Page"</strong>.
                    </li>
                    <li>
                        <strong>Add Content Blocks:</strong> Use the "Components" toolbox on the left to add sections like a Header, Text Block, Image, or a Form.
                    </li>
                    <li>
                        <strong>Embed a Form:</strong> When you add a "Form" component, click on it in the preview. The configuration panel on the right will allow you to select one of the public forms you've already created.
                    </li>
                    <li>
                        <strong>Publish and Share:</strong> Give your page a name and a URL slug (e.g., 'spring-promo'). Once saved, you can click the status badge in the table to switch it from "Draft" to "Published". Use the copy icon to get the live URL and share it.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'website-analytics',
        title: 'Website Analytics',
        category: 'Lead Generation',
        content: (
            <>
                <h2 id="overview-analytics">Overview</h2>
                <p>
                    VersaCRM's Website Analytics allows you to connect anonymous visitor activity on your website to a contact's profile once they convert. This gives your sales team invaluable insight into a lead's interests before they even make the first call.
                </p>
                <h3 id="how-it-works">How It Works</h3>
                <ol>
                    <li>
                        <strong>Install the Tracking Script:</strong> Navigate to <strong>Settings &gt; Tracking Code</strong>. Copy the provided JavaScript snippet and paste it onto every page of your external website, just before the closing <code>&lt;/body&gt;</code> tag.
                    </li>
                    <li>
                        <strong>Anonymous Tracking:</strong> The script will begin tracking page views for all visitors, assigning a unique, anonymous ID to each person.
                    </li>
                    <li>
                        <strong>Conversion Stitching:</strong> When a visitor submits a VersaCRM form embedded on your site, the script automatically links their entire browsing history to the new contact record that gets created.
                    </li>
                    <li>
                        <strong>View the Activity Timeline:</strong> Open the new contact's profile in the CRM. A new <strong>"Website Activity"</strong> tab will appear, showing a complete timeline of the pages they viewed.
                    </li>
                </ol>
                <p className="mt-4">
                    <strong>Note:</strong> This tracking script is automatically included on all pages created with the VersaCRM <strong>Landing Page Builder</strong>, so no manual installation is necessary for those pages.
                </p>
            </>
        ),
    },

    // --- ANALYTICS ---
    {
        id: 'custom-reports',
        title: 'Custom Reports',
        category: 'Analytics',
        content: (
            <>
                <h2 id="overview-reports">Overview</h2>
                <p>
                    The Custom Report Builder is a powerful business intelligence tool that lets you create your own charts and tables from your CRM data. This allows you to track the metrics that matter most to your business.
                </p>
                <h3 id="how-to-use-reports">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access Reports:</strong> Navigate to <strong>Reports</strong> from the sidebar.
                    </li>
                    <li>
                        <strong>Create a Custom Report:</strong> Click the <strong>"Custom Report"</strong> button.
                    </li>
                    <li>
                        <strong>Configure Your Report:</strong>
                        <ul>
                            <li><strong>Data Source:</strong> Choose what you want to report on (e.g., Contacts, Products, Deals).</li>
                            <li><strong>Columns:</strong> Select the fields you want to see in your report.</li>
                            <li><strong>Filters:</strong> Add conditions to narrow down your data.</li>
                            <li><strong>Visualization:</strong> Choose how to display your data: as a Table, Bar Chart, Pie Chart, or Line Chart.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Live Preview:</strong> As you configure your report, the Live Preview on the right will update in real-time, showing you exactly what your report will look like.
                    </li>
                    <li>
                        <strong>Save and Add to Dashboard:</strong> Give your report a name and save it. From the main reports page, you can then click <strong>"Add to Dashboard"</strong> to make it appear on your main dashboard for easy access.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'campaign-reports',
        title: 'Campaign Reports',
        category: 'Analytics',
        content: (
            <>
                <h2 id="overview-camp-reports">Overview</h2>
                <p>
                    The Campaign Performance Report provides a deep-dive analysis of how your marketing journeys are performing. It helps you understand engagement, identify drop-off points, and optimize your marketing efforts.
                </p>
                <h3 id="how-to-use-camp-reports">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access the Report:</strong> Navigate to <strong>Campaigns</strong>. For any active or completed campaign, click the <strong>"Report"</strong> button.
                    </li>
                    <li>
                        <strong>Analyze KPIs:</strong> At the top of the page, you'll see key metrics like Open Rate and Click-Through Rate.
                    </li>
                    <li>
                        <strong>View the Funnel:</strong> The Campaign Funnel chart visualizes how many contacts moved through each stage of your campaign, from initial recipients down to those who clicked.
                    </li>
                    <li>
                        <strong>Drill Down into Contacts:</strong> Use the tabs at the bottom of the page to see the specific lists of contacts who opened your emails or clicked links within them.
                    </li>
                </ol>
            </>
        ),
    },

    // --- INTEGRATIONS ---
    {
        id: 'email-sync',
        title: 'Two-Way Email Sync',
        category: 'Integrations',
        content: (
            <>
                <h2 id="overview-email">Overview</h2>
                <p>
                    The Two-Way Email Sync integration connects your personal email inbox (like Gmail or Outlook) to VersaCRM. It automatically finds conversations with your contacts and logs them as Email interactions on their history timeline, ensuring your CRM is always a single source of truth for all communication.
                </p>
                <h3 id="how-to-use-email">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Connect Your Account:</strong> Navigate to <strong>Settings &gt; Integrations</strong>. Click the "Connect Email Account" button to simulate the secure connection process.
                    </li>
                    <li>
                        <strong>Trigger a Sync:</strong> Go to the new <strong>Synced Email</strong> page in the sidebar. Click the <strong>"Sync Now"</strong> button.
                    </li>
                    <li>
                        <strong>View Synced Emails:</strong> The sync engine will "scan" your inbox, match emails to your CRM contacts, and create new interaction records. These will appear in the list on the Synced Email page and, more importantly, on the "History" tab of the corresponding contacts.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'voip-telephony',
        title: 'VoIP Telephony',
        category: 'Integrations',
        content: (
            <>
                <h2 id="overview-voip">Overview</h2>
                <p>
                    The VoIP Telephony integration turns VersaCRM into a complete communication hub. It enables "click-to-call" functionality directly from the CRM and automatically logs every call as an interaction, complete with duration and an optional AI-generated summary.
                </p>
                <h3 id="how-to-use-voip">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Connect Your Provider:</strong> Go to <strong>Settings &gt; Integrations</strong> and click "Connect Provider" in the VoIP section.
                    </li>
                    <li>
                        <strong>Make a Call:</strong> Find any phone number in the application (e.g., on a contact's profile or in the contacts table). If the integration is active, you'll see a phone icon. Click the number or the icon to launch the in-app Call Control modal.
                    </li>
                    <li>
                        <strong>Manage the Call:</strong> The modal will simulate the call process ("Dialing...", "Connected") and includes a live timer and controls like "End Call".
                    </li>
                    <li>
                        <strong>Automatic Logging:</strong> When you end the call, an interaction record is automatically created on the contact's history tab, noting the call duration.
                    </li>
                    <li>
                        <strong>Generate AI Summary:</strong> After the call is logged, a button will appear in the modal to "Generate AI Summary". Clicking this uses Gemini to create a concise summary of the call, which is then appended to the interaction notes.
                    </li>
                </ol>
            </>
        ),
    },
     {
        id: 'live-chat',
        title: 'Live Chat Widget',
        category: 'Integrations',
        content: (
            <>
                <h2 id="overview-chat">Overview</h2>
                <p>
                    The Live Chat widget allows you to engage with visitors on your website in real-time. It's a powerful tool for both lead generation and customer support, feeding new conversations directly into your CRM.
                </p>
                <h3 id="how-to-use-chat">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Configure the Widget:</strong> Go to <strong>Settings &gt; Live Chat</strong>. Here you can enable the widget, customize its color and welcome message, and set up automation rules (e.g., "automatically create a new Ticket for every new chat").
                    </li>
                    <li>
                        <strong>Embed on Your Site:</strong> Copy the provided embed code and paste it into your website's HTML.
                    </li>
                    <li>
                        <strong>Test the Flow:</strong> To simulate the widget, navigate to the <strong>Client Portal</strong>. You will see the chat bubble in the bottom-right corner.
                    </li>
                    <li>
                        <strong>Start a Chat:</strong> Open the widget and send a message. Based on your settings, this will automatically create a new Contact and/or a new Ticket in your CRM, which your team can see and respond to immediately.
                    </li>
                </ol>
            </>
        ),
    },

    // --- ADMIN & PLATFORM ---
    {
        id: 'roles-permissions',
        title: 'Roles & Permissions',
        category: 'Administration',
        content: (
            <>
                <h2 id="overview-roles">Overview</h2>
                <p>
                    The Roles & Permissions system gives you granular control over what your users can see and do within VersaCRM. You can create custom roles that perfectly match your team's structure and security requirements.
                </p>
                <h3 id="how-to-use-roles">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access Role Management:</strong> Navigate to <strong>Settings &gt; Roles & Permissions</strong>.
                    </li>
                    <li>
                        <strong>Create a New Role:</strong> Click <strong>"New Role"</strong>. Give the role a name and description.
                    </li>
                    <li>
                        <strong>Define Permissions:</strong> In the role editor, you'll see a matrix of all available permissions (e.g., `contacts:create`, `deals:delete`). Check the boxes for the permissions you want to grant to this role.
                    </li>
                    <li>
                        <strong>Assign Roles to Users:</strong> Go to the <strong>Team</strong> page. When you invite a new team member or edit an existing one, you can now select one of your custom roles from the dropdown menu.
                    </li>
                    <li>
                        <strong>UI Enforcement:</strong> The CRM interface will automatically adapt for users with this role. Buttons, pages, and actions they don't have permission for will be hidden or disabled.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'api-access',
        title: 'API & App Marketplace',
        category: 'Administration',
        content: (
            <>
                <h2 id="overview-api">Overview</h2>
                <p>
                    VersaCRM is designed as an open platform. The API allows your developers or third-party applications to programmatically interact with your CRM data, enabling custom integrations and extending the platform's capabilities.
                </p>
                <h3 id="how-to-use-api">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Manage API Keys:</strong> Go to <strong>Settings &gt; API & Apps</strong>. Here, you can generate new API keys, view existing ones, and revoke keys that are no longer needed.
                    </li>
                    <li>
                        <strong>Consult the Documentation:</strong> Navigate to the <strong>API Docs</strong> page from the sidebar. This page provides all the information a developer needs to start using the API, including authentication instructions and example endpoints.
                    </li>
                    <li>
                        <strong>Explore the App Marketplace:</strong> The "API & Apps" page also features a simulated App Marketplace, showcasing how you could connect to popular third-party services like Slack or QuickBooks in the future.
                    </li>
                </ol>
            </>
        ),
    },
];