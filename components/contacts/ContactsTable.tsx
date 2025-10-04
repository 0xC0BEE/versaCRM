import React from 'react';
import { AnyContact } from '../../types';
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
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-dark-card/50 dark:text-slate-400">
                    <tr>
                        <th scope="col" className="p-4">
                             <div className="flex items-center">
                                <input 
                                    id="checkbox-all" 
                                    type="checkbox" 
                                    className="w-4 h-4 text-accent-blue bg-slate-100 border-slate-300 rounded focus:ring-accent-blue"
                                    checked={contacts.length > 0 && selectedContactIds.size === contacts.length}
                                    onChange={handleSelectAll}
                                />
                                <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3">{industryConfig.contactName}</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Phone</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {isError && (
                        <tr><td colSpan={6} className="text-center p-8 text-red-500">
                            Failed to load {industryConfig.contactNamePlural.toLowerCase()}. Please try again later.
                        </td></tr>
                    )}
                    {!isError && contacts.map((contact, index) => (
                        <tr
                            key={contact.id}
                            className={`bg-light-card border-b dark:bg-dark-card border-light-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-700/50 animate-fadeInUp ${selectedContactIds.has(contact.id) ? 'bg-accent-blue/10 dark:bg-accent-blue/20' : ''}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <td className="w-4 p-4">
                                <div className="flex items-center">
                                    <input 
                                        id={`checkbox-${contact.id}`} 
                                        type="checkbox" 
                                        className="w-4 h-4 text-accent-blue bg-slate-100 border-slate-300 rounded focus:ring-accent-blue"
                                        checked={selectedContactIds.has(contact.id)}
                                        onChange={() => handleSelectRow(contact.id)}
                                    />
                                    <label htmlFor={`checkbox-${contact.id}`} className="sr-only">checkbox</label>
                                </div>
                            </td>
                            <td 
                                className="px-6 py-4 font-medium text-light-text dark:text-dark-text whitespace-nowrap cursor-pointer"
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
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    contact.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                    contact.status === 'Lead' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                    'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'
                                }`}>
                                    {contact.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 cursor-pointer" onClick={() => onRowClick(contact)}>{new Date(contact.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {!isError && contacts.length === 0 && (
                        <tr><td colSpan={6} className="text-center p-8">
                             <p className="text-slate-500">No {industryConfig.contactNamePlural.toLowerCase()} found.</p>
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ContactsTable;