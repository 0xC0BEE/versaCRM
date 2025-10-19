import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { SystemAuditLogEntry, AnyContact, KYCStatus, AMLRisk } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Switch from '../ui/Switch';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Power, PowerOff, CheckCircle, Search } from 'lucide-react';
import Tabs from '../ui/Tabs';
import KpiCard from '../dashboard/KpiCard';

const ComplianceSettings: React.FC = () => {
    const { 
        organizationSettingsQuery, 
        updateOrganizationSettingsMutation,
        systemAuditLogsQuery,
        contactsQuery
    } = useData();
    const { data: settings, isLoading: settingsLoading } = organizationSettingsQuery;
    const { data: auditLogs = [], isLoading: logsLoading } = systemAuditLogsQuery;
    const { data: contacts = [] } = contactsQuery;
    
    const [auditSearch, setAuditSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Settings');

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

    const SettingsTab = () => (
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
        </div>
    );
    
    const AuditLogTab = () => (
        <div>
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
    );
    
    const ComplianceDashboardTab = () => {
        const [complianceSearch, setComplianceSearch] = useState('');
        const contactsWithCompliance = (contacts as AnyContact[]).filter(c => c.financialComplianceData);

        const complianceStats = useMemo(() => {
            const total = contactsWithCompliance.length;
            if (total === 0) return { verified: 0, highRisk: 0, pending: 0 };
            const verifiedCount = contactsWithCompliance.filter(c => c.financialComplianceData?.kycStatus === 'Verified').length;
            const highRiskCount = contactsWithCompliance.filter(c => c.financialComplianceData?.amlRisk === 'High').length;
            const pendingCount = contactsWithCompliance.filter(c => c.financialComplianceData?.kycStatus === 'Pending').length;
            return {
                verified: (verifiedCount / total) * 100,
                highRisk: highRiskCount,
                pending: pendingCount,
            }
        }, [contactsWithCompliance]);

        const filteredComplianceContacts = useMemo(() => {
            if (!complianceSearch.trim()) return contactsWithCompliance;
            return contactsWithCompliance.filter(c => 
                c.contactName.toLowerCase().includes(complianceSearch.toLowerCase()) ||
                c.email.toLowerCase().includes(complianceSearch.toLowerCase())
            );
        }, [contactsWithCompliance, complianceSearch]);
        
        const kycStatusColor = (status: KYCStatus) => ({ 'Verified': 'text-success', 'Pending': 'text-warning', 'Rejected': 'text-error', 'Not Started': 'text-text-secondary' }[status]);
        const amlRiskColor = (risk: AMLRisk) => ({ 'High': 'text-error', 'Medium': 'text-warning', 'Low': 'text-success' }[risk]);

        return (
            <div>
                 <h3 className="text-lg font-semibold">Compliance Dashboard</h3>
                 <p className="text-sm text-text-secondary mb-4">Monitor KYC and AML status across all clients.</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <KpiCard title="KYC Verified" value={`${complianceStats.verified.toFixed(1)}%`} iconName="CheckCircle" />
                     <KpiCard title="Pending KYC" value={complianceStats.pending} iconName="Clock" />
                     <KpiCard title="High AML Risk" value={complianceStats.highRisk} iconName="AlertTriangle" />
                 </div>
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <Input id="compliance-search" label="" placeholder="Search clients..." value={complianceSearch} onChange={e => setComplianceSearch(e.target.value)} className="pl-10" />
                </div>
                 <div className="border border-border-subtle rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm text-left text-text-secondary">
                             <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Client Name</th>
                                    <th className="px-6 py-3 font-medium">KYC Status</th>
                                    <th className="px-6 py-3 font-medium">AML Risk</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-border-subtle">
                                {filteredComplianceContacts.map(c => (
                                    <tr key={c.id} className="hover:bg-hover-bg">
                                        <td className="px-6 py-3 font-medium text-text-primary">{c.contactName}</td>
                                        <td className={`px-6 py-3 font-semibold ${kycStatusColor(c.financialComplianceData!.kycStatus)}`}>{c.financialComplianceData!.kycStatus}</td>
                                        <td className={`px-6 py-3 font-semibold ${amlRiskColor(c.financialComplianceData!.amlRisk)}`}>{c.financialComplianceData!.amlRisk}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>
        );
    };

    return (
        <div>
            <Tabs tabs={['Compliance Dashboard', 'Settings', 'System Audit Log']} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-6">
                {activeTab === 'Compliance Dashboard' && <ComplianceDashboardTab />}
                {activeTab === 'Settings' && <SettingsTab />}
                {activeTab === 'System Audit Log' && <AuditLogTab />}
            </div>
        </div>
    );
};

export default ComplianceSettings;