import React from 'react';
import { ContactsReportData } from '../../types';
// FIX: Changed default import of 'Card' to a named import '{ Card, CardHeader, CardTitle, CardContent }' and refactored usage to resolve module export error.
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    const strokeColor = isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(226, 232, 240, 0.8)';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KpiCard title={`Total ${industryConfig.contactNamePlural}`} value={data.totalContacts} iconName="Users" />
                <KpiCard title={`New ${industryConfig.contactNamePlural} (in period)`} value={data.newContacts} iconName="UserPlus" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{`${industryConfig.contactNamePlural} by Status`}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={data.contactsByStatus}>
                                    <defs>
                                        <linearGradient id="contactsStatus" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.7}/>
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                                    <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                            border: `1px solid ${strokeColor}`,
                                            borderRadius: 'var(--radius-input)'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="url(#contactsStatus)" name="Count" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{`${industryConfig.contactNamePlural} by Lead Source`}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={data.contactsByLeadSource}>
                                    <defs>
                                        <linearGradient id="leadSource" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.7}/>
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                                    <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                            border: `1px solid ${strokeColor}`,
                                            borderRadius: 'var(--radius-input)'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="url(#leadSource)" name="Count" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ContactsReport;