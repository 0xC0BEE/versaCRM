import React from 'react';
import { KBArticleType } from '../types';

export const kbArticles: KBArticleType[] = [
    {
        id: 'getting-started',
        title: 'Getting Started with VersaCRM',
        category: 'Getting Started',
        content: (
            <>
                <h2>Welcome to VersaCRM!</h2>
                <p>This guide will walk you through the initial steps to get your CRM up and running.</p>
                <h3>1. Initial Setup</h3>
                <p>If you're an Organization Admin, you'll first be guided through the AI Onboarding Wizard. This powerful tool configures your CRM's terminology, custom fields, and sales pipeline based on a description of your business.</p>
                <h3>2. Exploring the Dashboard</h3>
                <p>The Dashboard is your command center. Here you'll find key performance indicators (KPIs), charts, and AI-powered insights to give you a real-time overview of your business health.</p>
                <h3>3. Managing Contacts</h3>
                <p>The Contacts page is where you'll manage all your customers, patients, or clients. You can create, edit, and filter contacts to keep your data organized.</p>
            </>
        )
    },
    {
        id: 'what-is-lead-scoring',
        title: 'What is Lead Scoring?',
        category: 'Features',
        content: (
            <>
                <h2>Understanding Lead Scoring</h2>
                <p>Lead scoring is a methodology used to rank prospects against a scale that represents the perceived value each lead represents to the organization. The resulting score is used to determine which leads a receiving function (e.g. sales, marketing) will engage, in order of priority.</p>
                <h3>How it Works in VersaCRM</h3>
                <p>You can set up manual lead scoring rules in <strong>Settings &gt; Channels & Lead Gen &gt; Lead Scoring</strong>. Assign points for events like:</p>
                <ul>
                    <li>Logging an interaction (e.g., +10 points for an Appointment)</li>
                    <li>A contact's status changing (e.g., +20 points when a 'Lead' becomes 'Active')</li>
                </ul>
                <h3>AI-Powered Lead Scoring</h3>
                <p>VersaCRM also offers an AI-powered lead scoring model. By analyzing your past won and lost deals, the AI can identify the key characteristics of a successful lead for your business and automatically score new leads based on these insights.</p>
            </>
        )
    },
    {
        id: 'creating-a-workflow',
        title: 'Creating an Automation Workflow',
        category: 'Workflows & Automation',
        content: (
            <>
                <h2>Automating Your Processes</h2>
                <p>Workflows allow you to automate repetitive tasks based on triggers in the CRM. This saves you time and ensures consistent processes.</p>
                <h3>Simple Workflows</h3>
                <p>Simple workflows follow a "When this happens, do that" structure. You can create them from the Workflows page.</p>
                <ol>
                    <li>Go to the <strong>Workflows</strong> page.</li>
                    <li>Click "New Simple Workflow".</li>
                    <li>Select a <strong>Trigger</strong> (e.g., "Contact is Created").</li>
                    <li>Add one or more <strong>Actions</strong> (e.g., "Wait 1 day", then "Send an Email").</li>
                    <li>Save and activate your workflow.</li>
                </ol>
                <h3>Advanced Workflows</h3>
                <p>For more complex logic, use the Advanced Workflow builder. This provides a visual canvas where you can add conditional logic (If/Then branches), approvals, and more complex action chains.</p>
            </>
        )
    }
];
