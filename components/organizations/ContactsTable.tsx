import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { AnyContact } from '../../types';
// FIX: Corrected import path for useApp.
import { useApp } from '../../contexts/AppContext';

interface ContactsTableProps {
    contacts: AnyContact[];
    onRowClick: (contact: AnyContact) => void;
    isError: boolean;
    selectedContactIds: Set<string>;
    setSelectedContactIds: (ids: Set<string>) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, onRowClick, isError, selectedContactIds, setSelectedContactIds }) => {
    const { industryConfig } = useApp();

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(contacts.map(c => c.id));
            setSelectedContactIds(allIds);
        } else {
            setSelectedContactIds(new Set());
        }
    };
    
    const handleSelectRow = (contactId: string) => {
        const newSelection = new Set(selectedContactIds);
        if (newSelection.has(contactId)) {
            newSelection.delete(contactId);
        } else {
            newSelection.add(contactId);
        }
        setSelectedContactIds(newSelection);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text-secondary">
                <thead className="text-sm text-text-secondary uppercase bg-card-bg/50">
                    <tr>
                        <th scope="col" className="p-4">
                             <div className="flex items-center">
                                <input 
                                    id="checkbox-all" 
                                    type="checkbox" 
                                    className="w-4 h-4 text-primary bg-card-bg border-border-subtle rounded focus:ring-primary"
                                    checked={contacts.length > 0 && selectedContactIds.size === contacts.length}
                                    onChange={handleSelectAll}
                                />
                                <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">{industryConfig.contactName}</th>
                        <th scope="col" className="px-6 py-3 font-medium">Email</th>
                        <th scope="col" className="px-6 py-3 font-medium">Phone</th>
                        <th scope="col" className="px-6 py-3 font-medium">Status</th>
                        <th scope="col" className="px-6 py-3 font-medium">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {isError && (
                        <tr><td colSpan={6} className="text-center p-8 text-error">
                            Failed to load {industryConfig.contactNamePlural.toLowerCase()}. Please try again later.
                        </td></tr>
                    )}
                    {!isError && contacts.map((contact, index) => (
                        <tr
                            key={contact.id}
                            className={`border-b border-border-subtle h-[52px] hover:bg-hover-bg animate-fade-in-up ${selectedContactIds.has(contact.id) ? 'bg-primary/10' : ''}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <td className="w-4 p-4">
                                <div className="flex items-center">
                                    <input 
                                        id={`checkbox-${contact.id}`} 
                                        type="checkbox" 
                                        className="w-4 h-4 text-primary bg-card-bg border-border-subtle rounded focus:ring-primary"
                                        checked={selectedContactIds.has(contact.id)}
                                        onChange={() => handleSelectRow(contact.id)}
                                    />
                                    <label htmlFor={`checkbox-${contact.id}`} className="sr-only">checkbox</label>
                                </div>
                            </td>
                            <td 
                                className="px-6 py-4 font-medium text-text-primary whitespace-nowrap cursor-pointer"
                                onClick={() => onRowClick(contact)}
                            >
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full mr-3 bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center">
                                        {contact.avatar ? (
                                            <img src={contact.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className="font-bold text-slate-500">{contact.contactName.charAt(0)}</span>
                                        )}
                                    </div>
                                    {contact.contactName}
                                </div>
                            </td>
                            <td className="px-6 py-4 cursor-pointer" onClick={() => onRowClick(contact)}>{contact.email}</td>
                            <td className="px-6 py-4 cursor-pointer" onClick={() => onRowClick(contact)}>{contact.phone}</td>
                            <td className="px-6 py-4 cursor-pointer" onClick={() => onRowClick(contact)}>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${
                                    contact.status === 'Active' ? 'bg-success/10 text-success' :
                                    contact.status === 'Lead' ? 'bg-primary/10 text-primary' :
                                    'bg-slate-400/10 text-text-secondary'
                                }`}>
                                    {contact.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 cursor-pointer" onClick={() => onRowClick(contact)}>{new Date(contact.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {!isError && contacts.length === 0 && (
                        <tr><td colSpan={6} className="text-center p-8">
                             <p className="text-text-secondary">No {industryConfig.contactNamePlural.toLowerCase()} found.</p>
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ContactsTable;
