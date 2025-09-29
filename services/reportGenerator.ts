// FIX: Imported correct types from types.ts
import { ReportType, AnyReportData, Industry, AnyContact, Product, Transaction, User, Task, Interaction, Organization } from '../types';
import { isWithinInterval } from 'date-fns';

type MockDataStore = {
    organizations: Organization[];
    contacts: AnyContact[];
    products: Product[];
    users: User[];
    tasks: Task[];
    interactions: Interaction[];
};

export const generateReportData = (
    store: MockDataStore,
    reportType: ReportType,
    dateRange: { start: Date; end: Date },
    industry: Industry,
    organizationId?: string
): AnyReportData => {

    // Filter all data by organization or industry
    let relevantOrgIds: string[];
    if (organizationId) {
        relevantOrgIds = [organizationId];
    } else {
        relevantOrgIds = store.organizations
            .filter(o => o.industry === industry)
            .map(o => o.id);
    }
    
    const industryContacts = store.contacts.filter(c => relevantOrgIds.includes(c.organizationId));
    const industryProducts = store.products.filter(p => relevantOrgIds.includes(p.organizationId));
    const industryUsers = store.users.filter(u => u.organizationId && relevantOrgIds.includes(u.organizationId));
    const industryInteractions = store.interactions.filter(i => relevantOrgIds.includes(i.organizationId));
    const industryUserIds = industryUsers.map(u => u.id);
    const industryTasks = store.tasks.filter(t => industryUserIds.includes(t.userId));


    const contactsInDateRange = industryContacts.filter(c =>
        isWithinInterval(new Date(c.createdAt), dateRange)
    );

    switch (reportType) {
        case 'sales': {
            const ordersInDateRange = industryContacts
                .flatMap(c => c.orders || [])
                .filter(o => isWithinInterval(new Date(o.orderDate), dateRange) && o.status === 'Completed');
            
            const totalRevenue = ordersInDateRange.reduce((sum, o) => sum + o.total, 0);
            const salesByProduct: { [key: string]: { name: string, quantity: number, revenue: number } } = {};

            ordersInDateRange.forEach(order => {
                order.lineItems.forEach(item => {
                    const product = industryProducts.find(p => p.id === item.productId);
                    const productName = product ? product.name : item.description;
                    if (!salesByProduct[productName]) {
                        salesByProduct[productName] = { name: productName, quantity: 0, revenue: 0 };
                    }
                    salesByProduct[productName].quantity += item.quantity;
                    salesByProduct[productName].revenue += item.quantity * item.unitPrice;
                });
            });

            return {
                totalRevenue,
                totalOrders: ordersInDateRange.length,
                averageOrderValue: ordersInDateRange.length > 0 ? totalRevenue / ordersInDateRange.length : 0,
                salesByProduct: Object.values(salesByProduct),
            };
        }
        case 'inventory': {
            return {
                totalProducts: industryProducts.length,
                totalValue: industryProducts.reduce((sum, p) => sum + (p.costPrice * p.stockLevel), 0),
                lowStockItems: industryProducts.filter(p => p.stockLevel < 100),
                stockByCategory: industryProducts.reduce((acc, p) => {
                    const category = acc.find(item => item.name === p.category);
                    if (category) {
                        category.quantity += p.stockLevel;
                    } else {
                        acc.push({ name: p.category, quantity: p.stockLevel });
                    }
                    return acc;
                }, [] as { name: string, quantity: number }[]),
            };
        }
        case 'financial': {
             const transactionsInDateRange = industryContacts
                .flatMap(c => c.transactions || [])
                .filter(t => isWithinInterval(new Date(t.date), dateRange));
            
            const totalCharges = transactionsInDateRange.filter(t => t.type === 'Charge').reduce((sum, t) => sum + t.amount, 0);
            const totalPayments = transactionsInDateRange.filter(t => t.type === 'Payment').reduce((sum, t) => sum + t.amount, 0);

            return {
                totalCharges,
                totalPayments,
                netBalance: totalCharges - totalPayments,
                paymentsByMethod: transactionsInDateRange
                    .filter(t => t.type === 'Payment')
                    .reduce((acc, t) => {
                        const method = acc.find(item => item.name === t.method);
                        if (method) {
                            method.amount += t.amount;
                        } else {
                            acc.push({ name: t.method, amount: t.amount });
                        }
                        return acc;
                    }, [] as { name: Transaction['method'], amount: number }[]),
            };
        }
        case 'contacts': {
            return {
                totalContacts: industryContacts.length,
                newContacts: contactsInDateRange.length,
                contactsByStatus: industryContacts.reduce((acc, c) => {
                    const status = acc.find(item => item.name === c.status);
                    if (status) {
                        status.count++;
                    } else {
                        acc.push({ name: c.status, count: 1 });
                    }
                    return acc;
                }, [] as { name: string, count: number }[]),
                contactsByLeadSource: industryContacts.reduce((acc, c) => {
                    const source = acc.find(item => item.name === c.leadSource);
                    if (source) {
                        source.count++;
                    } else {
                        acc.push({ name: c.leadSource, count: 1 });
                    }
                    return acc;
                }, [] as { name: string, count: number }[]),
            };
        }
        case 'team': {
            return {
                teamPerformance: industryUsers
                .filter(u => u.role === 'Team Member' || u.role === 'Organization Admin')
                .map(user => {
                    const userInteractions = industryInteractions.filter(i => i.userId === user.id && isWithinInterval(new Date(i.date), dateRange));
                    const userTasks = industryTasks.filter(t => t.userId === user.id && isWithinInterval(new Date(t.dueDate), dateRange));
                    
                    const interactedContactIds = [...new Set(userInteractions.map(i => i.contactId))];
                    
                    const userOrders = industryContacts
                        .filter(c => interactedContactIds.includes(c.id))
                        .flatMap(c => c.orders || [])
                        .filter(o => isWithinInterval(new Date(o.orderDate), dateRange));

                    return {
                        teamMemberId: user.id,
                        teamMemberName: user.name,
                        teamMemberRole: user.role,
                        appointments: userInteractions.filter(i => i.type === 'Meeting' || i.type === 'Appointment').length,
                        tasks: userTasks.length,
                        totalRevenue: userOrders.reduce((sum, o) => sum + o.total, 0),
                    }
                })
            }
        }
        default:
            throw new Error(`Report type "${reportType}" not recognized.`);
    }
};
