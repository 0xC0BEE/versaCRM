import React, { useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import MultiSelect from '../ui/MultiSelect';
import { CustomReport, ReportDataSource, FilterCondition, ReportVisualization } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomReportBuilderPageProps {
    onClose: () => void;
}

const contactColumns = [
    { value: 'contactName', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'status', label: 'Status' },
    { value: 'leadSource', label: 'Lead Source' },
    { value: 'createdAt', label: 'Created At' },
];

const productColumns = [
    { value: 'name', label: 'Name' },
    { value: 'sku', label: 'SKU' },
    { value: 'category', label: 'Category' },
    { value: 'costPrice', label: 'Cost Price' },
    { value: 'salePrice', label: 'Sale Price' },
    { value: 'stockLevel', label: 'Stock Level' },
];

const operatorOptions = [
    { id: 'is', name: 'Is' },
    { id: 'is_not', name: 'Is Not' },
    { id: 'contains', name: 'Contains' },
    { id: 'does_not_contain', name: 'Does Not Contain' },
];

const CustomReportBuilderPage: React.FC<CustomReportBuilderPageProps> = ({ onClose }) => {
    const { createCustomReportMutation } = useData();
    const { authenticatedUser } = useAuth();

    const initialState = useMemo((): Omit<CustomReport, 'id'> => ({
        organizationId: authenticatedUser!.organizationId!,
        name: '',
        config: {
            dataSource: 'contacts',
            columns: [],
            filters: [],
            visualization: {
                type: 'table',
                metric: { type: 'count' },
            },
        },
    }), [authenticatedUser]);
    
    const { formData, setFormData, handleChange } = useForm(initialState, null);
    
    const availableColumns = formData.config.dataSource === 'contacts' ? contactColumns : productColumns;

    const handleConfigChange = (field: keyof CustomReport['config'], value: any) => {
        const newConfig = { ...formData.config, [field]: value };
        // Reset dependent fields when data source changes
        if (field === 'dataSource') {
            newConfig.columns = [];
            newConfig.filters = [];
            if(newConfig.visualization.groupByKey) newConfig.visualization.groupByKey = undefined;
            if(newConfig.visualization.metric.column) newConfig.visualization.metric.column = undefined;
        }
        handleChange('config', newConfig);
    };
    
    const handleFilterChange = (index: number, field: keyof FilterCondition, value: string) => {
        const newFilters = [...formData.config.filters];
        (newFilters[index] as any)[field] = value;
        handleConfigChange('filters', newFilters);
    };

    const addFilter = () => {
        const newFilter: FilterCondition = { field: availableColumns[0].value, operator: 'contains', value: '' };
        handleConfigChange('filters', [...formData.config.filters, newFilter]);
    };

    const removeFilter = (index: number) => {
        handleConfigChange('filters', formData.config.filters.filter((_, i) => i !== index));
    };
    
    const handleVisualizationChange = (field: keyof ReportVisualization, value: any) => {
         const newVisualization = { ...formData.config.visualization, [field]: value };
         handleConfigChange('visualization', newVisualization);
    };

    const handleMetricChange = (field: keyof ReportVisualization['metric'], value: any) => {
         const newVisualization = { 
             ...formData.config.visualization, 
             metric: { ...formData.config.visualization.metric, [field]: value }
        };
         handleConfigChange('visualization', newVisualization);
    };

    const handleSave = () => {
        if (!formData.name.trim()) return toast.error("Report name is required.");
        if (formData.config.columns.length === 0) return toast.error("Please select at least one column.");

        createCustomReportMutation.mutate(formData, {
            onSuccess: onClose
        });
    };
    
    const isChart = formData.config.visualization.type !== 'table';

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-semibold text-text-heading">Custom Report Builder</h1>
                 <div className="flex gap-2">
                    <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Cancel</Button>
                    <Button onClick={handleSave} disabled={createCustomReportMutation.isPending}>
                        {createCustomReportMutation.isPending ? 'Saving...' : 'Save Report'}
                    </Button>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card title="1. General Information">
                        <Input id="report-name" label="Report Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                    </Card>

                    <Card title="2. Data Source & Columns">
                         <Select 
                            id="data-source" 
                            label="Data Source" 
                            value={formData.config.dataSource} 
                            onChange={e => handleConfigChange('dataSource', e.target.value as ReportDataSource)}
                        >
                            <option value="contacts">Contacts</option>
                            <option value="products">Products</option>
                        </Select>
                        <div className="mt-4">
                            <MultiSelect 
                                label="Columns to Include"
                                options={availableColumns}
                                selectedValues={formData.config.columns}
                                onChange={values => handleConfigChange('columns', values)}
                            />
                        </div>
                    </Card>

                    <Card title="3. Filters">
                         <div className="space-y-3">
                            {formData.config.filters.map((filter, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Select id={`filter-field-${index}`} label="" value={filter.field} onChange={e => handleFilterChange(index, 'field', e.target.value)} className="w-1/3">
                                        {availableColumns.map(col => <option key={col.value} value={col.value}>{col.label}</option>)}
                                    </Select>
                                    <Select id={`filter-op-${index}`} label="" value={filter.operator} onChange={e => handleFilterChange(index, 'operator', e.target.value as any)} className="w-1/4">
                                        {operatorOptions.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                                    </Select>
                                    <Input id={`filter-val-${index}`} label="" value={filter.value} onChange={e => handleFilterChange(index, 'value', e.target.value)} className="flex-grow" />
                                    <Button variant="danger" size="sm" onClick={() => removeFilter(index)}><Trash2 size={14}/></Button>
                                </div>
                            ))}
                            <Button variant="secondary" size="sm" onClick={addFilter} leftIcon={<Plus size={14} />}>Add Filter</Button>
                        </div>
                    </Card>
                </div>

                <div>
                    <Card title="4. Visualization">
                        <Select id="viz-type" label="Display As" value={formData.config.visualization.type} onChange={e => handleVisualizationChange('type', e.target.value)}>
                            <option value="table">Table</option>
                            <option value="bar">Bar Chart</option>
                            <option value="pie">Pie Chart</option>
                            <option value="line">Line Chart</option>
                        </Select>
                        
                        {isChart && (
                             <div className="mt-4 pt-4 border-t border-border-subtle space-y-4">
                                <Select id="viz-group" label="Group By" value={formData.config.visualization.groupByKey || ''} onChange={e => handleVisualizationChange('groupByKey', e.target.value)}>
                                     <option value="">Select a column to group...</option>
                                     {availableColumns.filter(c => ['status', 'leadSource', 'category'].includes(c.value)).map(col => <option key={col.value} value={col.value}>{col.label}</option>)}
                                </Select>
                                <div className="grid grid-cols-2 gap-2">
                                    <Select id="viz-metric" label="Metric" value={formData.config.visualization.metric.type} onChange={e => handleMetricChange('type', e.target.value)}>
                                        <option value="count">Count of records</option>
                                        <option value="sum">Sum of</option>
                                        <option value="average">Average of</option>
                                    </Select>
                                    {(formData.config.visualization.metric.type === 'sum' || formData.config.visualization.metric.type === 'average') && (
                                        <Select id="viz-metric-col" label="Metric Column" value={formData.config.visualization.metric.column || ''} onChange={e => handleMetricChange('column', e.target.value)}>
                                            <option value="">Select a column...</option>
                                            {availableColumns.filter(c => ['costPrice', 'salePrice', 'stockLevel'].includes(c.value)).map(col => <option key={col.value} value={col.value}>{col.label}</option>)}
                                        </Select>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

        </PageWrapper>
    );
};

export default CustomReportBuilderPage;
