import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { AnyContact } from '../../../types';
import DetailedProfileTab from '../../organizations/detail_tabs/ProfileTab';

const ClientProfileTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const contactId = authenticatedUser?.contactId;

    const { data: contact, isLoading, isError } = useQuery<AnyContact | null, Error>({
        queryKey: ['contactProfile', contactId],
        queryFn: () => apiClient.getContactById(contactId!),
        enabled: !!contactId,
    });

    if (isLoading) return <div>Loading profile information...</div>;
    if (isError || !contact) return <div>Could not load profile. Please try again later.</div>;

    // Use the detailed, reusable profile tab component in read-only mode
    return <DetailedProfileTab contact={contact} isReadOnly={true} />;
};

export default ClientProfileTab;
