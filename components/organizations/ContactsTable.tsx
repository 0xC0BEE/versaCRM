import React from 'react';
// FIX: Imported correct type.
import { AnyContact } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface ContactsTableProps {
    contacts: AnyContact[];
    onRowClick: (contact: AnyContact) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, onRowClick }) => {
    // FIX: industryConfig is now correctly provided by useApp hook.
    const { industryConfig } = useApp();

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Phone</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map(contact => (
                        <tr
                            key={contact.id}
                            onClick={() => onRowClick(contact)}
                            className="bg-white border-b dark:bg-dark-card dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                        >
                            {/* FIX: Used contactName instead of fullName */}
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{contact.contactName}</td>
                            <td className="px-6 py-4">{contact.email}</td>
                            <td className="px-6 py-4">{contact.phone}</td>
                            <td className="px-6 py-4">{contact.status}</td>
                            <td className="px-6 py-4">{new Date(contact.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {contacts.length === 0 && (
                        <tr><td colSpan={5} className="text-center p-8">No {industryConfig.contactNamePlural.toLowerCase()} found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ContactsTable;
