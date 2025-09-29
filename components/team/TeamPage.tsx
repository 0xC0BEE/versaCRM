import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Mail, Shield } from 'lucide-react';
import { User } from '../../types';
import TeamMemberDetailModal from './TeamMemberDetailModal';
import { useApp } from '../../contexts/AppContext';

interface TeamPageProps {
    isTabbedView?: boolean;
}

const TeamPage: React.FC<TeamPageProps> = ({ isTabbedView = false }) => {
    const { teamMembersQuery } = useData();
    // FIX: industryConfig is now correctly provided by useApp hook.
    const { industryConfig } = useApp();
    const { data: teamMembers = [], isLoading } = teamMembersQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<User | null>(null);

    const handleViewDetails = (member: User) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };
    
    const handleAddMember = () => {
        setSelectedMember(null);
        setIsModalOpen(true);
    };

    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Team Management</h1>
                    <Button onClick={handleAddMember} leftIcon={<Plus size={16}/>}>
                        Invite {industryConfig.teamMemberName}
                    </Button>
                </div>
            )}
            <Card>
                <div className="p-6">
                    {isLoading ? (
                        <div>Loading team members...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamMembers.map((member: User) => (
                                <div key={member.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-dark-border">
                                    <div className="flex items-center space-x-4">
                                        <img className="w-12 h-12 rounded-full" src={`https://i.pravatar.cc/150?u=${member.id}`} alt={member.name} />
                                        <div>
                                            <h4 className="font-semibold">{member.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                        <p className="flex items-center"><Mail size={14} className="mr-2" /> {member.email}</p>

                                        <p className="flex items-center"><Shield size={14} className="mr-2" /> Permissions Active</p>
                                    </div>
                                    <div className="mt-4 text-right">
                                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(member)}>View Details</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
            {isModalOpen && (
                <TeamMemberDetailModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    member={selectedMember}
                />
            )}
        </>
    );

    if (isTabbedView) {
        return pageContent;
    }

    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default TeamPage;
