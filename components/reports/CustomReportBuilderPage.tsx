
import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import MultiSelect from '../ui/MultiSelect';
import { ArrowLeft, Plus, Trash2, BarChart, Table, PieChart as PieIcon, LineChart as LineIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { ReportDataSource, FilterCondition, ReportVisualization, CustomReport } from '../../types';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import CustomReportDataTable from './CustomReportDataTable';
import { processReportData } from '../../utils/reportProcessor';
import CustomReportChart from './CustomReportChart';

const dataSourceOptions: { value: ReportDataSource; label: string }[] = [
    { value: 'contacts', label: 'Contacts' },
    { value: 'products', label: 'Products' },
];

const contactColumns = ['id', 'contactName', 'email', 'phone', 'status', 'leadSource', 'createdAt'];
const productColumns = ['id', 'name', 'sku', 'category', 'costPrice', 'salePrice', 'stockLevel'];

const operatorOptions = [
    { id: 'is', name: 'Is' }, { id: 'is_not', name: 'Is Not' },
    { id: 'contains', name: 'Contains' }, { id: 'does_not_contain', name: 'Does Not Contain' },
];

interface CustomReportBuilderPageProps {
    onClose: () => void;
}

const CustomReportBuilderPage: React.FC<CustomReportBuilderPageProps> = ({ onClose }) => {
    const { authenticatedUser } = useAuth();
    const { createCustomReportMutation } = useData();

    const [name, setName] = useState('');
    const [dataSource, setDataSource] = useState<ReportDataSource>('contacts');
    const [columns, setColumns] = useState<string[]>(['id', 'contactName', 'status']);
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [visualization, setVisualization] = useState<ReportVisualization>({
        type: 'table',
        metric: { type: 'count' },
    });
    
    const availableColumns = useMemo(() => {
        return dataSource === 'contacts' ? contactColumns : productColumns;
    }, [dataSource]);

    const { data: previewData, isLoading: isPreviewLoading } = useQuery({
        queryKey: ['reportPreview', dataSource, columns, filters, visualization, authenticatedUser?.organizationId],
        queryFn: () => apiClient.generateCustomReport({ dataSource, columns, filters, visualization }, authenticatedUser!.organizationId!),
        enabled: !!authenticatedUser?.organizationId,
    });

    const chartPreviewData = useMemo(() => {
        if (!previewData || visualization.type === 'table') return [];
        return processReportData(previewData, visualization);
    }, [previewData, visualization]);
    
    const addFilter = () => setFilters([...filters, { field: availableColumns[0], operator: 'contains', value: '' }]);
    const updateFilter = (index: number, field: keyof FilterCondition, value: string) => {
        const newFilters = [...filters];
        (newFilters[index] as any)[field] = value;
        setFilters(newFilters);
    };
    const removeFilter = (index: number) => setFilters(filters.filter((_, i) => i !== index));

    const handleSave = () => {
        if (!name.trim()) return toast.error("Report name is required.");
        createCustomReportMutation.mutate({
            name,
            organizationId: authenticatedUser!.organizationId!,
            config: { dataSource, columns, filters, visualization },
        }, { onSuccess: onClose });
    };

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Reports</Button>
                <div className="flex items-center gap-4">
                    <Input id="report-name" label="" placeholder="Enter Report Name..." value={name} onChange={e => setName(e.target.value)} className="w-72" />
                    <Button onClick={handleSave} disabled={createCustomReportMutation.isPending}>
                        {createCustomReportMutation.isPending ? 'Saving...' : 'Save Report'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Config Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <Card title="1. Data Source">
                        <Select id="data-source" label="Select data to report on" value={dataSource} onChange={e => setDataSource(e.target.value as ReportDataSource)}>
                            {dataSourceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Select>
                    </Card>
                    <Card title="2. Columns">
                        <MultiSelect label="Select columns to display" options={availableColumns.map(c => ({ value: c, label: c }))} selectedValues={columns} onChange={setColumns} />
                    </Card>
                     <Card title="3. Filters">
                        <div className="space-y-2">
                             {filters.map((filter, index) => (
                                <div key={index} className="flex items-end gap-1">
                                    <Select id={`filter-field-${index}`} label="" value={filter.field} onChange={e => updateFilter(index, 'field', e.target.value)} className="w-1/3">
                                        {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                    </Select>
                                    <Select id={`filter-op-${index}`} label="" value={filter.operator} onChange={e => updateFilter(index, 'operator', e.target.value as any)} className="w-1/4">
                                        {operatorOptions.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                                    </Select>
                                    <Input id={`filter-val-${index}`} label="" value={filter.value} onChange={e => updateFilter(index, 'value', e.target.value)} className="flex-grow" />
                                    <Button variant="secondary" size="sm" onClick={() => removeFilter(index)}><Trash2 size={14}/></Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" size="sm" onClick={addFilter} leftIcon={<Plus size={14} />} className="mt-2">Add Filter</Button>
                    </Card>
                    <Card title="4. Visualization">
                        <div className="flex justify-around">
                            <Button variant={visualization.type === 'table' ? 'primary' : 'secondary'} onClick={() => setVisualization({ type: 'table', metric: { type: 'count' } })}><Table/></Button>
                            <Button variant={visualization.type === 'bar' ? 'primary' : 'secondary'} onClick={() => setVisualization({ ...visualization, type: 'bar' })}><BarChart/></Button>
                            <Button variant={visualization.type === 'pie' ? 'primary' : 'secondary'} onClick={() => setVisualization({ ...visualization, type: 'pie' })}><PieIcon/></Button>
                            <Button variant={visualization.type === 'line' ? 'primary' : 'secondary'} onClick={() => setVisualization({ ...visualization, type: 'line' })}><LineIcon/></Button>
                        </div>
                        {visualization.type !== 'table' && (
                             <div className="mt-4 grid grid-cols-2 gap-2">
                                <Select id="group-by" label="Group By" value={visualization.groupByKey || ''} onChange={e => setVisualization(v => ({...v, groupByKey: e.target.value}))}>
                                    <option value="">Select column...</option>
                                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                </Select>
                                 <Select id="metric-type" label="Metric" value={visualization.metric.type} onChange={e => setVisualization(v => ({...v, metric: {...v.metric, type: e.target.value as any}}))}>
                                     <option value="count">Count of Records</option>
                                     <option value="sum">Sum of</option>
                                     <option value="average">Average of</option>
                                </Select>
                                {(visualization.metric.type === 'sum' || visualization.metric.type === 'average') && (
                                     <Select id="metric-col" label="Metric Column" value={visualization.metric.column || ''} onChange={e => setVisualization(v => ({...v, metric: {...v.metric, column: e.target.value}}))}>
                                        <option value="">Select column...</option>
                                        {columns.filter(c => typeof(productColumns.find(pc => pc === c)) !== 'undefined' || typeof(contactColumns.find(cc => cc === c)) !== 'undefined' ).map(c => <option key={c} value={c}>{c}</option>)}
                                    </Select>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
                {/* Preview */}
                <div className="lg:col-span-2">
                    <Card title="Live Preview">
                        {isPreviewLoading ? (
                            <p>Loading preview...</p>
                        ) : previewData ? (
                            visualization.type === 'table' ? (
                                <CustomReportDataTable data={previewData} />
                            ) : (
                                <CustomReportChart data={chartPreviewData} visualizationType={visualization.type} />
                            )
                        ) : <p>No data to display.</p>}
                    </Card>
                </div>
            </div>
        </PageWrapper>
    );
};

export default CustomReportBuilderPage;
