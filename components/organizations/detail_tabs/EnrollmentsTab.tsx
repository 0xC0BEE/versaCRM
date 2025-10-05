import React from 'react';
import { AnyContact } from '../../../types';
import Button from '../../ui/Button';
import { Plus } from 'lucide-react';

interface EnrollmentsTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const EnrollmentsTab: React.FC<EnrollmentsTabProps> = ({ contact, isReadOnly }) => {
    const enrollments = contact.enrollments || [];

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
                    {enrollments.map(enrollment => (
                        <div key={enrollment.id} className="p-3 bg-card-bg/50 rounded-md border border-border-subtle">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-text-primary">{enrollment.programName}</p>
                                    <p className="text-xs text-text-secondary">
                                        Start Date: {new Date(enrollment.startDate).toLocaleDateString()}
                                        {enrollment.endDate && ` - End Date: ${new Date(enrollment.endDate).toLocaleDateString()}`}
                                    </p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${
                                    enrollment.status === 'Active' ? 'bg-success/10 text-success' 
                                    : 'bg-slate-400/10 text-text-secondary'
                                }`}>
                                    {enrollment.status}
                                </span>
                            </div>
                        </div>
                    ))}
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