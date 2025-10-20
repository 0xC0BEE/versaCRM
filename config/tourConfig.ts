import { TourStep } from '../types';

export const adminTourSteps: TourStep[] = [
    {
        selector: '[data-tour-id="dashboard-edit-layout"]',
        title: 'Welcome to Your Dashboard!',
        content: 'This is your command center. You can add, remove, and resize widgets by clicking "Edit Layout" to make it your own.',
        page: 'Dashboard',
    },
    {
        selector: '[data-tour-id="sidebar-contacts"]',
        title: 'Manage Your Contacts',
        content: 'This is where you\'ll find all of your contacts, patients, or clients. Let\'s go there now.',
    },
    {
        selector: '[data-tour-id="contacts-new-button"]',
        title: 'Add New Contacts',
        content: 'You can add new contacts manually here, or import them from a CSV in the settings.',
        page: 'Contacts',
    },
    {
        selector: '[data-tour-id="sidebar-settings"]',
        title: 'Configure Your CRM',
        content: 'The real power comes from customization. Head to Settings to configure workflows, integrations, custom fields, and more.',
        page: 'Contacts',
        openSection: 'Admin',
    },
    {
        selector: '[data-tour-id="settings-page"]',
        title: 'Unleash the Power',
        content: 'In Settings, you can set up automations, manage your team, and connect with other tools to make this CRM truly yours. This concludes our tour!',
        page: 'Settings',
    },
];

export const teamTourSteps: TourStep[] = [
    {
        selector: '[data-tour-id="dashboard-team-kpis"]',
        title: 'Your Personal Dashboard',
        content: 'Welcome! This is your personal dashboard, showing your key metrics at a glance.',
        page: 'Dashboard',
    },
    {
        selector: '[data-tour-id="sidebar-tasks"]',
        title: 'Stay on Top of Your Day',
        content: 'Your assigned tasks will appear here. Let\'s check it out.',
    },
    {
        selector: '[data-tour-id="tasks-add-task-form"]',
        title: 'Quickly Add Tasks',
        content: 'You can add new to-do items here to stay organized. This concludes your tour!',
        page: 'Tasks',
    }
];