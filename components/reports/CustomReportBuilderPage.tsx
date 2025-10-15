import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { CustomReport, ReportDataSource, FilterCondition, ReportVisualization, CustomObjectDefinition } from '../../types';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Card } from '../ui/Card';
import MultiSelect from '../ui/MultiSelect';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import CustomReportDataTable from './CustomReportDataTable';
import { processReportData } from '../../utils/reportProcessor';
import CustomReportChart from './CustomReportChart';

interface CustomReportBuilderPageProps {
    reportToEdit: CustomReport | null;
    onClose: () => void;
}

const possibleJoins: Partial<Record<ReportDataSource, ReportDataSource[]>> = {
    contacts: ['deals', 'tickets', 'surveyResponses']
};

const CustomReportBuilderPage: React.FC<CustomReportBuilderPageProps> = ({ reportToEdit, onClose }) => {
    const { createCustomReportMutation, updateCustomReportMutation, customObjectDefsQuery } = useData();
    const { data: customObjectDefs = [] } = customObjectDefsQuery;
    const { authenticatedUser } = useAuth();
    const isNew = !reportToEdit;

    const [config, setConfig] = useState<CustomReport['config']>(() => reportToEdit?.config || {
        dataSource: 'contacts',
        columns: ['contactName', 'email', 'status'],
        filters: [],
        visualization: { type: 'table', metric: { type: 'count' } }
    });
    const [name, setName] = useState(reportToEdit?.name || '');

    useEffect(() => {
        if (reportToEdit) {
            setConfig(reportToEdit.config);
            setName(reportToEdit.name);
        }
    }, [reportToEdit]);
    
    const contactColumns = useMemo(() => ['id', 'organizationId', 'contactName', 'email', 'phone', 'status', 'leadSource', 'createdAt', 'leadScore', 'assignedToId'], []);
    const productColumns = useMemo(() => ['id', 'organizationId', 'name', 'sku', 'category', 'description', 'costPrice', 'salePrice', 'stockLevel'], []);
    const surveyResponseColumns = useMemo(() => ['id', 'surveyId', 'contactId', 'score', 'comment', 'respondedAt'], []);
    const dealColumns = useMemo(() => ['id', 'name', 'value', 'stageId', 'contactId', 'expectedCloseDate', 'createdAt', 'assignedToId'], []);
    const ticketColumns = useMemo(() => ['id', 'contactId', 'subject', 'status', 'priority', 'createdAt', 'assignedToId'], []);

    const numericContactColumns = useMemo(() => ['leadScore'], []);
    const numericProductColumns = useMemo(() => ['costPrice', 'salePrice', 'stockLevel'], []);
    const numericSurveyResponseColumns = useMemo(() => ['score'], []);
    const numericDealColumns = useMemo(() => ['value'], []);

    const getColumnsForSource = (source: ReportDataSource) => {
        switch(source) {
            case 'contacts': return contactColumns;
            case 'products': return productColumns;
            case 'surveyResponses': return surveyResponseColumns;
            case 'deals': return dealColumns;
            case 'tickets': return ticketColumns;
            default:
                const customObjectDef = (customObjectDefs as CustomObjectDefinition[]).find(def => def.id === source);
                return customObjectDef ? customObjectDef.fields.map(f => f.id) : [];
        }
    }
    
    const getNumericColumnsForSource = (source: ReportDataSource) => {
        switch(source) {
            case 'contacts': return numericContactColumns;
            case 'products': return numericProductColumns;
            case 'surveyResponses': return numericSurveyResponseColumns;
            case 'deals': return numericDealColumns;
            default:
                const customObjectDef = (customObjectDefs as CustomObjectDefinition[]).find(def => def.id === source);
                return customObjectDef ? customObjectDef.fields.filter(f => f.type === 'number').map(f => f.id) : [];
        }
    }

    const availableColumns = useMemo(() => {
        const primaryCols = getColumnsForSource(config.dataSource).map(c => `${config.dataSource}.${c}`);
        if (config.join?.with) {
            const joinedCols = getColumnsForSource(config.join.with).map(c => `${config.join!.with}.${c}`);
            return [...primaryCols, ...joinedCols];
        }
        return getColumnsForSource(config.dataSource);
    }, [config.dataSource, config.join]);
    
    const numericColumns = useMemo(() => {
        const primaryNumCols = getNumericColumnsForSource(config.dataSource).map(c => `${config.dataSource}.${c}`);
         if (config.join?.with) {
            const joinedNumCols = getNumericColumnsForSource(config.join.with).map(c => `${config.join!.with}.${c}`);
            return [...primaryNumCols, ...joinedNumCols];
        }
        return getNumericColumnsForSource(config.dataSource);
    }, [config.dataSource, config.join]);

    const { data: previewData, isLoading: isPreviewLoading } = useQuery({
        queryKey: ['reportPreview', config],
        queryFn: () => apiClient.generateCustomReport(config, authenticatedUser!.organizationId),
        enabled: !!authenticatedUser,
    });
    
    const chartData = useMemo(() => {
        if (previewData && config.visualization.type !== 'table') {
            return processReportData(previewData, config.visualization);
        }
        return [];
    }, [previewData, config.visualization]);
    
    const handleConfigChange = (path: string, value: any) => {
        setConfig(prev => {
            const keys = path.split('.');
            const newConfig = { ...prev };
            let current: any = newConfig;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            
            if (path === 'dataSource') {
                delete newConfig.join;
                if (value === 'contacts') newConfig.columns = ['contacts.contactName', 'contacts.email', 'contacts.status'];
                else if (value === 'products') newConfig.columns = ['products.name', 'products.sku', 'products.salePrice'];
                else if (value === 'surveyResponses') newConfig.columns = ['surveyResponses.surveyId', 'surveyResponses.contactId', 'surveyResponses.score'];
                else newConfig.columns = [];
                
                newConfig.filters = [];
                newConfig.visualization.groupByKey = undefined;
                newConfig.visualization.metric.column = undefined;
            }

            return newConfig;
        });
    };

    const addFilter = () => handleConfigChange('filters', [...config.filters, { field: availableColumns[0], operator: 'contains', value: '' }]);
    const removeFilter = (index: number) => handleConfigChange('filters', config.filters.filter((_, i) => i !== index));
    const updateFilter = (index: number, field: keyof FilterCondition, value: any) => {
        const newFilters = [...config.filters];
        (newFilters[index] as any)[field] = value;
        handleConfigChange('filters', newFilters);
    };

    const handleSave = () => {
        if (!name.trim()) return toast.error("Report name is required.");

        const reportData = {
            name,
            organizationId: authenticatedUser!.organizationId!,
            config
        };

        if (isNew) {
            createCustomReportMutation.mutate(reportData, { onSuccess: onClose });
        } else {
            updateCustomReportMutation.mutate({ ...reportToEdit!, ...reportData }, { onSuccess: onClose });
        }
    };

    const handleJoinChange = (joinWith: ReportDataSource) => {
        if (!joinWith) {
            handleConfigChange('join', undefined);
            return;
        }

        const joinKeyMap = {
            contacts: {
                deals: { on: 'id', equals: 'contactId' },
                tickets: { on: 'id', equals: 'contactId' },
                surveyResponses: { on: 'id', equals: 'contactId' }
            }
        };

        const joinInfo = (joinKeyMap as any)[config.dataSource]?.[joinWith];
        if (joinInfo) {
            handleConfigChange('join', { with: joinWith, ...joinInfo });
        }
    };


    const isPending = createCustomReportMutation.isPending || updateCustomReportMutation.isPending;

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Reports</Button>
                <div className="flex items-center gap-4">
                    <Input id="report-name" label="" placeholder="Enter Report Name..." value={name} onChange={e => setName(e.target.value)} className="w-72" />
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Report'}</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 p-6">
                    <h2 className="text-xl font-semibold mb-4">Report Configuration</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Select id="dataSource" label="Primary Data Source" value={config.dataSource} onChange={e => handleConfigChange('dataSource', e.target.value)}>
                                <option value="contacts">Contacts</option>
                                <option value="products">Products</option>
                                <option value="deals">Deals</option>
                                <option value="tickets">Tickets</option>
                                <option value="surveyResponses">Survey Responses</option>
                                {(customObjectDefs as CustomObjectDefinition[]).map(def => (
                                    <option key={def.id} value={def.id}>{def.namePlural}</option>
                                ))}
                            </Select>

                            <Select id="joinWith" label="Join with..." value={config.join?.with || ''} onChange={(e) => handleJoinChange(e.target.value as ReportDataSource)} disabled={!possibleJoins[config.dataSource]}>
                                <option value="">-- No Join --</option>
                                {(possibleJoins[config.dataSource] || []).map(source => (
                                    <option key={source} value={source} className="capitalize">{source}</option>
                                ))}
                            </Select>
                        </div>
                        
                        <MultiSelect label="Columns" options={availableColumns.map(c => ({ value: c, label: c }))} selectedValues={config.columns} onChange={cols => handleConfigChange('columns', cols)} />

                        <div>
                            <h4 className="text-sm font-medium mb-2">Filters</h4>
                            <div className="space-y-2">
                                {config.filters.map((filter, index) => (
                                    <div key={index} className="flex gap-1 items-end">
                                        <Select id={`filter-field-${index}`} label="" value={filter.field} onChange={e => updateFilter(index, 'field', e.target.value)} className="w-1/3">
                                            {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                                        </Select>
                                        <Select id={`filter-op-${index}`} label="" value={filter.operator} onChange={e => updateFilter(index, 'operator', e.target.value as any)} className="w-1/4">
                                            <option value="contains">contains</option><option value="is">is</option>
                                        </Select>
                                        <Input id={`filter-val-${index}`} label="" value={filter.value as string} onChange={e => updateFilter(index, 'value', e.target.value)} className="flex-grow" />
                                        <Button size="sm" variant="danger" onClick={() => removeFilter(index)}><Trash2 size={14}/></Button>
                                    </div>
                                ))}
                                <Button size="sm" variant="secondary" onClick={addFilter} leftIcon={<Plus size={14}/>}>Add Filter</Button>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium mb-2">Visualization</h4>
                             <Select id="vis-type" label="Display as" value={config.visualization.type} onChange={e => handleConfigChange('visualization.type', e.target.value)}>
                                <option value="table">Table</option><option value="bar">Bar Chart</option><option value="pie">Pie Chart</option><option value="line">Line Chart</option>
                            </Select>
                            {config.visualization.type !== 'table' && (
                                <div className="mt-2 space-y-2">
                                    <Select id="vis-group" label="Group By" value={config.visualization.groupByKey || ''} onChange={e => handleConfigChange('visualization.groupByKey', e.target.value)}>
                                        <option value="">Select a column...</option>
                                        {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                                    </Select>
                                    <div className="flex gap-2">
                                        <Select id="vis-metric-type" label="Metric" value={config.visualization.metric.type} onChange={e => handleConfigChange('visualization.metric.type', e.target.value)}>
                                            <option value="count">Count</option><option value="sum">Sum</option><option value="average">Average</option>
                                        </Select>
                                        {(config.visualization.metric.type === 'sum' || config.visualization.metric.type === 'average') && (
                                            <Select id="vis-metric-col" label="On Column" value={config.visualization.metric.column || ''} onChange={e => handleConfigChange('visualization.metric.column', e.target.value)}>
                                                <option value="">Select column...</option>
                                                {availableColumns.filter(c => numericColumns.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
                                            </Select>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </Card>

                <Card className="lg:col-span-2 p-6">
                    <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
                    {isPreviewLoading ? (
                        <div className="h-96 flex items-center justify-center">Loading preview...</div>
                    ) : !previewData || previewData.length === 0 ? (
                        <div className="h-96 flex items-center justify-center">No data matches your criteria.</div>
                    ) : config.visualization.type === 'table' ? (
                        <CustomReportDataTable data={previewData} />
                    ) : (
                        <CustomReportChart data={chartData} visualizationType={config.visualization.type} title={name} />
                    )}
                </Card>
            </div>
        </PageWrapper>
    );
};

export default CustomReportBuilderPage;
