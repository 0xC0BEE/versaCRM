import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
// FIX: Imported correct type.
import { AnyContact } from '../../../types';
import DetailedProfileTab from '../../organizations/detail_tabs/ProfileTab';

const ProfileTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    // FIX: contactId now exists on User type for clients.
    const contactId = authenticatedUser?.contactId;

    // FIX: Used correct api method and type.
    const { data: contact, isLoading, isError } = useQuery<AnyContact | null, Error>({
        queryKey: ['contactProfile', contactId],
        queryFn: () => api.getContactById(contactId!),
        enabled: !!contactId,
    });

    if (isLoading) return <div>Loading profile information...</div>;
    if (isError || !contact) return <div>Could not load profile. Please try again later.</div>;

    // Use the detailed, reusable profile tab component in read-only mode
    return <DetailedProfileTab contact={contact} isReadOnly={true} />;
};

export default ProfileTab;
