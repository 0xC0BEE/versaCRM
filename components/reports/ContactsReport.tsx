import React from 'react';
import { ContactsReportData } from '../../types';
import Card from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';
import { Users, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';

interface ContactsReportProps {
    data: ContactsReportData;
}

const ContactsReport: React.FC<ContactsReportProps> = ({ data }) => {
    const { industryConfig } = useApp();
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const tickColor = isDark ? '#9ca3af' : '#6b7280';
    const strokeColor = isDark ? '#4b5563' : '#d1d5db';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KpiCard title={`Total ${industryConfig.contactNamePlural}`} value={data.totalContacts} icon={<Users className="h-6 w-6 text-blue-500" />} />
                <KpiCard title={`New ${industryConfig.contactNamePlural} (in period)`} value={data.newContacts} icon={<UserPlus className="h-6 w-6 text-green-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={`${industryConfig.contactNamePlural} by Status`}>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={data.contactsByStatus}>
                                <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                                <XAxis dataKey="name" tick={{ fill: tickColor }} />
                                <YAxis tick={{ fill: tickColor }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                        border: `1px solid ${strokeColor}`
                                    }}
                                />
                                <Bar dataKey="count" fill="#8884d8" name="Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card title={`${industryConfig.contactNamePlural} by Lead Source`}>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={data.contactsByLeadSource}>
                                <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                                <XAxis dataKey="name" tick={{ fill: tickColor }} />
                                <YAxis tick={{ fill: tickColor }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                        border: `1px solid ${strokeColor}`
                                    }}
                                />
                                <Bar dataKey="count" fill="#82ca9d" name="Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ContactsReport;