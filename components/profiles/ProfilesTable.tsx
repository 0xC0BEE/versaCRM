import React, { useMemo } from 'react';
import { AudienceProfile, AnyContact, FilterCondition } from '../../types';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface ProfilesTableProps {
    profiles: AudienceProfile[];
    onEdit: (profile: AudienceProfile) => void;
    onDelete: (profileId: string) => void;
}

const evaluateFilters = (contact: AnyContact, filters: FilterCondition[]): boolean => {
    return filters.every(filter => {
        const contactValue = (contact as any)[filter.field];
        
        // Handle numeric comparisons
        if (typeof contactValue === 'number') {
            const filterValueNum = Number(filter.value);
            if (isNaN(filterValueNum)) return false;
            switch (filter.operator) {
                case 'gt': return contactValue > filterValueNum;
                case 'lt': return contactValue < filterValueNum;
                case 'eq': return contactValue === filterValueNum;
                default: return false; // Or handle other operators if needed
            }
        }
        
        // Handle string comparisons
        const contactValueStr = String(contactValue || '').toLowerCase();
        const filterValueStr = String(filter.value).toLowerCase();
        switch (filter.operator) {
            case 'is': return contactValueStr === filterValueStr;
            case 'is_not': return contactValueStr !== filterValueStr;
            case 'contains': return contactValueStr.includes(filterValueStr);
            case 'does_not_contain': return !contactValueStr.includes(filterValueStr);
            default: return true;
        }
    });
};

const ProfilesTable: React.FC<ProfilesTableProps> = ({ profiles, onEdit, onDelete }) => {
    const { contactsQuery, deleteAudienceProfileMutation } = useData();
    const { data: contacts = [] } = contactsQuery;

    const profileMatchCounts = useMemo(() => {
        const counts = new Map<string, number>();
        profiles.forEach(profile => {
            const matchCount = (contacts as AnyContact[]).filter(contact => evaluateFilters(contact, profile.filters)).length;
            counts.set(profile.id, matchCount);
        });
        return counts;
    }, [profiles, contacts]);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text-secondary">
                <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                    <tr>
                        <th scope="col" className="px-6 py-3 font-medium">Profile Name</th>
                        <th scope="col" className="px-6 py-3 font-medium">Description</th>
                        <th scope="col" className="px-6 py-3 font-medium text-center">Matching Contacts</th>
                        <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {profiles.map(profile => (
                        <tr key={profile.id} className="border-b border-border-subtle hover:bg-hover-bg">
                            <td className="px-6 py-4 font-medium text-text-primary">{profile.name}</td>
                            <td className="px-6 py-4">{profile.description}</td>
                            <td className="px-6 py-4 text-center font-semibold">{profileMatchCounts.get(profile.id) || 0}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="secondary" onClick={() => onEdit(profile)} leftIcon={<Edit size={14} />}>Edit</Button>
                                    <Button size="sm" variant="danger" onClick={() => onDelete(profile.id)} disabled={deleteAudienceProfileMutation.isPending}><Trash2 size={14} /></Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {profiles.length === 0 && (
                         <tr><td colSpan={4} className="text-center p-8">No audience profiles found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProfilesTable;