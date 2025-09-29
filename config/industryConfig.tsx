// FIX: Imported IndustryConfig type.
import { IndustryConfig, Industry } from '../types';
import { Users, Briefcase, FileText, DollarSign, Activity, Scale, Shield, Landmark } from 'lucide-react';

export const industryConfigs: Record<string, IndustryConfig> = {
    Health: {
        name: 'Health',
        contactName: 'Patient',
        contactNamePlural: 'Patients',
        organizationName: 'Practice',
        organizationNamePlural: 'Practices',
        teamMemberName: 'Practitioner',
        teamMemberNamePlural: 'Practitioners',
        customFields: [
            { id: 'dob', label: 'Date of Birth', type: 'date' },
            { id: 'insuranceProvider', label: 'Insurance Provider', type: 'text' },
            { id: 'policyNumber', label: 'Policy Number', type: 'text' },
            { id: 'primaryCarePhysician', label: 'Primary Care Physician', type: 'text' },
            { id: 'emergencyContactName', label: 'Emergency Contact Name', type: 'text' },
            { id: 'emergencyContactPhone', label: 'Emergency Contact Phone', type: 'text' },
            { id: 'allergies', label: 'Allergies', type: 'textarea' },
        ],
        interactionTypes: ['Email', 'Call', 'Appointment', 'Note', 'Site Visit', 'Maintenance Request'],
        interactionCustomFields: [],
        structuredRecordTabName: 'Medical History',
        structuredRecordTypes: [
            {
                id: 'consultation', name: 'Consultation Note', fields: [
                    { id: 'symptoms', label: 'Symptoms', type: 'textarea' },
                    { id: 'diagnosis', label: 'Diagnosis', type: 'textarea' },
                    { id: 'treatmentPlan', label: 'Treatment Plan', type: 'textarea' },
                ]
            },
            {
                id: 'lab_result', name: 'Lab Result', fields: [
                    { id: 'test_name', label: 'Test Name', type: 'text' },
                    { id: 'result_value', label: 'Result Value', type: 'text' },
                    { id: 'reference_range', label: 'Reference Range', type: 'text' },
                ]
            }
        ],
        ordersTabName: "Billing",
        enrollmentsTabName: "Programs",
        dashboard: {
            kpis: [
                { key: 'totalContacts', title: 'Total Patients', icon: Users },
                { key: 'newContacts', title: 'New Patients (30d)', icon: Users },
                { key: 'upcomingAppointments', title: 'Upcoming Appointments', icon: Activity },
            ],
            charts: [
                { dataKey: 'contactsByStatus', title: 'Patients by Status', type: 'bar' },
                { dataKey: 'appointmentsByMonth', title: 'Appointments This Year', type: 'line' },
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
            { id: 'netWorth', label: 'Estimated Net Worth', type: 'number' },
            { id: 'riskProfile', label: 'Risk Profile', type: 'select', options: ['Conservative', 'Moderate', 'Aggressive'] },
            { id: 'investmentGoals', label: 'Investment Goals', type: 'textarea' },
        ],
        interactionTypes: ['Email', 'Call', 'Meeting', 'Note'],
        interactionCustomFields: [],
        structuredRecordTabName: 'Financial Records',
        structuredRecordTypes: [
            {
                id: 'portfolio_review', name: 'Portfolio Review', fields: [
                    { id: 'assets_total', label: 'Total Assets', type: 'number' },
                    { id: 'performance', label: 'Performance Notes', type: 'textarea' },
                ]
            }
        ],
        ordersTabName: "Fees & Invoices",
        enrollmentsTabName: "Services",
        dashboard: {
            kpis: [
                { key: 'totalContacts', title: 'Total Clients', icon: Users },
                { key: 'totalAUM', title: 'Total AUM', icon: DollarSign },
                { key: 'avgPortfolioSize', title: 'Avg. Portfolio Size', icon: Scale },
            ],
            charts: [
                { dataKey: 'aumByRiskProfile', title: 'AUM by Risk Profile', type: 'pie' },
                { dataKey: 'netInflow', title: 'Net Inflow This Year', type: 'line' },
            ]
        }
    },
    Legal: {
        name: 'Legal',
        contactName: 'Client',
        contactNamePlural: 'Clients',
        organizationName: 'Firm',
        organizationNamePlural: 'Firms',
        teamMemberName: 'Lawyer',
        teamMemberNamePlural: 'Lawyers',
        customFields: [
            { id: 'caseType', label: 'Case Type', type: 'text' },
            { id: 'opposingCounsel', label: 'Opposing Counsel', type: 'text' },
        ],
        interactionTypes: ['Email', 'Call', 'Meeting', 'Note'],
        interactionCustomFields: [],
        structuredRecordTabName: 'Case Files',
        structuredRecordTypes: [
            {
                id: 'case_update', name: 'Case Update', fields: [
                    { id: 'update_summary', label: 'Update Summary', type: 'textarea' },
                    { id: 'next_steps', label: 'Next Steps', type: 'textarea' },
                ]
            }
        ],
        ordersTabName: "Retainers & Billing",
        enrollmentsTabName: "Cases",
        dashboard: {
            kpis: [
                { key: 'totalContacts', title: 'Active Cases', icon: Briefcase },
                { key: 'totalBillableHours', title: 'Billable Hours (30d)', icon: DollarSign },
                { key: 'upcomingDeadlines', title: 'Upcoming Deadlines', icon: FileText },
            ],
            charts: [
                { dataKey: 'casesByType', title: 'Cases by Type', type: 'bar' },
                { dataKey: 'billableHours', title: 'Billable Hours This Year', type: 'line' },
            ]
        }
    },
    Generic: {
        name: 'Generic',
        contactName: 'Contact',
        contactNamePlural: 'Contacts',
        organizationName: 'Company',
        organizationNamePlural: 'Companies',
        teamMemberName: 'User',
        teamMemberNamePlural: 'Users',
        customFields: [
            { id: 'jobTitle', label: 'Job Title', type: 'text' },
            { id: 'department', label: 'Department', type: 'text' },
        ],
        interactionTypes: ['Email', 'Call', 'Meeting', 'Note'],
        interactionCustomFields: [],
        structuredRecordTabName: 'Records',
        structuredRecordTypes: [
            {
                id: 'general_note', name: 'General Note', fields: [
                    { id: 'subject', label: 'Subject', type: 'text' },
                    { id: 'details', label: 'Details', type: 'textarea' },
                ]
            }
        ],
        ordersTabName: "Orders",
        enrollmentsTabName: "Subscriptions",
        dashboard: {
            kpis: [
                { key: 'totalContacts', title: 'Total Contacts', icon: Users },
                { key: 'totalOrgs', title: 'Total Companies', icon: Briefcase },
                { key: 'newContacts', title: 'New Contacts (30d)', icon: Users },
            ],
            charts: [
                { dataKey: 'contactsByStatus', title: 'Contacts by Status', type: 'bar' },
                { dataKey: 'contactsBySource', title: 'Contacts by Lead Source', type: 'bar' },
            ]
        }
    }
};
