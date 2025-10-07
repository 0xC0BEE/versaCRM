import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
// FIX: Corrected import path for types.
import { User, CustomRole } from '../../types';
import TeamMemberDetailModal from './TeamMemberDetailModal';
import { useAuth } from '../../contexts/AuthContext';

interface TeamPageProps {
    isTabbedView?: boolean;
}

const TeamPage: React.FC<TeamPageProps> = ({ isTabbedView = false }) => {
    const { teamMembersQuery, rolesQuery } = useData();
    const { hasPermission } = useAuth();
    const { data: members = [], isLoading: membersLoading, isError } = teamMembersQuery;
    const { data: roles = [], isLoading: rolesLoading } = rolesQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<User | null>(null);

    const handleEdit = (member: User) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedMember(null);
        setIsModalOpen(true);
    };
    
    const roleMap = React.useMemo(() => {
        return (roles as CustomRole[]).reduce((acc, role) => {
            acc[role.id] = role.name;
            return acc;
        }, {} as Record<string, string>);
    }, [roles]);

    const isLoading = membersLoading || rolesLoading;

    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-text-primary">Team Members</h1>
                    {hasPermission('settings:manage:team') && (
                        <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                            Invite Member
                        </Button>
                    )}
                </div>
            )}
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading team members...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Name</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Email</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Role</th>
                                    <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Edit</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isError && (
                                     <tr><td colSpan={4} className="text-center p-8 text-error">
                                        Failed to load team members.
                                    </td></tr>
                                )}
                                {!isError && members.map((member: User) => (
                                    <tr key={member.id} className="border-b border-border-subtle hover:bg-hover-bg">
                                        <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{member.name}</td>
                                        <td className="px-6 py-4">{member.email}</td>
                                        <td className="px-6 py-4">{roleMap[member.roleId] || 'N/A'}</td>
                                        <td className="px-6 py-4 text-right">
                                            {hasPermission('settings:manage:team') && (
                                                <button onClick={() => handleEdit(member)} className="font-medium text-primary hover:underline">Edit</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {!isError && members.length === 0 && (
                                    <tr><td colSpan={4} className="text-center p-8">No team members found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
            {hasPermission('settings:manage:team') && (
                <TeamMemberDetailModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    member={selectedMember}
                />
            )}
        </>
    );

    // FIX: Conditionally render PageWrapper to prevent nesting bugs.
    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>;
    }

    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default TeamPage;
