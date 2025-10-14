import React from 'react';
import { AnyContact } from '../../types';
import { Mail, Phone, Briefcase } from 'lucide-react';
import Button from '../ui/Button';

interface ContactInspectorProps {
    contact: AnyContact;
}

const ContactInspector: React.FC<ContactInspectorProps> = ({ contact }) => {
    return (
        <div className="p-4">
            <div className="text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    {contact.avatar ? (
                        <img src={contact.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <span className="font-bold text-slate-500 text-3xl">{contact.contactName.charAt(0)}</span>
                    )}
                </div>
                <h3 className="font-semibold text-lg">{contact.contactName}</h3>
                <p className="text-sm text-text-secondary">{contact.status}</p>
            </div>

            <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                    <Mail size={16} className="text-text-secondary" />
                    <span className="text-text-primary truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Phone size={16} className="text-text-secondary" />
                    <span className="text-text-primary">{contact.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Briefcase size={16} className="text-text-secondary" />
                    <span className="text-text-primary">{contact.leadSource}</span>
                </div>
            </div>

            <div className="mt-6 text-center">
                <Button variant="secondary">View Full Profile</Button>
            </div>
        </div>
    );
};

export default ContactInspector;