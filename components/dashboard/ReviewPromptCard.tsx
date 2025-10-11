import React from 'react';
import { AnyContact } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { FileText, ArrowRight } from 'lucide-react';

interface ReviewPromptCardProps {
    contact: AnyContact;
    onReviewClick: () => void;
}

const ReviewPromptCard: React.FC<ReviewPromptCardProps> = ({ contact, onReviewClick }) => {
    return (
        <Card className="bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/20 h-full flex flex-col">
             <CardHeader>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-500/10">
                        <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Action Required</CardTitle>
                    </div>
                </div>
             </CardHeader>
             <CardContent className="flex-grow pt-0">
                <p className="text-sm text-text-secondary">
                    New documents have been added to <span className="font-medium text-text-primary">{contact.contactName}</span>'s profile.
                </p>
             </CardContent>
            <CardFooter>
                <Button variant="secondary" size="sm" onClick={onReviewClick} className="ml-auto">
                    Review Now <ArrowRight size={14} className="ml-2" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ReviewPromptCard;