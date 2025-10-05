import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useForm } from '../../hooks/useForm';
import { SLAPolicy } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

const TicketSettings: React.FC = () => {
    const { organizationSettingsQuery, updateOrganizationSettingsMutation } = useData();
    const { data: settings } = organizationSettingsQuery;

    const initialState: SLAPolicy = {
        responseTime: { high: 1, medium: 4, low: 24 },
        resolutionTime: { high: 8, medium: 24, low: 72 },
    };

    const { formData, handleChange, setFormData } = useForm(initialState, settings?.ticketSla);
    
    const handleNumericChange = (type: 'responseTime' | 'resolutionTime', priority: 'high' | 'medium' | 'low', value: string) => {
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [priority]: parseInt(value) || 0
            }
        }));
    };

    const handleSave = () => {
        updateOrganizationSettingsMutation.mutate({ ticketSla: formData }, {
            onSuccess: () => toast.success("SLA policies updated successfully!")
        });
    };
    
    const isPending = updateOrganizationSettingsMutation.isPending;

    return (
        <div>
            <h3 className="text-lg font-semibold">SLA Policies</h3>
            <p className="text-sm text-text-secondary mb-4">Set the target times for first response and ticket resolution based on priority. This will be used to track team performance.</p>

            <div className="space-y-4">
                {(['high', 'medium', 'low'] as const).map(priority => (
                    <div key={priority} className="p-4 border border-border-subtle rounded-lg">
                        <h4 className="font-medium capitalize mb-2">{priority} Priority Tickets</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                id={`resp-time-${priority}`}
                                label="First Response Time (hours)"
                                type="number"
                                value={formData.responseTime[priority]}
                                onChange={e => handleNumericChange('responseTime', priority, e.target.value)}
                                disabled={isPending}
                            />
                             <Input
                                id={`res-time-${priority}`}
                                label="Total Resolution Time (hours)"
                                type="number"
                                value={formData.resolutionTime[priority]}
                                onChange={e => handleNumericChange('resolutionTime', priority, e.target.value)}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Policies'}
                </Button>
            </div>
        </div>
    );
};

export default TicketSettings;