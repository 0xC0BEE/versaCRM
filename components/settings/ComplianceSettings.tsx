import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { SystemAuditLogEntry } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Switch from '../ui/Switch';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Power, PowerOff, CheckCircle, Search } from 'lucide-react';

const ComplianceSettings: React.FC = () => {
    const { 
        organizationSettingsQuery, 
        updateOrganizationSettingsMutation,
        systemAuditLogsQuery 
    } = useData();
    const { data: settings, isLoading: settingsLoading } = organizationSettingsQuery;
    const { data: auditLogs = [], isLoading: logsLoading } = systemAuditLogsQuery;
    
    const [auditSearch, setAuditSearch] = useState('');

    const handleToggleHIPAA = (isEnabled: boolean) => {
        updateOrganizationSettingsMutation.mutate({ hipaaComplianceModeEnabled: isEnabled }, {
            onSuccess: () => toast.success(`HIPAA Mode ${isEnabled ? 'Enabled' : 'Disabled'}.`)
        });
    };

    const handleToggleEMR = () => {
        const isConnected = !!settings?.emrEhrIntegration?.isConnected;
        updateOrganizationSettingsMutation.mutate({
            emrEhrIntegration: { isConnected: !isConnected, provider: isConnected ? undefined : 'epic' }
        }, {
            onSuccess: () => toast.success(`EMR/EHR integration ${!isConnected ? 'connected' : 'disconnected'}.`)
        });
    };
    
    const filteredLogs = useMemo(() => {
        if (!auditSearch.trim()) return auditLogs;
        return (auditLogs as SystemAuditLogEntry[]).filter((log: SystemAuditLogEntry) => 
            Object.values(log).some(val => String(val).toLowerCase().includes(auditSearch.toLowerCase()))
        );
    }, [auditLogs, auditSearch]);

    const isPending = updateOrganizationSettingsMutation.isPending;
    const isHipaaEnabled = settings?.hipaaComplianceModeEnabled;
    const isEmrConnected = settings?.emrEhrIntegration?.isConnected;

    return (
        <div className="space-y-8">
            {/* HIPAA Settings */}
            <div>
                <h3 className="text-lg font-semibold">HIPAA Compliance</h3>
                <p className="text-sm text-text-secondary mb-4">Enable stricter data handling and logging to help with HIPAA compliance.</p>
                <div className="p-4 border border-border-subtle rounded-lg flex items-center justify-between">
                    <label htmlFor="hipaa-toggle" className="font-medium">Enable HIPAA Compliance Mode</label>
                    <Switch
                        id="hipaa-toggle"
                        checked={!!isHipaaEnabled}
                        onChange={handleToggleHIPAA}
                    />
                </div>
            </div>

            {/* EMR/EHR Integration */}
             <div className="border-t border-border-subtle pt-8">
                <h3 className="text-lg font-semibold">EMR/EHR Integration</h3>
                <p className="text-sm text-text-secondary mb-4">Connect to an Electronic Health Record system to sync patient data.</p>
                 <div className="p-4 border border-border-subtle rounded-lg flex justify-between items-center">
                    <div>
                        <h4 className="font-medium">Epic EMR/EHR</h4>
                        {isEmrConnected ? (
                            <p className="text-sm text-success flex items-center gap-2"><CheckCircle size={14}/> Connected</p>
                        ) : (
                            <p className="text-sm text-text-secondary">Not Connected</p>
                        )}
                    </div>
                    <Button 
                        size="sm" 
                        variant={isEmrConnected ? 'danger' : 'secondary'}
                        onClick={handleToggleEMR}
                        leftIcon={isEmrConnected ? <PowerOff size={14} /> : <Power size={14} />}
                        disabled={isPending}
                    >
                        {isEmrConnected ? 'Disconnect' : 'Connect to Epic'}
                    </Button>
                 </div>
            </div>

            {/* Audit Log */}
            <div className="border-t border-border-subtle pt-8">
                <h3 className="text-lg font-semibold">System Audit Log</h3>
                <p className="text-sm text-text-secondary mb-4">A record of all significant actions taken within your organization's CRM.</p>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <Input id="audit-search" label="" placeholder="Search logs..." value={auditSearch} onChange={e => setAuditSearch(e.target.value)} className="pl-10" />
                </div>
                <div className="border border-border-subtle rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Timestamp</th>
                                    <th scope="col" className="px-6 py-3 font-medium">User</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Action</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Entity</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {logsLoading ? (
                                    <tr><td colSpan={5} className="text-center p-8">Loading logs...</td></tr>
                                ) : filteredLogs.map((log: SystemAuditLogEntry) => (
                                    <tr key={log.id} className="hover:bg-hover-bg">
                                        <td className="px-6 py-3 whitespace-nowrap">{format(new Date(log.timestamp), 'PPpp')}</td>
                                        <td className="px-6 py-3">{log.userId}</td>
                                        <td className="px-6 py-3 capitalize">{log.action}</td>
                                        <td className="px-6 py-3">{log.entityType} ({log.entityId})</td>
                                        <td className="px-6 py-3">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredLogs.length === 0 && !logsLoading && (
                            <p className="text-center p-8">No audit logs found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplianceSettings;
