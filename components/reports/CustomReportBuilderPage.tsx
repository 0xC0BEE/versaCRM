import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';
import { ReportDataSource, FilterCondition, AnyContact, Product } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Select from '../ui/Select';
import CustomReportDataTable from './CustomReportDataTable';

interface CustomReportBuilderPageProps {
    onFinish: () => void;
}

const dataSources: { id: ReportDataSource, name: string }[] = [
    { id: 'contacts', name: 'Contacts' },
    { id: 'products', name: 'Products' },
];

const operatorOptions = [
    { id: 'is', name: 'Is' },
    { id: 'is_not', name: 'Is Not' },
    { id: 'contains', name: 'Contains' },
    { id: 'does_not_contain', name: 'Does Not Contain' },
];

const CustomReportBuilderPage: React.FC<CustomReportBuilderPageProps> = ({ onFinish }) => {
    const { authenticatedUser } = useAuth();
    const { contactsQuery, productsQuery, createCustomReportMutation } = useData();
    const orgId = authenticatedUser!.organizationId!;

    const [step, setStep] = useState(1);
    const [reportName, setReportName] = useState('');
    const [dataSource, setDataSource] = useState<ReportDataSource>('contacts');
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [generatedData, setGeneratedData] = useState<any[] | null>(null);

    const { data: reportData, isLoading: isGenerating, refetch } = useQuery({
        queryKey: ['customReportPreview', dataSource, selectedColumns, filters],
        queryFn: () => apiClient.generateCustomReport({ dataSource, columns: selectedColumns, filters }, orgId),
        enabled: false, // Only run manually
    });

    const availableColumns = useMemo(() => {
        if (dataSource === 'contacts' && contactsQuery.data) return Object.keys(contactsQuery.data[0] || {});
        if (dataSource === 'products' && productsQuery.data) return Object.keys(productsQuery.data[0] || {});
        return [];
    }, [dataSource, contactsQuery.data, productsQuery.data]);

    const handleDataSourceChange = (ds: ReportDataSource) => {
        setDataSource(ds);
        setSelectedColumns([]);
        setFilters([]);
    };

    const handleColumnToggle = (column: string) => {
        setSelectedColumns(prev => 
            prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
        );
    };

    const addFilter = () => {
        if (availableColumns.length > 0) {
            setFilters([...filters, { field: availableColumns[0], operator: 'is', value: '' }]);
        }
    };
    
    const updateFilter = (index: number, field: keyof FilterCondition, value: string) => {
        const newFilters = [...filters];
        (newFilters[index] as any)[field] = value;
        setFilters(newFilters);
    };

    const removeFilter = (index: number) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const handleGenerateReport = async () => {
        if (selectedColumns.length === 0) {
            toast.error("Please select at least one column.");
            return;
        }
        const { data } = await refetch();
        setGeneratedData(data || []);
    };
    
    const handleSaveReport = () => {
        if (!reportName.trim()) {
            toast.error("Please enter a name for your report.");
            return;
        }
         if (selectedColumns.length === 0) {
            toast.error("Cannot save a report with no columns.");
            return;
        }
        createCustomReportMutation.mutate({
            name: reportName,
            organizationId: orgId,
            config: { dataSource, columns: selectedColumns, filters }
        }, {
            onSuccess: onFinish
        });
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Data Source & Columns
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <h3 className="font-semibold mb-2">1. Select Data Source</h3>
                            <div className="space-y-2">
                                {dataSources.map(ds => (
                                    <button key={ds.id} onClick={() => handleDataSourceChange(ds.id)} className={`w-full text-left p-3 rounded-md border ${dataSource === ds.id ? 'bg-primary-100 dark:bg-primary-900/50 border-primary-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                        {ds.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="font-semibold mb-2">2. Choose Columns</h3>
                            <div className="max-h-60 overflow-y-auto p-3 border rounded-md dark:border-dark-border grid grid-cols-2 gap-2">
                                {availableColumns.map(col => (
                                    <label key={col} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                        <input type="checkbox" checked={selectedColumns.includes(col)} onChange={() => handleColumnToggle(col)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                                        <span>{col}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 2: // Filters
                return (
                     <div>
                        <h3 className="font-semibold mb-4">3. Add Filters (Optional)</h3>
                        <div className="space-y-3">
                            {filters.map((filter, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                    <Select id={`filter-field-${index}`} label="" value={filter.field} onChange={e => updateFilter(index, 'field', e.target.value)}>
                                        {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                    </Select>
                                    <Select id={`filter-op-${index}`} label="" value={filter.operator} onChange={e => updateFilter(index, 'operator', e.target.value as any)}>
                                        {operatorOptions.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                                    </Select>
                                    <Input id={`filter-val-${index}`} label="" value={filter.value} onChange={e => updateFilter(index, 'value', e.target.value)} className="flex-grow" />
                                    <Button variant="danger" size="sm" onClick={() => removeFilter(index)}><Trash2 size={14}/></Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" size="sm" onClick={addFilter} leftIcon={<Plus size={14} />} className="mt-3">Add Filter</Button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <PageWrapper>
             <div className="flex items-center mb-6">
                <Button variant="secondary" onClick={onFinish} leftIcon={<ArrowLeft size={16} />}>Back to Reports</Button>
            </div>
            <Card title="Custom Report Builder">
                {renderStep()}
                <div className="mt-6 pt-4 border-t dark:border-dark-border flex justify-between">
                    <Button variant="secondary" onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1}>Previous</Button>
                    {step < 2 ? (
                        <Button onClick={() => setStep(s => Math.min(2, s+1))}>Next</Button>
                    ) : (
                        <Button onClick={handleGenerateReport} disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate Report"}
                        </Button>
                    )}
                </div>
            </Card>

            {generatedData && (
                <Card className="mt-8" title="Report Preview">
                    {generatedData.length > 0 ? (
                         <CustomReportDataTable data={generatedData} />
                    ) : (
                         <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2">Your report returned no results.</p>
                        </div>
                    )}
                    <div className="mt-6 p-4 border-t dark:border-dark-border flex items-center gap-4">
                        <Input id="report-name" label="" placeholder="Enter report name to save..." value={reportName} onChange={e => setReportName(e.target.value)} className="flex-grow" />
                        <Button onClick={handleSaveReport} disabled={!reportName || createCustomReportMutation.isPending}>
                           {createCustomReportMutation.isPending ? "Saving..." : "Save Report"}
                        </Button>
                    </div>
                </Card>
            )}
        </PageWrapper>
    );
};

export default CustomReportBuilderPage;