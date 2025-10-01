import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
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
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Industry</th>
                        <th scope="col" className="px-6 py-3">Contact Email</th>
                        <th scope="col" className="px-6 py-3">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {isError && (
                        <tr><td colSpan={4} className="text-center p-8 text-red-500">
                            Failed to load organizations. Please try again later.
                        </td></tr>
                    )}
                    {!isError && organizations.map(org => (
                        <tr
                            key={org.id}
                            onClick={() => onRowClick(org)}
                            className="bg-white border-b dark:bg-dark-card dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                        >
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{org.name}</td>
                            <td className="px-6 py-4">{org.industry}</td>
                            {/* FIX: Used correct property names from updated Organization type. */}
                            <td className="px-6 py-4">{org.primaryContactEmail}</td>
                            <td className="px-6 py-4">{new Date(org.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {!isError && organizations.length === 0 && (
                        <tr><td colSpan={4} className="text-center p-8">
                             <p className="text-gray-500">No organizations found.</p>
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