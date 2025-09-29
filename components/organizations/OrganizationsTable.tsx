import React from 'react';
import { Organization } from '../../types';

interface OrganizationsTableProps {
    organizations: Organization[];
    onRowClick: (org: Organization) => void;
}

const OrganizationsTable: React.FC<OrganizationsTableProps> = ({ organizations, onRowClick }) => {
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
                    {organizations.map(org => (
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
                    {organizations.length === 0 && (
                        <tr><td colSpan={4} className="text-center p-8">No organizations found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrganizationsTable;
