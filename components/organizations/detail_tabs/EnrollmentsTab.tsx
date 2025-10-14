import React from 'react';
import { AnyContact, Campaign } from '../../../types';
import Button from '../../ui/Button';
import { Plus } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';

interface EnrollmentsTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const EnrollmentsTab: React.FC<EnrollmentsTabProps> = ({ contact, isReadOnly }) => {
    const enrollments = contact.enrollments || [];
    const { campaignsQuery } = useData();
    const { data: campaigns = [] } = campaignsQuery;
    const campaignMap = new Map((campaigns as Campaign[]).map(c => [c.id, c]));


    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Current Enrollments</h4>
                {!isReadOnly && (
                    <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />}>Add Enrollment</Button>
                )}
            </div>
            {enrollments.length > 0 ? (
                <div className="space-y-3">
                    {enrollments.map(enrollment => {
                        const campaign = campaignMap.get(enrollment.campaignId);
                        if (!campaign) return null;

                        return (
                        <div key={enrollment.campaignId} className="p-3 bg-card-bg/50 rounded-md border border-border-subtle">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-text-primary">{campaign.name}</p>
                                    <p className="text-xs text-text-secondary">
                                        Next step on: {new Date(enrollment.waitUntil).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${
                                    campaign.status === 'Active' ? 'bg-success/10 text-success' 
                                    : 'bg-slate-400/10 text-text-secondary'
                                }`}>
                                    {campaign.status}
                                </span>
                            </div>
                        </div>
                    )})}
                </div>
            ) : (
                <div className="text-center py-12 text-text-secondary">
                    <p>No enrollments found.</p>
                </div>
            )}
        </div>
    );
};

export default EnrollmentsTab;
