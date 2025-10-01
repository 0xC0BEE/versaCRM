import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
// FIX: Corrected the import path for types to be a valid relative path.
import { User } from '../../types';
import TeamMemberDetailModal from './TeamMemberDetailModal';

interface TeamPageProps {
    isTabbedView?: boolean;
}

const TeamPage: React.FC<TeamPageProps> = ({ isTabbedView = false }) => {
    const { teamMembersQuery } = useData();
    const { data: members = [], isLoading, isError } = teamMembersQuery;
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

    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Team Members</h1>
                    <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                        Invite Member
                    </Button>
                </div>
            )}
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading team members...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Role</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isError && (
                                     <tr><td colSpan={4} className="text-center p-8 text-red-500">
                                        Failed to load team members.
                                    </td></tr>
                                )}
                                {!isError && members.map(member => (
                                    <tr key={member.id} className="bg-white border-b dark:bg-dark-card dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{member.name}</td>
                                        <td className="px-6 py-4">{member.email}</td>
                                        <td className="px-6 py-4">{member.role}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEdit(member)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Edit</button>
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
            <TeamMemberDetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                member={selectedMember}
            />
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