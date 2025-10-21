import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import PageWrapper from '../layout/PageWrapper';
import { Card } from '../ui/Card';
import OrganizationsTable from './OrganizationsTable';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import { Organization } from '../../types';
import OrganizationEditModal from './OrganizationEditModal';

const OrganizationsPage: React.FC = () => {
    const { 
        organizationsQuery, 
        createOrganizationMutation, 
        updateOrganizationMutation, 
        deleteOrganizationMutation 
    } = useData();
    const { data: organizations = [], isLoading, isError } = organizationsQuery;
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

    useEffect(() => {
        if (createOrganizationMutation.isSuccess || updateOrganizationMutation.isSuccess || deleteOrganizationMutation.isSuccess) {
            setIsModalOpen(false);
            createOrganizationMutation.reset();
            updateOrganizationMutation.reset();
            deleteOrganizationMutation.reset();
        }
    }, [createOrganizationMutation.isSuccess, updateOrganizationMutation.isSuccess, deleteOrganizationMutation.isSuccess, createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation]);
    
    const handleSave = (orgData: Partial<Organization>) => {
        if (selectedOrg) {
            updateOrganizationMutation.mutate({ ...selectedOrg, ...orgData });
        } else {
            createOrganizationMutation.mutate(orgData as Omit<Organization, 'id' | 'createdAt'>);
        }
    };

    const handleDelete = (orgId: string) => {
        deleteOrganizationMutation.mutate(orgId);
    };

    const isMutationPending = 
        createOrganizationMutation.isPending || 
        updateOrganizationMutation.isPending || 
        deleteOrganizationMutation.isPending;

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Organizations</h1>
                <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                    New Organization
                </Button>
            </div>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading organizations...</div>
                ) : (
                    <OrganizationsTable organizations={organizations} onRowClick={handleEdit} onAdd={handleAdd} isError={isError} />
                )}
            </Card>
            <OrganizationEditModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                organization={selectedOrg}
                onSave={handleSave}
                onDelete={handleDelete}
                isLoading={isMutationPending}
            />
        </PageWrapper>
    );
};

export default OrganizationsPage;