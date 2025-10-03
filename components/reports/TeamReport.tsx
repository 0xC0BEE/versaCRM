import React from 'react';
// FIX: Imported correct type.
// FIX: Corrected the import path for types to be a valid relative path.
import { TeamReportData } from '../../types';
import Card from '../ui/Card';
import { User, DollarSign, CheckSquare, Calendar } from 'lucide-react';

interface TeamReportProps {
    data: TeamReportData;
}

const TeamReport: React.FC<TeamReportProps> = ({ data }) => {
    const teamPerformance = data?.teamPerformance || [];

    const totalRevenue = teamPerformance.reduce((sum, member) => sum + member.totalRevenue, 0);
    const totalAppointments = teamPerformance.reduce((sum, member) => sum + member.appointments, 0);
    const totalTasks = teamPerformance.reduce((sum, member) => sum + member.tasks, 0);

    return (
        <div className="space-y-6">
            <Card title="Team Performance Overview" className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                            <tr key={member.teamMemberId} className="bg-white border-b dark:bg-dark-card dark:border-dark-border">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                                     <img 
                                        className="w-8 h-8 mr-3 rounded-full" 
                                        src={`https://i.pravatar.cc/100?u=${member.teamMemberId}`} 
                                        alt={member.teamMemberName} 
                                    />
                                    {member.teamMemberName}
                                </td>
                                <td className="px-6 py-4">{member.teamMemberRole}</td>
                                <td className="px-6 py-4 text-center">{member.appointments}</td>
                                <td className="px-6 py-4 text-center">{member.tasks}</td>
                                <td className="px-6 py-4 text-right font-mono">{member.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                            </tr>
                        ))}
                         {teamPerformance.length === 0 && (
                            <tr><td colSpan={5} className="text-center p-8">No team performance data in this period.</td></tr>
                         )}
                    </tbody>
                     <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
                        <tr className="text-gray-800 dark:text-white">
                            <td colSpan={2} className="px-6 py-3 text-right">Totals:</td>
                            <td className="px-6 py-3 text-center">{totalAppointments}</td>
                            <td className="px-6 py-3 text-center">{totalTasks}</td>
                            <td className="px-6 py-3 text-right font-mono">{totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        </tr>
                    </tfoot>
                </table>
            </Card>
        </div>
    );
};

export default TeamReport;