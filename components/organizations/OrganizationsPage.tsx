import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import OrganizationsTable from './OrganizationsTable';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import { Organization } from '../../types';
import OrganizationEditModal from './OrganizationEditModal';
import toast from 'react-hot-toast';


const OrganizationsPage: React.FC = () => {
    const { organizationsQuery } = useData();
    const { data: organizations = [], isLoading } = organizationsQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

    const handleEdit = (org: Organization) => {
        setSelectedOrg(org);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedOrg(null);
        setIsModalOpen(true);
    };
    
    // FIX: Corrected the type for orgData.
    const handleSave = (orgData: Pick<Organization, 'name' | 'industry' | 'primaryContactEmail'>) => {
        // Mock save logic
        if (selectedOrg) {
            toast.success(`Organization "${orgData.name}" updated.`);
        } else {
            toast.success(`Organization "${orgData.name}" created.`);
        }
        console.log("Saving:", orgData);
    };

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Organizations</h1>
                <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                    New Organization
                </Button>
            </div>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading organizations...</div>
                ) : (
                    <OrganizationsTable organizations={organizations} onRowClick={handleEdit} />
                )}
            </Card>
            <OrganizationEditModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                organization={selectedOrg}
                onSave={handleSave}
            />
        </PageWrapper>
    );
};

export default OrganizationsPage;
