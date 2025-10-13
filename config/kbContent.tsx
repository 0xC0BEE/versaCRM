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
                            <li className="!mt-2"><strong>Journey:</strong> A complete chronological timeline of every interaction. See the "Customer Journey Visualizer" article for more details.</li>
                            <li className="!mt-2"><strong>History:</strong> A filtered timeline of all interactions like emails, calls, and notes.</li>
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
                        <strong>Analyze the Timeline:</strong> You will see a vertical timeline of every event in the contact's history, sorted from most recent to oldest. Each event type has a unique icon and color, making it easy to distinguish between marketing, sales, and support interactions. Events include:
                        <ul>
                            <li className="!mt-2">Anonymous Website Visits</li>
                            <li className="!mt-2">Form Submissions</li>
                            <li className="!mt-2">Campaign Enrollments</li>
                            <li className="!mt-2">Deals being created or won</li>
                            <li className="!mt-2">Support tickets being opened or closed</li>
                            <li className="!mt-2">Tasks being completed</li>
                            <li className="!mt-2">Manually logged calls, emails, and meetings</li>
                        </ul>
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
                        <strong>Create a New Deal:</strong> Click the <strong>"New Deal"</strong> button. Fill in the deal's name, value, associated contact, and expected close date.
                    </li>
                    <li>
                        <strong>Move Deals Between Stages:</strong> Simply click and drag a deal card from one column (stage) to another to update its status. This action is automatically saved.
                    </li>
                    <li>
                        <strong>View Deal Details:</strong> Click on any deal card to open a modal where you can edit its details, update its value, or change its stage.
                    </li>
                     <li>
                        <strong>Generate Documents:</strong> From the Deal edit modal, you can click <strong>"Generate Document"</strong> to create a professional proposal or quote using a pre-defined template, automatically populated with this deal's information.
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
                     <li>
                        <strong>Edit & Link Tasks:</strong> Click the "Edit" button on a task to open a modal. Here you can change the title, due date, and link the task to a specific record from one of your <strong>Custom Objects</strong> (e.g., linking a task to a specific "Property" or "Case"). This provides valuable context for your to-do items.
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

    // --- SALES ENABLEMENT ---
    {
        id: 'document-generator',
        title: 'Document & Proposal Generator',
        category: 'Sales Enablement',
        content: (
            <>
                <h2 id="overview-docs">Overview</h2>
                <p>
                    The Document & Proposal Generator is a powerful sales enablement tool that allows you to create professional, data-driven documents like quotes, proposals, and contracts directly within VersaCRM. It eliminates manual data entry, reduces errors, and ensures brand consistency.
                </p>
                <h3 id="how-to-use-docs">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Create a Template:</strong> Navigate to <strong>Documents</strong> in the sidebar. Click "New Template" to open the Document Builder.
                    </li>
                    <li>
                        <strong>Build Your Template:</strong>
                         <ul>
                            <li className="!mt-2"><strong>Add Content Blocks:</strong> Use the Toolbox on the left to add blocks like Headers, Text, Images, and Line Item tables.</li>
                            <li className="!mt-2"><strong>Use Dynamic Data:</strong> When editing a Text block, use the "Placeholders" section in the right-hand panel to insert variables like <code>&#123;&#123;contact.contactName&#125;&#125;</code> or <code>&#123;&#123;deal.value&#125;&#125;</code>. These will be automatically filled with live data upon generation.</li>
                             <li className="!mt-2"><strong>Create Quotes:</strong> Add a "Line Items" block. In the configuration panel, you can add products directly from your Inventory, set quantities, and specify a tax rate. The totals are calculated automatically.</li>
                            <li className="!mt-2"><strong>Generate with AI:</strong> For any Text or Image block, use the "Generate with AI" button in the configuration panel to open the AI Content or Image Studio and create bespoke content on the fly.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Generate a Document from a Deal:</strong> Open any deal from the <strong>Deals</strong> pipeline. Click the <strong>"Generate Document"</strong> button.
                    </li>
                    <li>
                        <strong>Preview and Download:</strong> In the generation modal, select your saved template. A live preview will be generated with all data placeholders filled in. Click "Download" to get the final document.
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
    
    // --- PLATFORM & EXTENSIBILITY ---
    {
        id: 'custom-objects',
        title: 'Custom Objects',
        category: 'Platform & Extensibility',
        content: (
            <>
                <h2 id="overview-co">Overview</h2>
                <p>
                    Custom Objects are a powerful feature that transforms VersaCRM into a truly extensible platform. They allow you to create entirely new data objects beyond just Contacts and Deals, tailoring the CRM to the unique needs of your business. For example, a real estate agency could create a "Property" object, or a legal firm could create a "Case" object.
                </p>
                <h3 id="how-to-use-co">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Define a New Object:</strong> Go to <strong>Settings &gt; Custom Objects</strong> and click "New Object". Give your object a singular and plural name (e.g., "Property", "Properties") and choose an icon to represent it.
                    </li>
                    <li>
                        <strong>Manage Fields:</strong> After creating the object, click "Manage Fields". Here, you can add all the custom fields specific to this object using a familiar field builder (e.g., "Address", "Price", "Square Footage").
                    </li>
                    <li>
                        <strong>Access Your New Object:</strong> Once created, your new object (e.g., "Properties") will automatically appear in the main sidebar under a "Custom" section.
                    </li>
                    <li>
                        <strong>Manage Records:</strong> Click on your new object in the sidebar to view a dynamically generated list page. From here, you can create, view, edit, and delete records for your custom object just like you would for standard contacts or deals.
                    </li>
                    <li>
                        <strong>Link Records:</strong> Custom Object records can be linked to other core CRM items to provide context. You can link records to <strong>Deals</strong>, <strong>Tickets</strong>, and <strong>Tasks</strong> when creating or editing those items.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'app-marketplace',
        title: 'App Marketplace',
        category: 'Platform & Extensibility',
        content: (
            <>
                <h2 id="overview-apps">Overview</h2>
                <p>
                    The App Marketplace is your hub for connecting VersaCRM to the other tools you use. It allows you to discover, install, and manage third-party integrations, turning your CRM into the central command center for your entire software ecosystem.
                </p>
                <h3 id="how-to-use-apps">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Access the Marketplace:</strong> Navigate to <strong>App Marketplace</strong> from the sidebar (under the "Admin" section).
                    </li>
                    <li>
                        <strong>Discover Apps:</strong> On the "Discover" tab, you can browse a gallery of available applications like Slack, QuickBooks, and Google Calendar.
                    </li>
                    <li>
                        <strong>Install an App:</strong> Click "Learn More" on any app to view its details. From the detail modal, click "Install App".
                    </li>
                    <li>
                        <strong>Manage Installed Apps:</strong> The "Installed Apps" tab shows you all the applications you have connected. From here, you can click "Configure" to manage an app's settings or "Uninstall" it.
                    </li>
                </ol>
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
                            <li><strong>Data Source:</strong> Choose what you want to report on. You can select standard sources (like Contacts, Products, Deals) or any of your own <strong>Custom Objects</strong>.</li>
                            <li><strong>Columns:</strong> Select the fields you want to see in your report. These will dynamically update based on your chosen data source.</li>
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
        id: 'custom-dashboard',
        title: 'Customizable Dashboard',
        category: 'Analytics',
        content: (
            <>
                <h2 id="overview-dash">Overview</h2>
                <p>
                    The Advanced Dashboard Canvas transforms your dashboard into a fully interactive and customizable business intelligence hub. You can rearrange, resize, and add the reports that matter most to you, creating a personalized command center.
                </p>
                <h3 id="how-to-use-dash">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Enter Edit Mode:</strong> On the Dashboard, click the <strong>"Edit Layout"</strong> button. The dashboard will switch to an interactive canvas mode.
                    </li>
                    <li>
                        <strong>Rearrange Widgets:</strong> Simply click and drag any widget (like a KPI card or a chart) to a new position on the grid.
                    </li>
                    <li>
                        <strong>Resize Widgets:</strong> Hover over the bottom-right corner of any widget and drag the handle to resize it, making important information more prominent.
                    </li>
                    <li>
                        <strong>Add New Widgets:</strong> In edit mode, an "Add Widget" button will appear. Click it to open a modal where you can select any of your saved Custom Reports to add to the dashboard.
                    </li>
                     <li>
                        <strong>Remove Widgets:</strong> In edit mode, an "X" icon appears on each widget. Click it to remove the widget from your dashboard.
                    </li>
                    <li>
                        <strong>Save Your Layout:</strong> Once you are happy with the arrangement, click <strong>"Save Layout"</strong>. Your custom layout, including all positions and sizes, will be saved and restored every time you visit.
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

    // --- AI & PREDICTIVE INTELLIGENCE ---
    {
        id: 'deal-forecasting',
        title: 'AI Deal Forecasting',
        category: 'AI & Predictive Intelligence',
        content: (
            <>
                <h2 id="overview-deal-ai">Overview</h2>
                <p>
                    The AI Deal Forecasting feature transforms your sales pipeline into an intelligent advisor. It analyzes your open deals and predicts the likelihood of each one closing successfully, allowing your team to focus their efforts where they will have the most impact.
                </p>
                <h3 id="how-to-use-deal-ai">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Activate the Forecast:</strong> Navigate to the <strong>Deals</strong> page. Click the "AI Forecast" button at the top right.
                    </li>
                    <li>
                        <strong>View Win Probability:</strong> Each deal card will now display a color-coded "Win Probability" badge (Green for High, Yellow for Medium, Red for Low), giving you an at-a-glance overview of your pipeline's health.
                    </li>
                    <li>
                        <strong>Get a Detailed Analysis:</strong> Click on any probability badge to open the "Deal Forecast Analysis" modal.
                    </li>
                    <li>
                        <strong>Understand the "Why":</strong> The modal provides a detailed breakdown of the AI's reasoning, listing the key <strong>Positive Factors</strong> (strengths) and <strong>Negative Factors</strong> (risks) influencing the score.
                    </li>
                    <li>
                        <strong>Take Action:</strong> The modal also provides a clear, AI-generated <strong>"Next Best Action"</strong>—a specific, actionable recommendation on what step to take next to improve the deal's chances of success.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'churn-prediction',
        title: 'AI Churn Prediction',
        category: 'AI & Predictive Intelligence',
        content: (
            <>
                <h2 id="overview-churn-ai">Overview</h2>
                <p>
                    The AI Churn Prediction feature is a proactive tool for customer retention. It analyzes contact behavior to identify customers who are at risk of leaving, allowing your support and account management teams to intervene before it's too late.
                </p>
                <h3 id="how-to-use-churn-ai">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Activate Churn Risk:</strong> Navigate to the <strong>Contacts</strong> page. Click the "AI Churn Risk" button at the top right.
                    </li>
                    <li>
                        <strong>Identify At-Risk Contacts:</strong> A new "Churn Risk" column will appear in the contacts table. Each active contact will display a color-coded badge indicating their risk level (Low, Medium, or High).
                    </li>
                    <li>
                        <strong>Get a Detailed Analysis:</strong> Click on any risk badge to open the "Churn Prediction Analysis" modal.
                    </li>
                    <li>
                        <strong>Understand the Factors:</strong> The modal breaks down the AI's reasoning, listing <strong>Retention Factors</strong> (positive signals) and <strong>Churn Risks</strong> (red flags).
                    </li>
                    <li>
                        <strong>Take Action:</strong> The modal provides a clear, AI-generated <strong>"Next Best Action"</strong>—a specific, actionable recommendation to help you mitigate the risk and retain the customer.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: 'next-best-action',
        title: 'Next Best Action',
        category: 'AI & Predictive Intelligence',
        content: (
            <>
                <h2 id="overview-nba">Overview</h2>
                <p>
                    The "Next Best Action" feature is the culmination of our AI efforts. It's an intelligent recommendation engine that analyzes a contact's complete profile—including their deal forecasts and churn risk—to suggest the single most impactful action you can take at that moment.
                </p>
                <h3 id="how-to-use-nba">How to Use It</h3>
                <ol>
                    <li>
                        <strong>View a Contact:</strong> Open any contact's detail modal from the Contacts page or anywhere else in the CRM.
                    </li>
                    <li>
                        <strong>See the Recommendation:</strong> At the top of the modal, the "Next Best Action" component will appear, displaying the AI's suggestion and the reason behind it. For example, it might suggest calling a high-scoring lead or emailing a high-churn-risk customer.
                    </li>
                    <li>
                        <strong>Take Action with One Click:</strong> Click the <strong>"Take Action"</strong> button. The system will intelligently perform the suggested action for you:
                        <ul>
                            <li className="!mt-2">If the suggestion is to **make a call**, it will open the VoIP Call Control modal, ready to dial.</li>
                            <li className="!mt-2">If the suggestion is to **send an email**, it will switch you to the Email tab and pre-populate the composer with the recommended template.</li>
                        </ul>
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
                        <strong>Connect Your Account:</strong> Navigate to <strong>Settings &gt; API & Apps &gt; Integrations</strong>. Click the "Connect Email Account" button to simulate the secure connection process.
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
                        <strong>Connect Your Provider:</strong> Go to <strong>Settings &gt; API & Apps &gt; Integrations</strong> and click "Connect Provider" in the VoIP section.
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
        title: 'API Access',
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
                </ol>
            </>
        ),
    },
    {
        id: 'ui-design-system',
        title: 'UI & Design System',
        category: 'Administration',
        content: (
            <>
                <h2 id="overview-ui">Design Philosophy</h2>
                <p>
                    VersaCRM's user interface is built upon a modern, consistent, and accessible design system. Our approach is heavily inspired by the principles of industry-leading component libraries like <strong>shadcn/ui</strong>.
                </p>
                <h3 id="core-principles">Core Principles</h3>
                <ol>
                    <li>
                        <strong>Composability:</strong> Our UI components (Buttons, Cards, Modals, etc.) are built as small, reusable blocks. This allows us to construct complex layouts with consistency and flexibility. For example, a <code>Card</code> is composed of <code>CardHeader</code>, <code>CardContent</code>, and <code>CardFooter</code>, giving developers fine-grained control over its structure.
                    </li>
                    <li>
                        <strong>Accessibility (A11y):</strong> We prioritize making the application usable for everyone. This includes proper use of ARIA attributes, keyboard navigation, and sufficient color contrast.
                    </li>
                    <li>
                        <strong>Theming with CSS Variables:</strong> The entire application's color scheme is controlled by a set of CSS variables. This allows for seamless switching between Light and Dark modes and enables the powerful Custom Theme Builder, which lets you define your own brand colors.
                    </li>
                </ol>
                <p className="mt-4">
                    By not being tied to a specific third-party component library and instead adopting these principles, we maintain full control over the look, feel, and performance of the application, ensuring a world-class user experience.
                </p>
            </>
        ),
    },
     {
        id: 'sandbox-environments',
        title: 'Sandbox Environments',
        category: 'Administration',
        content: (
            <>
                <h2 id="overview-sandbox">Overview</h2>
                <p>
                    Sandbox Environments are safe, isolated copies of your production environment. They are an essential tool for enterprise-grade CRM management, allowing you to test changes, train users, and validate configurations without any risk to your live business data.
                </p>
                <h3 id="how-to-use-sandbox">How to Use It</h3>
                <ol>
                    <li>
                        <strong>Create a Sandbox:</strong> Navigate to <strong>Settings &gt; Developer & Data</strong>. In the "Sandboxes" section, give your new sandbox a name and click "Create Sandbox". This will create a full copy of your current production data and settings.
                    </li>
                    <li>
                        <strong>Switch Environments:</strong> A new environment switcher dropdown will appear in the main header, next to your profile name. Use this to switch between your "Production" environment and any sandboxes you've created.
                    </li>
                    <li>
                        <strong>Work in the Sandbox:</strong> When you switch to a sandbox, a prominent banner will appear at the top of the application, reminding you that you are in a safe testing environment. You can now make any changes you want—create test contacts, modify workflows, build new custom objects—without affecting your real data.
                    </li>
                     <li>
                        <strong>Refresh a Sandbox:</strong> In the Sandbox settings, click the "Refresh" button next to a sandbox. This will completely overwrite the sandbox with a fresh copy of your current production data. This is useful for starting a new round of testing.
                    </li>
                     <li>
                        <strong>Delete a Sandbox:</strong> Click the "Delete" button to permanently remove a sandbox environment you no longer need.
                    </li>
                    <li>
                        <strong>Switch Back to Production:</strong> When you're done testing, simply use the environment switcher to return to "Production". All your live data will be exactly as you left it.
                    </li>
                </ol>
                <p className="mt-4">
                    <strong>Note:</strong> Changes made in a sandbox are not automatically moved to production. You must manually replicate any successful changes (like a new workflow) in your production environment.
                </p>
            </>
        ),
    },
];