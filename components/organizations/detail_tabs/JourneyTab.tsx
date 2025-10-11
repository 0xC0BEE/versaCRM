import React, { useMemo, useState } from 'react';
import { AnyContact, Deal, Ticket, Task, Interaction, Campaign, DealStage, CampaignEnrollment } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import { format } from 'date-fns';
import {
    Zap, Globe, ClipboardList, Handshake, LifeBuoy, CheckSquare, Phone, Mail, Users, FileText, Calendar, MapPin, Target, TrendingUp, TrendingDown, Eye, MousePointerClick
} from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import Button from '../../ui/Button';

interface JourneyTabProps {
    contact: AnyContact;
}

type JourneyItem = {
    date: Date;
    category: 'Sales' | 'Marketing' | 'Service' | 'General';
    type: string;
    title: string;
    description?: string;
};

const getJourneyItemIcon = (type: string) => {
    const iconProps = { className: "h-4 w-4 text-white" };
    switch (type) {
        case 'Contact Created': return { icon: <Zap {...iconProps} />, color: 'bg-yellow-500' };
        case 'Website Visit': return { icon: <Globe {...iconProps} />, color: 'bg-gray-500' };
        case 'Form Submission': return { icon: <ClipboardList {...iconProps} />, color: 'bg-teal-500' };
        case 'Campaign Enrollment': return { icon: <Target {...iconProps} />, color: 'bg-purple-500' };
        case 'Campaign Email Sent': return { icon: <Mail {...iconProps} />, color: 'bg-sky-600' };
        case 'Campaign Email Opened': return { icon: <Eye {...iconProps} />, color: 'bg-sky-500' };
        case 'Campaign Email Clicked': return { icon: <MousePointerClick {...iconProps} />, color: 'bg-sky-400' };
        case 'Deal Created': return { icon: <Handshake {...iconProps} />, color: 'bg-green-500' };
        case 'Deal Stage Changed': return { icon: <TrendingUp {...iconProps} />, color: 'bg-green-400' };
        case 'Deal Won': return { icon: <Handshake {...iconProps} />, color: 'bg-green-600' };
        case 'Deal Lost': return { icon: <TrendingDown {...iconProps} />, color: 'bg-red-500' };
        case 'Ticket Created': return { icon: <LifeBuoy {...iconProps} />, color: 'bg-blue-500' };
        case 'Ticket Closed': return { icon: <LifeBuoy {...iconProps} />, color: 'bg-blue-400' };
        case 'Task Completed': return { icon: <CheckSquare {...iconProps} />, color: 'bg-indigo-500' };
        case 'VoIP Call': return { icon: <Phone {...iconProps} />, color: 'bg-cyan-500' };
        case 'Email': return { icon: <Mail {...iconProps} />, color: 'bg-blue-400' };
        case 'Meeting': return { icon: <Users {...iconProps} />, color: 'bg-purple-500' };
        case 'Note': return { icon: <FileText {...iconProps} />, color: 'bg-slate-500' };
        case 'Appointment': return { icon: <Calendar {...iconProps} />, color: 'bg-pink-500' };
        default: return { icon: <Zap {...iconProps} />, color: 'bg-gray-400' };
    }
};

const JourneyTab: React.FC<JourneyTabProps> = ({ contact }) => {
    const { dealsQuery, ticketsQuery, tasksQuery, campaignsQuery, dealStagesQuery } = useData();
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['Sales', 'Marketing', 'Service', 'General']));

    const { data: deals = [] } = dealsQuery;
    const { data: tickets = [] } = ticketsQuery;
    const { data: tasks = [] } = tasksQuery;
    const { data: campaigns = [] } = campaignsQuery;
    const { data: dealStages = [] } = dealStagesQuery;

    const allItems = useMemo(() => {
        let items: JourneyItem[] = [];

        // 1. Contact Creation
        items.push({
            date: new Date(contact.createdAt),
            type: 'Contact Created',
            category: 'General',
            title: `Became a ${contact.status}`,
            description: `Source: ${contact.leadSource}`,
        });

        // 2. Interactions (includes manual logs, website visits, form submissions)
        (contact.interactions || []).forEach(interaction => {
            let category: JourneyItem['category'] = 'General';
            if (['Call', 'Email', 'Meeting', 'Note', 'Appointment'].includes(interaction.type)) category = 'Sales';
            if (['Form Submission', 'Site Visit'].includes(interaction.type)) category = 'Marketing';
            if (['Maintenance Request'].includes(interaction.type)) category = 'Service';

            items.push({
                date: new Date(interaction.date),
                type: interaction.type,
                category: category,
                title: interaction.type === 'Site Visit' ? `Viewed Page` : interaction.type,
                description: interaction.notes,
            });
        });
        
        // 3. Deals & Stage Changes
        (deals as Deal[])
            .filter(d => d.contactId === contact.id)
            .forEach(deal => {
                const stageMap = new Map((dealStages as DealStage[]).map(s => [s.id, s.name]));
                const currentStageName = stageMap.get(deal.stageId) || 'Unknown Stage';
                
                items.push({
                    date: new Date(deal.createdAt),
                    category: 'Sales',
                    type: 'Deal Created',
                    title: `Deal Created: ${deal.name}`,
                    description: `Value: ${deal.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
                });

                if (currentStageName === 'Won' || currentStageName === 'Lost') {
                    items.push({
                        date: new Date(deal.expectedCloseDate), // Using close date for this event
                        category: 'Sales',
                        type: `Deal ${currentStageName}`,
                        title: `Deal ${currentStageName}: ${deal.name}`,
                    });
                } else {
                     items.push({
                        date: new Date(deal.createdAt), // Simulate stage change after creation
                        category: 'Sales',
                        type: 'Deal Stage Changed',
                        title: `Deal moved to ${currentStageName}`,
                     });
                }
            });

        // 4. Tickets
        (tickets as Ticket[])
            .filter(t => t.contactId === contact.id)
            .forEach(ticket => {
                items.push({
                    date: new Date(ticket.createdAt),
                    category: 'Service',
                    type: 'Ticket Created',
                    title: `Ticket Opened: ${ticket.subject}`,
                    description: `Priority: ${ticket.priority}`,
                });
                if (ticket.status === 'Closed') {
                     items.push({
                        date: new Date(ticket.updatedAt),
                        category: 'Service',
                        type: 'Ticket Closed',
                        title: `Ticket Closed: ${ticket.subject}`,
                    });
                }
            });

        // 5. Tasks
        (tasks as Task[])
            .filter(t => t.contactId === contact.id && t.isCompleted)
            .forEach(task => {
                items.push({
                    date: new Date(task.dueDate),
                    category: 'General',
                    type: 'Task Completed',
                    title: `Task Completed: ${task.title}`,
                });
            });

        // 6. Campaign Enrollments & Milestones
        (contact.campaignEnrollments || []).forEach(enrollment => {
            const campaign = (campaigns as Campaign[]).find(c => c.id === enrollment.campaignId);
            if (!campaign) return;

            items.push({
                date: new Date(enrollment.waitUntil), // A proxy for enrollment date
                category: 'Marketing',
                type: 'Campaign Enrollment',
                title: `Enrolled in Journey: ${campaign.name}`,
            });

            // Find email interactions from this campaign
            (contact.interactions || []).filter(i => i.type === 'Email' && i.notes.includes(`(Campaign: ${campaign.name})`)).forEach(email => {
                items.push({
                    date: new Date(email.date),
                    category: 'Marketing',
                    type: 'Campaign Email Sent',
                    title: `Email Sent from "${campaign.name}"`,
                    description: email.notes.match(/Subject: (.*)/)?.[1]
                });
                if (email.openedAt) {
                    items.push({
                        date: new Date(email.openedAt),
                        category: 'Marketing',
                        type: 'Campaign Email Opened',
                        title: `Opened Email from "${campaign.name}"`,
                    });
                }
                 if (email.clickedAt) {
                    items.push({
                        date: new Date(email.clickedAt),
                        category: 'Marketing',
                        type: 'Campaign Email Clicked',
                        title: `Clicked Link in Email from "${campaign.name}"`,
                    });
                }
            });
        });

        return items.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [contact, deals, tickets, tasks, campaigns, dealStages]);

    const toggleFilter = (filter: string) => {
        setActiveFilters(prev => {
            const newFilters = new Set(prev);
            if (newFilters.has(filter)) {
                newFilters.delete(filter);
            } else {
                newFilters.add(filter);
            }
            return newFilters;
        });
    };

    const filteredItems = useMemo(() => {
        return allItems.filter(item => activeFilters.has(item.category));
    }, [allItems, activeFilters]);

    const isLoading = dealsQuery.isLoading || ticketsQuery.isLoading || tasksQuery.isLoading || campaignsQuery.isLoading;

    if (isLoading) {
        return <div className="p-8 flex justify-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1 pr-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Customer Journey</h4>
                <div className="flex gap-2">
                    {['Sales', 'Marketing', 'Service', 'General'].map(filter => (
                        <Button
                            key={filter}
                            size="sm"
                            variant={activeFilters.has(filter) ? 'secondary' : 'outline'}
                            onClick={() => toggleFilter(filter)}
                        >
                            {filter}
                        </Button>
                    ))}
                </div>
            </div>
            {filteredItems.length > 0 ? (
                <div className="flow-root">
                    <ul className="-mb-8">
                        {filteredItems.map((item, itemIdx) => {
                            const { icon, color } = getJourneyItemIcon(item.type);
                            return (
                                <li key={itemIdx}>
                                    <div className="relative pb-8">
                                        {itemIdx !== filteredItems.length - 1 ? (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border-subtle" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ${color}`}>
                                                    {icon}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-text-primary font-medium">{item.title}</p>
                                                    {item.description && <p className="mt-1 text-sm text-text-secondary truncate">{item.description.split('\n')[0]}</p>}
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-text-secondary">
                                                    <time dateTime={item.date.toISOString()}>{format(item.date, 'PP')}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-12 text-text-secondary">
                    <p>No journey events match your selected filters.</p>
                </div>
            )}
        </div>
    );
};

export default JourneyTab;
