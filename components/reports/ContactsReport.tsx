import React from 'react';
// FIX: Imported correct type.
import { ContactsReportData } from '../../types';
import Card from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';
import { Users, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// FIX: Corrected import path for useApp.
import { useApp } from '../../contexts/AppContext';

interface ContactsReportProps {
    data: ContactsReportData;
}

const ContactsReport: React.FC<ContactsReportProps> = ({ data }) => {
    // FIX: industryConfig is now correctly provided by useApp hook.
    const { industryConfig } = useApp();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KpiCard title={`Total ${industryConfig.contactNamePlural}`} value={data.totalContacts} icon={<Users className="h-6 w-6 text-blue-500" />} />
                <KpiCard title={`New ${industryConfig.contactNamePlural} (in period)`} value={data.newContacts} icon={<UserPlus className="h-6 w-6 text-green-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={`${industryConfig.contactName} by Status`}>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={data.contactsByStatus} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" name="Count"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                 <Card title={`${industryConfig.contactName} by Lead Source`}>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={data.contactsByLeadSource} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100}/>
                                <Tooltip />
                                <Bar dataKey="count" fill="#84cc16" name="Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ContactsReport;