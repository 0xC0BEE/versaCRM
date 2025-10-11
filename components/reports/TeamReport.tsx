import React from 'react';
import { TeamReportData, CustomRole } from '../../types';
// FIX: Changed default import of 'Card' to a named import '{ Card, CardHeader, CardTitle }' and refactored usage to resolve module export error.
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { useData } from '../../contexts/DataContext';

interface TeamReportProps {
    data: TeamReportData;
}

const TeamReport: React.FC<TeamReportProps> = ({ data }) => {
    const { rolesQuery } = useData();
    const { data: roles = [] } = rolesQuery;
    const teamPerformance = data?.teamPerformance || [];
    
    const roleMap = React.useMemo(() => {
        return (roles as CustomRole[]).reduce((acc, role) => {
            acc[role.id] = role.name;
            return acc;
        }, {} as Record<string, string>);
    }, [roles]);


    const totalRevenue = teamPerformance.reduce((sum, member) => sum + member.totalRevenue, 0);
    const totalAppointments = teamPerformance.reduce((sum, member) => sum + member.appointments, 0);
    const totalTasks = teamPerformance.reduce((sum, member) => sum + member.tasks, 0);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Team Performance Overview</CardTitle>
                </CardHeader>
                 <div className="overflow-x-auto border-t border-border-subtle">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-card-bg/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Team Member</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3 text-center">Appointments</th>
                                <th scope="col" className="px-6 py-3 text-center">Tasks</th>
                                <th scope="col" className="px-6 py-3 text-right">Revenue Generated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...teamPerformance].sort((a,b) => b.totalRevenue - a.totalRevenue).map(member => (
                                <tr key={member.teamMemberId} className="border-b border-border-subtle">
                                    <td className="px-6 py-4 font-medium text-text-primary flex items-center">
                                        <img 
                                            className="w-8 h-8 mr-3 rounded-full" 
                                            src={`https://i.pravatar.cc/100?u=${member.teamMemberId}`} 
                                            alt={member.teamMemberName} 
                                        />
                                        {member.teamMemberName}
                                    </td>
                                    <td className="px-6 py-4">{roleMap[member.teamMemberRole] || member.teamMemberRole}</td>
                                    <td className="px-6 py-4 text-center">{member.appointments}</td>
                                    <td className="px-6 py-4 text-center">{member.tasks}</td>
                                    <td className="px-6 py-4 text-right font-mono">{member.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                </tr>
                            ))}
                            {teamPerformance.length === 0 && (
                                <tr><td colSpan={5} className="text-center p-8">No team performance data in this period.</td></tr>
                            )}
                        </tbody>
                        <tfoot className="bg-card-bg/50 font-semibold">
                            <tr className="text-text-primary">
                                <td colSpan={2} className="px-6 py-3 text-right">Totals:</td>
                                <td className="px-6 py-3 text-center">{totalAppointments}</td>
                                <td className="px-6 py-3 text-center">{totalTasks}</td>
                                <td className="px-6 py-3 text-right font-mono">{totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                            </tr>
                        </tfoot>
                    </table>
                 </div>
            </Card>
        </div>
    );
};

export default TeamReport;