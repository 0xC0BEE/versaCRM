import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Plus, ScanSearch } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AudienceProfile } from '../../types';
import ProfilesTable from './ProfilesTable';
import ProfileDetailModal from './ProfileDetailModal';

const ProfilesPage: React.FC = () => {
    const { audienceProfilesQuery, deleteAudienceProfileMutation } = useData();
    const { data: profiles = [], isLoading } = audienceProfilesQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<AudienceProfile | null>(null);

    const handleNew = () => {
        setSelectedProfile(null);
        setIsModalOpen(true);
    };

    const handleEdit = (profile: AudienceProfile) => {
        setSelectedProfile(profile);
        setIsModalOpen(true);
    };

    const handleDelete = (profileId: string) => {
        if (window.confirm("Are you sure you want to delete this profile?")) {
            deleteAudienceProfileMutation.mutate(profileId);
        }
    };

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Audience Profiles</h1>
                <Button onClick={handleNew} leftIcon={<Plus size={16} />}>
                    New Profile
                </Button>
            </div>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading profiles...</div>
                ) : profiles.length > 0 ? (
                    <ProfilesTable profiles={profiles as AudienceProfile[]} onEdit={handleEdit} onDelete={handleDelete} />
                ) : (
                    <div className="text-center py-20 text-text-secondary">
                        <ScanSearch className="mx-auto h-16 w-16 text-text-secondary/50" />
                        <h2 className="mt-4 text-lg font-semibold text-text-primary">No Audience Profiles Created Yet</h2>
                        <p className="mt-2 text-sm">Create reusable audience segments for your campaigns and reports.</p>
                         <Button onClick={handleNew} leftIcon={<Plus size={16} />} className="mt-4">
                            Create First Profile
                        </Button>
                    </div>
                )}
            </Card>
            <ProfileDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profile={selectedProfile}
            />
        </PageWrapper>
    );
};

export default ProfilesPage;