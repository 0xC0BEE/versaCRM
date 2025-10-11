import React from 'react';
import { AnyContact } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { Bot, MessageSquare } from 'lucide-react';

interface ContactCardProps {
    contact: AnyContact;
    aiSuggestion?: string;
    onEmailClick: () => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, aiSuggestion, onEmailClick }) => {
    return (
        <Card className={`h-full flex flex-col ${aiSuggestion ? 'animate-pulse-predictive' : ''}`}>
            <CardHeader className="flex-row items-start gap-4 space-y-0">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center">
                    {contact.avatar ? (
                        <img src={contact.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <span className="font-bold text-slate-500 text-lg">{contact.contactName.charAt(0)}</span>
                    )}
                </div>
                <div>
                    <CardTitle className="text-base">{contact.contactName}</CardTitle>
                    <CardDescription>{contact.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow pt-0">
                {aiSuggestion && (
                    <div className="p-2.5 rounded-md bg-hover-bg text-sm text-text-secondary">
                        <div className="flex items-start gap-2">
                           <Bot size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                           <p>{aiSuggestion}</p>
                        </div>
                    </div>
                )}
            </CardContent>
            
            <CardFooter>
                <Button variant="secondary" size="sm" leftIcon={<MessageSquare size={14} />} onClick={onEmailClick} className="ml-auto">Email</Button>
            </CardFooter>
        </Card>
    );
};

export default ContactCard;