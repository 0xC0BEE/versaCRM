import React from 'react';
import { AnyContact } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Bot, MessageSquare } from 'lucide-react';

interface ContactCardProps {
    contact: AnyContact;
    aiSuggestion?: string;
    onEmailClick: () => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, aiSuggestion, onEmailClick }) => {
    return (
        <Card className={`card-hover ${aiSuggestion ? 'animate-pulse-predictive' : ''}`}>
            <div className="flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full mr-3 bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center">
                            {contact.avatar ? (
                                <img src={contact.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span className="font-bold text-slate-500 text-lg">{contact.contactName.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-primary text-lg">{contact.contactName}</h4>
                            <p className="text-sm text-text-secondary">{contact.email}</p>
                        </div>
                    </div>

                    {aiSuggestion && (
                        <div className="mb-4 p-2.5 rounded-md bg-primary/10 border border-primary/20 text-sm text-primary">
                            <div className="flex items-start gap-2">
                               <Bot size={18} className="flex-shrink-0 mt-0.5" />
                               <p>{aiSuggestion}</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<MessageSquare size={14} />} onClick={onEmailClick}>Email</Button>
                </div>
            </div>
        </Card>
    );
};

export default ContactCard;