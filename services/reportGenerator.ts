import { AnyContact, Product, User, Task, ReportType, AnyReportData, SalesReportData, InventoryReportData, FinancialReportData, ContactsReportData, TeamReportData, DashboardData, Interaction } from '../types';
import { isWithinInterval, subDays } from 'date-fns';

export const generateDashboardData = (
    dateRange: { start: Date; end: Date },
    contacts: AnyContact[],
    interactions: Interaction[]
): DashboardData => {
    
    const kpis = {
        totalContacts: contacts.length,
        newContacts: contacts.filter(c => isWithinInterval(new Date(c.createdAt), dateRange)).length,
        upcomingAppointments: interactions.filter(i => (i.type === 'Appointment' || i.type === 'Meeting') && new Date(i.date) > new Date()).length,
    };
    
    const charts = {
        contactsByStatus: Object.entries(contacts.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
        appointmentsByMonth: [...Array(12)].map((_, i) => ({
            name: new Date(0, i).toLocaleString('default', { month: 'short' }),
            value: interactions.filter(item => (item.type === 'Appointment' || item.type === 'Meeting') && new Date(item.date).getMonth() === i).length,
        })),
    };
    
    return { kpis, charts };
};


export const generateReportData = (
    reportType: ReportType,
    dateRange: { start: Date; end: Date },
    contacts: AnyContact[],
    products: Product[],
    team: User[],
    tasks: Task[]
): AnyReportData => {
    switch (reportType) {
        case 'sales':
            return generateSalesReport(dateRange, contacts);
        case 'inventory':
            return generateInventoryReport(products);
        case 'financial':
            return generateFinancialReport(dateRange, contacts);
        case 'contacts':
            return generateContactsReport(dateRange, contacts);
        case 'team':
            return generateTeamReport(dateRange, contacts, team, tasks);
        default:
            throw new Error(`Unknown report type: ${reportType}`);
    }
};

function generateSalesReport(dateRange: { start: Date; end: Date }, contacts: AnyContact[]): SalesReportData {
    const ordersInPeriod = contacts.flatMap(c => c.orders)
        .filter(o => o.status === 'Completed' && isWithinInterval(new Date(o.orderDate), dateRange));

    const totalRevenue = ordersInPeriod.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = ordersInPeriod.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const salesByProduct: Record<string, { name: string; quantity: number; revenue: number }> = {};
    ordersInPeriod.forEach(order => {
        order.lineItems.forEach(item => {
            if (!salesByProduct[item.productId]) {
                salesByProduct[item.productId] = { name: item.description, quantity: 0, revenue: 0 };
            }
            salesByProduct[item.productId].quantity += item.quantity;
            salesByProduct[item.productId].revenue += item.quantity * item.unitPrice;
        });
    });

    return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        salesByProduct: Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue),
    };
}

function generateInventoryReport(products: Product[]): InventoryReportData {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.costPrice * p.stockLevel), 0);
    const lowStockItems = products.filter(p => p.stockLevel < 100).map(({ id, name, sku, stockLevel }) => ({ id, name, sku, stockLevel }));
    
    const stockByCategory: Record<string, { name: string; quantity: number }> = {};
    products.forEach(p => {
        const category = p.category || 'Uncategorized';
        if (!stockByCategory[category]) {
            stockByCategory[category] = { name: category, quantity: 0 };
        }
        stockByCategory[category].quantity += p.stockLevel;
    });

    return {
        totalProducts,
        totalValue,
        lowStockItems,
        stockByCategory: Object.values(stockByCategory),
    };
}

function generateFinancialReport(dateRange: { start: Date; end: Date }, contacts: AnyContact[]): FinancialReportData {
    const transactionsInPeriod = contacts.flatMap(c => c.transactions)
        .filter(t => isWithinInterval(new Date(t.date), dateRange));

    const totalCharges = transactionsInPeriod
        .filter(t => t.type === 'Charge')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalPayments = transactionsInPeriod
        .filter(t => t.type === 'Payment' || t.type === 'Credit')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRefunds = transactionsInPeriod
        .filter(t => t.type === 'Refund')
        .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalCharges - (totalPayments - totalRefunds);

    const paymentsByMethod: Record<string, { name: string; amount: number }> = {};
    transactionsInPeriod.filter(t => t.type === 'Payment').forEach(t => {
        if (!paymentsByMethod[t.method]) {
            paymentsByMethod[t.method] = { name: t.method, amount: 0 };
        }
        paymentsByMethod[t.method].amount += t.amount;
    });

    return {
        totalCharges,
        totalPayments,
        netBalance,
        paymentsByMethod: Object.values(paymentsByMethod),
    };
}

function generateContactsReport(dateRange: { start: Date; end: Date }, contacts: AnyContact[]): ContactsReportData {
    const totalContacts = contacts.length;
    const newContacts = contacts.filter(c => isWithinInterval(new Date(c.createdAt), dateRange)).length;
    
    const contactsByStatus: Record<string, { name: string; count: number }> = {};
    contacts.forEach(c => {
        if (!contactsByStatus[c.status]) {
            contactsByStatus[c.status] = { name: c.status, count: 0 };
        }
        contactsByStatus[c.status].count++;
    });
    
    const contactsByLeadSource: Record<string, { name: string; count: number }> = {};
    contacts.forEach(c => {
        if (!contactsByLeadSource[c.leadSource]) {
            contactsByLeadSource[c.leadSource] = { name: c.leadSource, count: 0 };
        }
        contactsByLeadSource[c.leadSource].count++;
    });

    return {
        totalContacts,
        newContacts,
        contactsByStatus: Object.values(contactsByStatus),
        contactsByLeadSource: Object.values(contactsByLeadSource),
    };
}

function generateTeamReport(dateRange: { start: Date; end: Date }, contacts: AnyContact[], team: User[], tasks: Task[]): TeamReportData {
    const teamPerformance = team.map(member => {
        const interactionsInPeriod = contacts.flatMap(c => c.interactions).filter(i => i.userId === member.id && isWithinInterval(new Date(i.date), dateRange));
        const appointments = interactionsInPeriod.filter(i => i.type === 'Appointment' || i.type === 'Meeting').length;
        const completedTasks = tasks.filter(t => t.userId === member.id && isWithinInterval(new Date(t.dueDate), dateRange) && t.isCompleted).length;
        // Mock revenue generation - in real app this would be complex
        const totalRevenue = appointments * 500 + completedTasks * 50; 

        return {
            teamMemberId: member.id,
            teamMemberName: member.name,
            teamMemberRole: member.role,
            appointments,
            tasks: completedTasks,
            totalRevenue,
        };
    });

    return { teamPerformance };
}