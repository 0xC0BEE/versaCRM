import { IndustryConfig, Industry } from '../types';

export let industryConfigs: Record<Industry, IndustryConfig> = {
    Health: {
        name: 'Health',
        contactName: 'Patient',
        contactNamePlural: 'Patients',
        organizationName: 'Clinic',
        organizationNamePlural: 'Clinics',
        teamMemberName: 'Practitioner',
        teamMemberNamePlural: 'Practitioners',
        customFields: [
            { id: 'patientId', label: 'Patient ID', type: 'text' },
            { id: 'insuranceProvider', label: 'Insurance Provider', type: 'text' },
            { id: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        ],
        interactionTypes: ['Appointment', 'Call', 'Email', 'Note', 'Site Visit'],
        interactionCustomFields: [],
        structuredRecordTabName: 'SOAP Notes',
        structuredRecordTypes: [
            {
                id: 'soap_note',
                name: 'SOAP Note',
                fields: [
                    { id: 'subjective', label: 'Subjective', type: 'textarea' },
                    { id: 'objective', label: 'Objective', type: 'textarea' },
                    { id: 'assessment', label: 'Assessment', type: 'textarea' },
                    { id: 'plan', label: 'Plan', type: 'textarea' },
                ],
            },
        ],
        ordersTabName: 'Prescriptions',
        enrollmentsTabName: 'Treatment Plans',
        dashboard: {
            kpis: [
                { key: 'totalContacts', title: 'Total Patients', icon: 'Users' },
                { key: 'newContacts', title: 'New Patients (30d)', icon: 'Users' },
                { key: 'upcomingAppointments', title: 'Upcoming Appointments', icon: 'HeartPulse' },
            ],
            charts: [
                { dataKey: 'contactsByStatus', title: 'Patients by Status', type: 'pie' },
                { dataKey: 'appointmentsByMonth', title: 'Appointments This Year', type: 'bar' },
            ]
        }
    },
    Finance: {
        name: 'Finance',
        contactName: 'Client',
        contactNamePlural: 'Clients',
        organizationName: 'Firm',
        organizationNamePlural: 'Firms',
        teamMemberName: 'Advisor',
        teamMemberNamePlural: 'Advisors',
        customFields: [
            { id: 'clientId', label: 'Client ID', type: 'text' },
            { id: 'riskProfile', label: 'Risk Profile', type: 'select', options: ['Conservative', 'Moderate', 'Aggressive'] },
            { id: 'netWorth', label: 'Estimated Net Worth', type: 'number' },
        ],
        interactionTypes: ['Meeting', 'Call', 'Email', 'Note'],
        interactionCustomFields: [],
        structuredRecordTabName: 'Portfolio Reviews',
        structuredRecordTypes: [
            {
                id: 'portfolio_review',
                name: 'Portfolio Review',
                fields: [
                    { id: 'goals', label: 'Financial Goals', type: 'textarea' },
                    { id: 'recommendations', label: 'Recommendations', type: 'textarea' },
                    { id: 'nextSteps', label: 'Next Steps', type: 'textarea' },
                ],
            },
        ],
        ordersTabName: 'Trades',
        enrollmentsTabName: 'Financial Plans',
         dashboard: {
            kpis: [
                { key: 'totalContacts', title: 'Total Clients', icon: 'Users' },
                { key: 'newContacts', title: 'New Clients (30d)', icon: 'Landmark' },
                { key: 'upcomingAppointments', title: 'Upcoming Meetings', icon: 'Handshake' },
            ],
            charts: [
                { dataKey: 'contactsByStatus', title: 'Clients by Status', type: 'pie' },
                { dataKey: 'appointmentsByMonth', title: 'Meetings This Year', type: 'bar' },
            ]
        }
    },
    Legal: {
        name: 'Legal',
        contactName: 'Client',
        contactNamePlural: 'Clients',
        organizationName: 'Law Firm',
        organizationNamePlural: 'Law Firms',
        teamMemberName: 'Lawyer',
        teamMemberNamePlural: 'Lawyers',
        customFields: [
            { id: 'caseNumber', label: 'Case Number', type: 'text' },
            { id: 'caseType', label: 'Case Type', type: 'select', options: ['Litigation', 'Corporate', 'Family Law'] },
        ],
        interactionTypes: ['Meeting', 'Call', 'Email', 'Note'],
        interactionCustomFields: [],
        structuredRecordTabName: 'Case Notes',
        structuredRecordTypes: [
            {
                id: 'case_note', name: 'Case Note', fields: [
                    { id: 'caseSummary', label: 'Case Summary', type: 'textarea' },
                    { id: 'legalActions', label: 'Legal Actions Taken', type: 'textarea' }
                ]
            }
        ],
        ordersTabName: 'Billable Hours',
        enrollmentsTabName: 'Retainers',
         dashboard: {
            kpis: [
                { key: 'totalContacts', title: 'Total Clients', icon: 'Users' },
                { key: 'newContacts', title: 'New Cases (30d)', icon: 'ScrollText' },
                { key: 'upcomingAppointments', title: 'Upcoming Meetings', icon: 'Scale' },
            ],
            charts: [
                { dataKey: 'contactsByStatus', title: 'Clients by Status', type: 'pie' },
                { dataKey: 'appointmentsByMonth', title: 'Meetings This Year', type: 'bar' },
            ]
        }
    },
    Generic: {
        name: 'Generic',
        contactName: 'Contact',
        contactNamePlural: 'Contacts',
        organizationName: 'Company',
        organizationNamePlural: 'Companies',
        teamMemberName: 'Team Member',
        teamMemberNamePlural: 'Team Members',
        customFields: [
            { id: 'accountId', label: 'Account ID', type: 'text' },
            { id: 'lastContacted', label: 'Last Contacted', type: 'date' },
        ],
        interactionTypes: ['Meeting', 'Call', 'Email', 'Note'],
        interactionCustomFields: [],
        structuredRecordTabName: 'Records',
        structuredRecordTypes: [],
        ordersTabName: 'Orders',
        enrollmentsTabName: 'Programs',
        dashboard: {
            kpis: [
                { key: 'totalContacts', title: 'Total Contacts', icon: 'Users' },
                { key: 'newContacts', title: 'New Contacts (30d)', icon: 'Building' },
                { key: 'upcomingAppointments', title: 'Upcoming Meetings', icon: 'Briefcase' },
            ],
            charts: [
                { dataKey: 'contactsByStatus', title: 'Contacts by Status', type: 'pie' },
                { dataKey: 'appointmentsByMonth', title: 'Meetings This Year', type: 'bar' },
            ]
        }
    },
};