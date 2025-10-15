import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useForm } from '../../hooks/useForm';
import { OrganizationSettings } from '../../types';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import toast from 'react-hot-toast';
import { Power, PowerOff, CheckCircle } from 'lucide-react';

const DataWarehouseSettings: React.FC = () => {
    const { organizationSettingsQuery, updateOrganizationSettingsMutation } = useData();
    const { data: settings } = organizationSettingsQuery;

    const initialState: OrganizationSettings['dataWarehouse'] = {
        isConnected: false,
        provider: 'bigquery',
        connectionString: '',
    };

    const { formData, handleChange } = useForm(initialState, settings?.dataWarehouse);

    const handleConnect = () => {
        if (!formData?.provider || !formData.connectionString?.trim()) {
            toast.error("Please select a provider and enter a connection string.");
            return;
        }
        const newConfig = { ...formData, isConnected: true, lastSync: new Date().toISOString() };
        updateOrganizationSettingsMutation.mutate({ dataWarehouse: newConfig }, {
            onSuccess: () => toast.success(`Successfully connected to ${formData.provider}!`)
        });
    };
    
    const handleDisconnect = () => {
        if (window.confirm("Are you sure you want to disconnect your data warehouse?")) {
            const newConfig = { isConnected: false, provider: undefined, connectionString: undefined, lastSync: undefined };
            updateOrganizationSettingsMutation.mutate({ dataWarehouse: newConfig }, {
                onSuccess: () => toast.success("Data warehouse disconnected.")
            });
        }
    };

    const isPending = updateOrganizationSettingsMutation.isPending;
    const isConnected = settings?.dataWarehouse?.isConnected;

    return (
        <div>
            <h3 className="text-lg font-semibold">Data Warehouse Integration</h3>
            <p className="text-sm text-text-secondary mb-4">
                Connect VersaCRM to your own external data warehouse (e.g., BigQuery, Snowflake, Redshift) for large-scale analysis.
            </p>
            
            {isConnected ? (
                <div className="p-4 border border-border-subtle rounded-lg bg-card-bg/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-success" />
                            <div>
                                <p className="font-medium">Connected to {settings.dataWarehouse.provider}</p>
                                <p className="text-xs text-text-secondary">Last sync: {settings.dataWarehouse.lastSync ? new Date(settings.dataWarehouse.lastSync).toLocaleString() : 'Never'}</p>
                            </div>
                        </div>
                        <Button variant="danger" size="sm" onClick={handleDisconnect} leftIcon={<PowerOff size={14}/>} disabled={isPending}>
                            Disconnect
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="p-4 border border-border-subtle rounded-lg bg-card-bg/50 space-y-4">
                    <Select
                        id="dw-provider"
                        label="Provider"
                        value={formData?.provider || 'bigquery'}
                        onChange={e => handleChange('provider', e.target.value as any)}
                        disabled={isPending}
                    >
                        <option value="bigquery">Google BigQuery</option>
                        <option value="snowflake">Snowflake</option>
                        <option value="redshift">Amazon Redshift</option>
                    </Select>
                    <Textarea
                        id="dw-connection"
                        label="Connection String / JSON Key"
                        value={formData?.connectionString || ''}
                        onChange={e => handleChange('connectionString', e.target.value)}
                        rows={5}
                        placeholder="Paste your connection details here."
                        disabled={isPending}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleConnect} disabled={isPending} leftIcon={<Power size={16}/>}>
                            {isPending ? 'Connecting...' : 'Connect'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataWarehouseSettings;