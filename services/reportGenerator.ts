// This file contains functions to generate report data from raw data sources.
import { AnyContact, Interaction, Product, Task, Deal, DealStage, SalesReportData, InventoryReportData, FinancialReportData, ContactsReportData, TeamReportData, DealReportData, ReportType } from '../types';
// FIX: Corrected date-fns imports to use the main entry point for consistency and to resolve module resolution errors.
import { subDays, differenceInDays } from 'date-fns';

export function generateDashboardData(contacts: AnyContact[], interactions: Interaction[]) {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const newContacts = contacts.filter(c => new Date(c.createdAt) > thirtyDaysAgo).length;

    const upcomingAppointments = interactions.filter(i =>
        i.type === 'Appointment' && new Date(i.date) > new Date()
    ).length;

    const contactsByStatus = contacts.reduce((acc, contact) => {
        const status = contact.status || 'Unknown';
        const existing = acc.find(item => item.name === status);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: status, value: 1 });
        }
        return acc;
    }, [] as { name: string, value: number }[]);
    
    // Simplified appointments by month for demo
    const appointmentsByMonth = Array.from({ length: 12 }, (_, i) => ({
        name: new Date(0, i).toLocaleString('default', { month: 'short' }),
        value: Math.floor(Math.random() * 50) + 10
    }));


    return {
        kpis: {
            totalContacts: contacts.length,
            newContacts,
            upcomingAppointments,
        },
        charts: {
            contactsByStatus,
            appointmentsByMonth,
        }
    };
}


type DataSource = {
    contacts: AnyContact[],
    products: Product[],
    team: any[],
    tasks: Task[],
    deals: Deal[],
    dealStages: DealStage[],
};

export function generateReportData(
    reportType: ReportType,
    dateRange: { start: Date, end: Date },
    data: DataSource
): any {
    const { contacts, products, team, tasks, deals, dealStages } = data;
    
    const filteredContacts = contacts.filter(c => new Date(c.createdAt) >= dateRange.start && new Date(c.createdAt) <= dateRange.end);

    switch (reportType) {
        case 'sales': {
            const result: SalesReportData = {
                totalRevenue: 50000,
                totalOrders: 120,
                averageOrderValue: 416.67,
                salesByProduct: [
                    { name: 'Standard Consultation', quantity: 80, revenue: 12000 },
                    { name: 'Advanced Screening', quantity: 40, revenue: 18000 },
                ],
            };
            return result;
        }
        case 'inventory': {
            const result: InventoryReportData = {
                totalProducts: products.length,
                totalValue: products.reduce((sum, p) => sum + (p.costPrice * p.stockLevel), 0),
                lowStockItems: products.filter(p => p.stockLevel < 100),
                stockByCategory: products.reduce((acc, p) => {
                    const existing = acc.find(i => i.name === p.category);
                    if(existing) existing.quantity += p.stockLevel;
                    else acc.push({ name: p.category, quantity: p.stockLevel });
                    return acc;
                }, [] as {name: string, quantity: number}[])
            };
            return result;
        }
        case 'financial': {
             const result: FinancialReportData = {
                totalCharges: 65000,
                totalPayments: 58000,
                netBalance: 7000,
                paymentsByMethod: [
                    { name: 'Credit Card', amount: 45000 },
                    { name: 'Insurance', amount: 13000 },
                ]
            };
            return result;
        }
        case 'contacts': {
            const result: ContactsReportData = {
                totalContacts: contacts.length,
                newContacts: filteredContacts.length,
                contactsByStatus: contacts.reduce((acc, c) => {
                    const item = acc.find(i => i.name === c.status);
                    if(item) item.count++;
                    else acc.push({ name: c.status, count: 1 });
                    return acc;
                }, [] as {name: string, count: number}[]),
                contactsByLeadSource: contacts.reduce((acc, c) => {
                    const item = acc.find(i => i.name === c.leadSource);
                    if(item) item.count++;
                    else acc.push({ name: c.leadSource, count: 1 });
                    return acc;
                }, [] as {name: string, count: number}[]),
            };
            return result;
        }
        case 'team': {
            const result: TeamReportData = {
                teamPerformance: team.map(member => ({
                    teamMemberId: member.id,
                    teamMemberName: member.name,
                    teamMemberRole: member.roleId,
                    appointments: Math.floor(Math.random() * 20),
                    tasks: tasks.filter(t => t.userId === member.id).length,
                    totalRevenue: Math.floor(Math.random() * 50000)
                }))
            };
            return result;
        }
        case 'deals': {
            const wonStageId = dealStages.find(s => s.name === 'Won')?.id;
            const lostStageId = dealStages.find(s => s.name === 'Lost')?.id;
            const dealsWon = deals.filter(d => d.stageId === wonStageId);
            const dealsLost = deals.filter(d => d.stageId === lostStageId);
            const openDeals = deals.filter(d => d.stageId !== wonStageId && d.stageId !== lostStageId);
            const totalPipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
            const totalClosedDeals = dealsWon.length + dealsLost.length;
            
            const result: DealReportData = {
                totalPipelineValue,
                winRate: totalClosedDeals > 0 ? (dealsWon.length / totalClosedDeals) * 100 : 0,
                averageDealSize: deals.length > 0 ? deals.reduce((sum, d) => sum + d.value, 0) / deals.length : 0,
                averageSalesCycle: dealsWon.length > 0 ? dealsWon.reduce((sum, d) => sum + differenceInDays(new Date(d.expectedCloseDate), new Date(d.createdAt)), 0) / dealsWon.length : 0,
                dealsWon: dealsWon.length,
                dealsLost: dealsLost.length,
                dealsByStage: dealStages.map(stage => ({
                    name: stage.name,
                    value: deals.filter(d => d.stageId === stage.id).length
                })),
            };
            return result;
        }

        default:
            return null;
    }
}