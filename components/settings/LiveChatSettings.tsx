import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useForm } from '../../hooks/useForm';
import { LiveChatSettings, ContactStatus, Ticket } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import toast from 'react-hot-toast';

const statusOptions: ContactStatus[] = ['Lead', 'Active', 'Inactive'];
const priorityOptions: Ticket['priority'][] = ['Low', 'Medium', 'High'];

const LiveChatSettings: React.FC = () => {
    const { organizationSettingsQuery, updateOrganizationSettingsMutation } = useData();
    const { data: settings } = organizationSettingsQuery;

    const initialState: LiveChatSettings = {
        isEnabled: true,
        color: '#3b82f6',
        welcomeMessage: 'Welcome! How can we help you today?',
        autoCreateContact: true,
        newContactStatus: 'Lead',
        autoCreateTicket: true,
        newTicketPriority: 'Medium',
    };

    const { formData, handleChange, setFormData } = useForm(initialState, settings?.liveChat);
    
    const handleToggle = (field: keyof LiveChatSettings) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = () => {
        updateOrganizationSettingsMutation.mutate({ liveChat: formData }, {
            onSuccess: () => toast.success("Live Chat settings updated!")
        });
    };

    const isPending = updateOrganizationSettingsMutation.isPending;
    
    const embedCode = `<script>
  window.versaCrmSettings = {
    orgId: "${settings?.organizationId}",
    color: "${formData.color}",
    welcomeMessage: "${formData.welcomeMessage}",
  };
</script>
<script src="https://cdn.versacrm.com/widget.js" async defer></script>`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">Live Chat Settings</h3>
                    <p className="text-sm text-text-secondary mb-4">Configure the chat widget for your website.</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-hover-bg rounded-lg">
                    <label htmlFor="isEnabled" className="font-medium">Enable Live Chat</label>
                    <input
                        type="checkbox"
                        id="isEnabled"
                        checked={formData.isEnabled}
                        onChange={() => handleToggle('isEnabled')}
                        className="h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-600 checked:bg-primary focus:ring-primary border-transparent"
                    />
                </div>

                <Input
                    id="welcome-message"
                    label="Welcome Message"
                    value={formData.welcomeMessage}
                    onChange={e => handleChange('welcomeMessage', e.target.value)}
                    disabled={isPending || !formData.isEnabled}
                />
                
                <Input
                    id="chat-color"
                    label="Widget Color"
                    type="color"
                    value={formData.color}
                    onChange={e => handleChange('color', e.target.value)}
                    className="w-24"
                    disabled={isPending || !formData.isEnabled}
                />

                <div className="space-y-4 pt-4 border-t border-border-subtle">
                    <h4 className="font-medium">Automation Rules</h4>
                     <div className="flex items-center justify-between">
                        <label htmlFor="autoCreateContact">Automatically create new contact</label>
                        <input type="checkbox" id="autoCreateContact" checked={formData.autoCreateContact} onChange={() => handleToggle('autoCreateContact')} disabled={isPending || !formData.isEnabled} />
                    </div>
                    <Select id="newContactStatus" label="Status for new contacts" value={formData.newContactStatus} onChange={e => handleChange('newContactStatus', e.target.value as ContactStatus)} disabled={isPending || !formData.isEnabled || !formData.autoCreateContact}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <div className="flex items-center justify-between">
                        <label htmlFor="autoCreateTicket">Automatically create new ticket</label>
                        <input type="checkbox" id="autoCreateTicket" checked={formData.autoCreateTicket} onChange={() => handleToggle('autoCreateTicket')} disabled={isPending || !formData.isEnabled} />
                    </div>
                    <Select id="newTicketPriority" label="Priority for new tickets" value={formData.newTicketPriority} onChange={e => handleChange('newTicketPriority', e.target.value as Ticket['priority'])} disabled={isPending || !formData.isEnabled || !formData.autoCreateTicket}>
                        {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                </div>
                
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold">Embed Code</h3>
                <p className="text-sm text-text-secondary mb-4">Copy and paste this snippet before the `&lt;/body&gt;` tag on your website.</p>
                <pre className="p-4 bg-gray-800 text-white rounded-lg text-xs overflow-x-auto">
                    <code>{embedCode}</code>
                </pre>
            </div>
        </div>
    );
};

export default LiveChatSettings;