import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { useData } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import KpiCard from './KpiCard';
import { Card } from '../ui/Card';
import DynamicChart from './DynamicChart';
import AiInsightsCard from './AiInsightsCard';
import TeamMemberDashboard from './TeamMemberDashboard';
import ContactCard from './ContactCard';
import ReviewPromptCard from './ReviewPromptCard';
import Tabs from '../ui/Tabs';
import ContactDetailModal from '../organizations/ContactDetailModal';
import { AnyContact, CustomReport, DashboardLayout, DashboardWidget as WidgetType } from '../../types';
import DashboardWidget from './DashboardWidget';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { defaultLayouts } from '../../config/layouts';
import useLocalStorage from '../../hooks/useLocalStorage';
import Button from '../ui/Button';
import { Plus, Edit, Save, RefreshCw } from 'lucide-react';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const ResponsiveGridLayout = WidthProvider(Responsive);

type Layouts = { [key: string]: DashboardLayout[] };

const DashboardPage: React.FC = () => {
    const { authenticatedUser, hasPermission } = useAuth();
    const { industryConfig, setCurrentPage, setReportToEditId } = useApp();
    const { dashboardDataQuery, contactsQuery, customReportsQuery, dashboardWidgetsQuery, removeDashboardWidgetMutation, addDashboardWidgetMutation } = useData();

    const [userLayouts, setUserLayouts] = useLocalStorage<Record<string, Layouts>>('dashboard-layouts', {});
    const [activeLayoutKey, setActiveLayoutKey] = useLocalStorage<string>('active-dashboard-layout', 'standard');
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Organization');

    const { data: dashboardData, isLoading: isDashboardLoading } = dashboardDataQuery;
    const { data: contacts = [], isLoading: isContactsLoading } = contactsQuery;
    const { data: customReports = [] } = customReportsQuery;
    const { data: widgets = [], isLoading: isWidgetsLoading } = dashboardWidgetsQuery;
    
    const canSeeOrgDashboard = hasPermission('settings:access');

    const currentLayouts = useMemo(() => {
        const layoutsForActiveKey = userLayouts[activeLayoutKey] || defaultLayouts[activeLayoutKey];
        const allWidgetIds = new Set([
            ...industryConfig.dashboard.kpis.map(k => `kpi-${k.key}`),
            ...industryConfig.dashboard.charts.map(c => `chart-${c.dataKey}`),
            'ai-insights', 'featured-contact', 'review-prompt',
            ...widgets.map((w: WidgetType) => w.widgetId)
        ]);
        const filteredLayouts: Layouts = {};
        for (const breakpoint in layoutsForActiveKey) {
            filteredLayouts[breakpoint] = layoutsForActiveKey[breakpoint].filter(item => allWidgetIds.has(item.i));
        }
        return filteredLayouts;
    }, [userLayouts, activeLayoutKey, widgets, industryConfig]);


    const onLayoutChange = (layout: DashboardLayout[], layouts: Layouts) => {
        if (isEditMode) {
            setUserLayouts(prev => ({ ...prev, [activeLayoutKey]: layouts }));
        }
    };
    
    const handleLayoutKeyChange = (key: string) => {
        setIsEditMode(false);
        setActiveLayoutKey(key);
    };
    
    const handleResetLayout = () => {
        if (window.confirm("Are you sure you want to reset this layout to its default?")) {
            setUserLayouts(prev => {
                const newLayouts = { ...prev };
                delete newLayouts[activeLayoutKey];
                return newLayouts;
            });
            toast.success("Layout reset to default.");
        }
    }

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<AnyContact | null>(null);

    const featuredContact = contacts.length > 0 ? contacts[0] : null;
    const requiresReviewContact = contacts.length > 1 ? contacts[1] : null;

    const openContactModal = (contact: AnyContact) => {
        setSelectedContact(contact);
        setIsDetailModalOpen(true);
    };

    const renderWidget = (widgetId: string) => {
        if (widgetId.startsWith('kpi-')) {
            const kpiKey = widgetId.replace('kpi-', '');
            const kpiConfig = industryConfig.dashboard.kpis.find(k => k.key === kpiKey);
            if (!kpiConfig) return null;
            return <KpiCard title={kpiConfig.title} value={dashboardData?.kpis[kpiKey as keyof typeof dashboardData.kpis] ?? 0} iconName={kpiConfig.icon} />;
        }
        if (widgetId.startsWith('chart-')) {
            const chartKey = widgetId.replace('chart-', '');
            const chartConfig = industryConfig.dashboard.charts.find(c => c.dataKey === chartKey);
            if (!chartConfig) return null;
            return <DynamicChart title={chartConfig.title} type={chartConfig.type} data={dashboardData?.charts[chartKey as keyof typeof dashboardData.charts] ?? []} />;
        }
        switch(widgetId) {
            case 'ai-insights': return <AiInsightsCard dashboardData={dashboardData} isLoading={isDashboardLoading} />;
            case 'featured-contact': return featuredContact ? <ContactCard contact={featuredContact} aiSuggestion="AI Suggestion: Time to reconnect." onEmailClick={() => openContactModal(featuredContact)} /> : null;
            case 'review-prompt': return requiresReviewContact ? <ReviewPromptCard contact={requiresReviewContact} onReviewClick={() => openContactModal(requiresReviewContact)} /> : null;
            default:
                const customWidget = widgets.find((w: WidgetType) => w.widgetId === widgetId);
                if (customWidget) {
                    return <DashboardWidget widget={customWidget} isEditMode={isEditMode} onRemove={removeWidget} />;
                }
                return <Card className="h-full items-center justify-center"><p>Unknown Widget: {widgetId}</p></Card>;
        }
    };
    
    const removeWidget = (widgetIdToRemove: string) => {
        const widget = widgets.find((w: WidgetType) => w.widgetId === widgetIdToRemove);
        if (widget) {
            removeDashboardWidgetMutation.mutate(widget.id);
        }
        
        const newLayouts: Layouts = {};
        for (const breakpoint in currentLayouts) {
            newLayouts[breakpoint] = currentLayouts[breakpoint].filter(item => item.i !== widgetIdToRemove);
        }
        setUserLayouts(prev => ({ ...prev, [activeLayoutKey]: newLayouts }));
    };

    const addWidget = (reportId: string) => {
        addDashboardWidgetMutation.mutate(reportId, {
            onSuccess: (newWidget) => {
                const newLayouts = { ...currentLayouts };
                const newLayoutItemBase = { i: newWidget.widgetId, y: Infinity };

                newLayouts.lg = [...(newLayouts.lg || []), { ...newLayoutItemBase, x: (newLayouts.lg.length * 6) % 12, w: 6, h: 8 }];
                newLayouts.md = [...(newLayouts.md || []), { ...newLayoutItemBase, x: (newLayouts.md.length * 5) % 10, w: 5, h: 8 }];
                newLayouts.sm = [...(newLayouts.sm || []), { ...newLayoutItemBase, x: 0, w: 6, h: 8 }];
                newLayouts.xs = [...(newLayouts.xs || []), { ...newLayoutItemBase, x: 0, w: 4, h: 8 }];
                newLayouts.xxs = [...(newLayouts.xxs || []), { ...newLayoutItemBase, x: 0, w: 2, h: 8 }];
                
                setUserLayouts(prev => ({ ...prev, [activeLayoutKey]: newLayouts }));
                setIsAddWidgetModalOpen(false);
            }
        });
    }

    const availableReports = useMemo(() => {
        const existingWidgetReportIds = new Set(widgets.map((w: WidgetType) => w.reportId));
        return (customReports as CustomReport[]).filter(r => !existingWidgetReportIds.has(r.id));
    }, [customReports, widgets]);
    
    const allItems = useMemo(() => {
        const itemIds = new Set<string>();
        for (const breakpoint in currentLayouts) {
            const layout = currentLayouts[breakpoint];
            layout.forEach(item => itemIds.add(item.i));
        }
        return Array.from(itemIds);
    }, [currentLayouts]);

    const isLoading = isDashboardLoading || isContactsLoading || isWidgetsLoading;

    if (!canSeeOrgDashboard) {
        return <TeamMemberDashboard />;
    }

    const renderOrgDashboard = () => (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-text-heading">Organization Dashboard</h1>
                <div className="flex items-center gap-2">
                    {isEditMode ? (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => setIsAddWidgetModalOpen(true)} leftIcon={<Plus size={14} />}>Add Widget</Button>
                            <Button size="sm" variant="secondary" onClick={handleResetLayout} leftIcon={<RefreshCw size={14}/>}>Reset Layout</Button>
                            <Button size="sm" onClick={() => setIsEditMode(false)} leftIcon={<Save size={14}/>}>Save Layout</Button>
                        </>
                    ) : (
                        <>
                            <Select id="layout-select" label="" value={activeLayoutKey} onChange={e => handleLayoutKeyChange(e.target.value)} size="sm" className="w-40">
                                <option value="standard">Standard View</option>
                                <option value="analytics">Analytics Focus</option>
                                <option value="compact">Compact View</option>
                            </Select>
                            <Button size="sm" variant="secondary" onClick={() => setIsEditMode(true)} leftIcon={<Edit size={14} />}>Edit Layout</Button>
                        </>
                    )}
                </div>
            </div>
            
            {isLoading ? <LoadingSpinner /> : (
                <ResponsiveGridLayout
                    className={`layout ${isEditMode ? 'is-editing' : ''}`}
                    layouts={currentLayouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={30}
                    onLayoutChange={onLayoutChange}
                    isDraggable={isEditMode}
                    isResizable={isEditMode}
                    margin={[16, 16]}
                    containerPadding={[0, 0]}
                >
                    {allItems.map(itemId => (
                        <div key={itemId}>
                           {renderWidget(itemId)}
                        </div>
                    ))}
                </ResponsiveGridLayout>
            )}
        </>
    );

    return (
        <PageWrapper>
            <div className="mb-6 border-b border-border-subtle">
                <Tabs tabs={["Organization", "My Dashboard"]} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            
            {activeTab === 'Organization' ? renderOrgDashboard() : <TeamMemberDashboard isTabbedView />}

            <Modal
                isOpen={isAddWidgetModalOpen}
                onClose={() => setIsAddWidgetModalOpen(false)}
                title="Add Widget to Dashboard"
            >
                <div className="max-h-96 overflow-y-auto">
                    {availableReports.length > 0 ? (
                        <div className="space-y-2">
                            {availableReports.map(report => (
                                <div key={report.id} className="p-3 flex justify-between items-center bg-hover-bg rounded-md">
                                    <p className="font-medium">{report.name}</p>
                                    <Button size="sm" variant="secondary" onClick={() => addWidget(report.id)} leftIcon={<Plus size={14} />}>Add</Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <p>All your custom reports are already on the dashboard.</p>
                            <Button size="sm" variant="secondary" onClick={() => { setIsAddWidgetModalOpen(false); setCurrentPage('Reports'); setReportToEditId(null); }} className="mt-4">Create a New Report</Button>
                        </div>
                    )}
                </div>
            </Modal>
            
            <ContactDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                contact={selectedContact}
                onSave={() => {}}
                onDelete={() => {}}
                isSaving={false}
                isDeleting={false}
            />
        </PageWrapper>
    );
};

export default DashboardPage;
