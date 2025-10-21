import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { FilterCondition } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Plus, Trash2 } from 'lucide-react';

const operatorOptions = [
    { id: 'is', name: 'Is' },
    { id: 'is_not', name: 'Is Not' },
    { id: 'contains', name: 'Contains' },
    { id: 'does_not_contain', name: 'Does Not Contain' },
];

const availableColumns = [ 'contactName', 'email', 'phone', 'status', 'leadSource' ];

const ContactFilterBar: React.FC = () => {
    const { contactFilters, setContactFilters, logUserAction } = useApp();

    useEffect(() => {
        if (contactFilters.length > 0) {
            const filterDesc = contactFilters.map(f => `${f.field} ${f.operator} '${f.value}'`).join(' & ');
            logUserAction('filter_contacts', { filters: filterDesc, rawFilters: contactFilters });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactFilters]); // Only log when filters change, not on every render.

    const addFilter = () => {
        setContactFilters([...contactFilters, { field: 'contactName', operator: 'contains', value: '' }]);
    };

    const updateFilter = (index: number, field: keyof FilterCondition, value: string) => {
        const newFilters = [...contactFilters];
        (newFilters[index] as any)[field] = value;
        setContactFilters(newFilters);
    };

    const removeFilter = (index: number) => {
        setContactFilters(contactFilters.filter((_, i) => i !== index));
    };

    return (
        <div className="p-4 border-b dark:border-dark-border space-y-3">
            {contactFilters.map((filter, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Select id={`filter-field-${index}`} label="" value={filter.field} onChange={e => updateFilter(index, 'field', e.target.value)} className="w-1/4">
                        {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </Select>
                    <Select id={`filter-op-${index}`} label="" value={filter.operator} onChange={e => updateFilter(index, 'operator', e.target.value as any)} className="w-1/4">
                        {operatorOptions.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                    </Select>
                    <Input id={`filter-val-${index}`} label="" value={filter.value as string} onChange={e => updateFilter(index, 'value', e.target.value)} className="flex-grow" />
                    <Button variant="secondary" size="sm" onClick={() => removeFilter(index)}><Trash2 size={14}/></Button>
                </div>
            ))}
            <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={addFilter} leftIcon={<Plus size={14} />}>Add Filter</Button>
                {contactFilters.length > 0 && (
                    <Button variant="secondary" size="sm" onClick={() => setContactFilters([])}>Clear All</Button>
                )}
            </div>
        </div>
    );
};

export default ContactFilterBar;