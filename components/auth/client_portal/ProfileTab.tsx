
import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
// FIX: Corrected the import path for apiClient from a file path to a relative module path.
import apiClient from '../../../services/apiClient';
// FIX: Corrected the import path for types to be a valid relative path.
import { AnyContact } from '../../../types';
// FIX: Changed import to default since ProfileTab has a default export now.
import DetailedProfileTab from '../../organizations/detail_tabs/ProfileTab';

const ClientProfileTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    // FIX: contactId now exists on User type for clients.
    const contactId = authenticatedUser?.contactId;

    // FIX: Used correct api method and type.
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