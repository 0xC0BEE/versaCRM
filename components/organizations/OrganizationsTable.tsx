import React from 'react';
import { Organization } from '../../types';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';

interface OrganizationsTableProps {
    organizations: Organization[];
    onRowClick: (org: Organization) => void;
    onAdd?: () => void;
    isError: boolean;
}

const OrganizationsTable: React.FC<OrganizationsTableProps> = ({ organizations, onRowClick, onAdd, isError }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text-secondary">
                <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                    <tr>
                        <th scope="col" className="px-6 py-3 font-medium">Name</th>
                        <th scope="col" className="px-6 py-3 font-medium">Industry</th>
                        <th scope="col" className="px-6 py-3 font-medium">Contact Email</th>
                        <th scope="col" className="px-6 py-3 font-medium">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {isError && (
                        <tr><td colSpan={4} className="text-center p-8 text-error">
                            Failed to load organizations. Please try again later.
                        </td></tr>
                    )}
                    {!isError && organizations.map(org => (
                        <tr
                            key={org.id}
                            onClick={() => onRowClick(org)}
                            className="border-b border-border-subtle hover:bg-hover-bg cursor-pointer"
                        >
                            <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{org.name}</td>
                            <td className="px-6 py-4">{org.industry}</td>
                            <td className="px-6 py-4">{org.primaryContactEmail}</td>
                            <td className="px-6 py-4">{new Date(org.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {!isError && organizations.length === 0 && (
                        <tr><td colSpan={4} className="text-center p-8">
                             <p className="text-text-secondary">No organizations found.</p>
                             {onAdd && (
                                <Button size="sm" variant="secondary" className="mt-2" onClick={onAdd} leftIcon={<Plus size={14}/>}>
                                    Create New Organization
                                </Button>
                             )}
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrganizationsTable;
