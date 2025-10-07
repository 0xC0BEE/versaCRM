import { ReportType, AnyReportData, AnyContact, Product, User, Task, Deal, DealStage, Interaction, SalesReportData, InventoryReportData, FinancialReportData, ContactsReportData, TeamReportData, DealReportData } from '../types';
// FIX: Changed the import for `subDays` to a separate import from its subpath to resolve the module export error, as per the established pattern in other files.
import { isWithinInterval } from 'date-fns';
import subDays from 'date-fns/subDays';

export function generateReportData(
    reportType: ReportType,
    dateRange: { start: Date; end: Date },
    data: {
        contacts: AnyContact[],
        products: Product[],
        team: User[],
        tasks: Task[],
        deals: Deal[],
        dealStages: DealStage[],
    }
): AnyReportData | null {
    
    const withinRange = (date: string | Date) => isWithinInterval(new Date(date), dateRange);

    switch (reportType) {
        case 'sales': {
            const relevantContacts = data.contacts.filter(c => c.orders && c.orders.some(o => withinRange(o.orderDate)));
            const orders = relevantContacts.flatMap(c => c.orders || []).filter(o => withinRange(o.orderDate) && o.status === 'Completed');
            const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
            const salesByProduct: { name: string, quantity: number, revenue: number }[] = [];
            orders.forEach(o => {
                o.lineItems.forEach(li => {
                    const product = data.products.find(p => p.id === li.productId);
                    if (product) {
                        const existing = salesByProduct.find(p => p.name === product.name);
                        const revenue = li.quantity * li.unitPrice;
                        if (existing) {
                            existing.quantity += li.quantity;
                            existing.revenue += revenue;
                        } else {
                            salesByProduct.push({ name: product.name, quantity: li.quantity, revenue });
                        }
                    }
                });
            });
            return {
                totalRevenue,
                totalOrders: orders.length,
                averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
                salesByProduct: salesByProduct.sort((a,b) => b.revenue - a.revenue),
            } as SalesReportData;
        }

        case 'inventory': {
            const totalValue = data.products.reduce((sum, p) => sum + (p.stockLevel * p.costPrice), 0);
            const stockByCategory = data.products.reduce((acc, p) => {
                const category = p.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + p.stockLevel;
                return acc;
            }, {} as Record<string, number>);
            
            return {
                totalProducts: data.products.length,
                totalValue,
                lowStockItems: data.products.filter(p => p.stockLevel < 100).sort((a,b) => a.stockLevel - b.stockLevel),
                stockByCategory: Object.entries(stockByCategory).map(([name, quantity]) => ({ name, quantity })),
            } as InventoryReportData;
        }

        case 'financial': {
             const relevantContacts = data.contacts.filter(c => c.transactions && c.transactions.some(t => withinRange(t.date)));
             const transactions = relevantContacts.flatMap(c => c.transactions || []).filter(t => withinRange(t.date));
             const totalCharges = transactions.filter(t => t.type === 'Charge').reduce((sum, t) => sum + t.amount, 0);
             const totalPayments = transactions.filter(t => t.type === 'Payment').reduce((sum, t) => sum + t.amount, 0);
             const paymentsByMethod = transactions.filter(t => t.type === 'Payment').reduce((acc, t) => {
                 acc[t.method] = (acc[t.method] || 0) + t.amount;
                 return acc;
             }, {} as Record<string, number>);
            
            return {
                totalCharges,
                totalPayments,
                netBalance: totalCharges - totalPayments, // Simple net for the period
                paymentsByMethod: Object.entries(paymentsByMethod).map(([name, amount]) => ({ name, amount })),
            } as FinancialReportData;
        }
        
        case 'contacts': {
            const newContacts = data.contacts.filter(c => withinRange(c.createdAt));
            const contactsByStatus = data.contacts.reduce((acc, c) => {
                acc[c.status] = (acc[c.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            const contactsByLeadSource = data.contacts.reduce((acc, c) => {
                const source = c.leadSource || 'Unknown';
                acc[source] = (acc[source] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return {
                totalContacts: data.contacts.length,
                newContacts: newContacts.length,
                contactsByStatus: Object.entries(contactsByStatus).map(([name, count]) => ({ name, count })),
                contactsByLeadSource: Object.entries(contactsByLeadSource).map(([name, count]) => ({ name, count })),
            } as ContactsReportData;
        }

        case 'team': {
            const teamPerformance = data.team.map(member => {
                 const memberTasks = data.tasks.filter(t => t.userId === member.id && withinRange(t.dueDate) && t.isCompleted);
                 const memberAppointments = data.contacts.flatMap(c => c.interactions || []).filter(i => i.userId === member.id && i.type === 'Appointment' && withinRange(i.date));
                 const memberDeals = data.deals.filter(d => d.assignedToId === member.id && d.stageId.includes('won') && withinRange(d.expectedCloseDate)); // simplified
                 const totalRevenue = memberDeals.reduce((sum, d) => sum + d.value, 0);
                
                return {
                    teamMemberId: member.id,
                    teamMemberName: member.name,
                    teamMemberRole: member.roleId,
                    appointments: memberAppointments.length,
                    tasks: memberTasks.length,
                    totalRevenue,
                };
            });
            return { teamPerformance } as TeamReportData;
        }

        case 'deals': {
            const closedWonStage = data.dealStages.find(s => s.name === 'Closed Won');
            const closedLostStage = data.dealStages.find(s => s.name === 'Closed Lost');
            
            const dealsInPeriod = data.deals.filter(d => withinRange(d.createdAt));
            const dealsWon = dealsInPeriod.filter(d => d.stageId === closedWonStage?.id).length;
            const dealsLost = dealsInPeriod.filter(d => d.stageId === closedLostStage?.id).length;

            const dealsByStage = data.deals.reduce((acc, d) => {
                const stageName = data.dealStages.find(s => s.id === d.stageId)?.name || 'Unknown';
                acc[stageName] = (acc[stageName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return {
                totalPipelineValue: data.deals.reduce((sum, d) => sum + d.value, 0),
                winRate: (dealsWon + dealsLost) > 0 ? (dealsWon / (dealsWon + dealsLost)) * 100 : 0,
                averageDealSize: data.deals.length > 0 ? data.deals.reduce((sum, d) => sum + d.value, 0) / data.deals.length : 0,
                averageSalesCycle: 28, // mock
                dealsWon,
                dealsLost,
                dealsByStage: Object.entries(dealsByStage).map(([name, value]) => ({ name, value })),
            } as DealReportData;
        }

        default:
            return null;
    }
}

export function generateDashboardData(
    contacts: AnyContact[],
    interactions: Interaction[]
): any {
    const totalContacts = contacts.length;
    const newContacts = contacts.filter(c => isWithinInterval(new Date(c.createdAt), { start: subDays(new Date(), 30), end: new Date() })).length;
    const upcomingAppointments = interactions.filter(i => i.type === 'Appointment' && new Date(i.date) > new Date()).length;
    
    const contactsByStatus = contacts.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const appointmentsByMonth = interactions.filter(i => i.type === 'Appointment').reduce((acc, i) => {
        const month = new Date(i.date).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        kpis: {
            totalContacts,
            newContacts,
            upcomingAppointments,
        },
        charts: {
            contactsByStatus: Object.entries(contactsByStatus).map(([name, value]) => ({ name, value })),
            appointmentsByMonth: Object.entries(appointmentsByMonth).map(([name, value]) => ({ name, value })),
        }
    };
}