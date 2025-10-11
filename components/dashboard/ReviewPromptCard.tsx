import React from 'react';
import { AnyContact } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FileText, ArrowRight } from 'lucide-react';

interface ReviewPromptCardProps {
    contact: AnyContact;
    onReviewClick: () => void;
}

const ReviewPromptCard: React.FC<ReviewPromptCardProps> = ({ contact, onReviewClick }) => {
    return (
        <Card className="bg-success/5 border-success/20 h-full">
             <div className="flex flex-col h-full">
                <div className="flex-grow">
                     <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-success/10">
                            <FileText className="h-5 w-5 text-success" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-primary">Action Required</h4>
                            <p className="text-sm text-text-secondary mt-1">
                                New documents have been added to <span className="font-medium text-text-primary">{contact.contactName}</span>'s profile.
                            </p>
                        </div>
                     </div>
                 </div>

                <div className="mt-4 flex justify-end">
                    <Button variant="secondary" size="sm" onClick={onReviewClick}>
                        Review Now <ArrowRight size={14} className="ml-2" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ReviewPromptCard;