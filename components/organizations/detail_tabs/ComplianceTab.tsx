import React, { useMemo } from 'react';
import { AnyContact, FinancialComplianceData, KYCStatus, AMLRisk } from '../../../types';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import Textarea from '../../ui/Textarea';
import { useData } from '../../../contexts/DataContext';
import { useForm } from '../../../hooks/useForm';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ComplianceTabProps {
    contact: AnyContact;
}

const ComplianceTab: React.FC<ComplianceTabProps> = ({ contact }) => {
    const { updateContactMutation } = useData();

    const initialState = useMemo((): FinancialComplianceData => ({
        kycStatus: 'Not Started',
        amlRisk: 'Low',
        amlNotes: '',
    }), []);
    
    const { formData, handleChange, setFormData } = useForm(initialState, contact.financialComplianceData);

    const handleSave = () => {
        const updatedData = { ...formData };
        if (contact.financialComplianceData?.kycStatus !== updatedData.kycStatus) {
            updatedData.lastKycCheck = new Date().toISOString();
        }
        if (contact.financialComplianceData?.amlRisk !== updatedData.amlRisk) {
            updatedData.lastAmlCheck = new Date().toISOString();
        }

        updateContactMutation.mutate(
            { ...contact, financialComplianceData: updatedData },
            { onSuccess: () => toast.success("Compliance details updated.") }
        );
    };

    const isPending = updateContactMutation.isPending;

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1 pr-4 space-y-6">
            <div>
                <h4 className="font-semibold text-lg">KYC (Know Your Customer)</h4>
                <div className="mt-2 p-4 border border-border-subtle rounded-lg space-y-4">
                    <Select
                        id="kyc-status"
                        label="KYC Status"
                        value={formData.kycStatus}
                        onChange={e => handleChange('kycStatus', e.target.value as KYCStatus)}
                        disabled={isPending}
                    >
                        <option>Not Started</option>
                        <option>Pending</option>
                        <option>Verified</option>
                        <option>Rejected</option>
                    </Select>
                    <div>
                        <p className="text-sm font-medium text-text-primary mb-1">Last Status Change</p>
                        <p className="text-sm text-text-secondary h-10 flex items-center">
                            {formData.lastKycCheck ? format(new Date(formData.lastKycCheck), 'PPpp') : 'Never'}
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-lg">AML (Anti-Money Laundering)</h4>
                <div className="mt-2 p-4 border border-border-subtle rounded-lg space-y-4">
                     <Select
                        id="aml-risk"
                        label="AML Risk Level"
                        value={formData.amlRisk}
                        onChange={e => handleChange('amlRisk', e.target.value as AMLRisk)}
                        disabled={isPending}
                    >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </Select>
                     <div>
                        <p className="text-sm font-medium text-text-primary mb-1">Last Risk Assessment</p>
                        <p className="text-sm text-text-secondary h-10 flex items-center">
                            {formData.lastAmlCheck ? format(new Date(formData.lastAmlCheck), 'PPpp') : 'Never'}
                        </p>
                    </div>
                    <Textarea
                        id="aml-notes"
                        label="AML Notes"
                        value={formData.amlNotes || ''}
                        onChange={e => handleChange('amlNotes', e.target.value)}
                        rows={4}
                        placeholder="Log any AML checks, findings, or notes here..."
                        disabled={isPending}
                    />
                </div>
            </div>
            
             <div className="mt-4 pt-4 border-t border-border-subtle flex justify-end">
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Compliance Details'}
                </Button>
            </div>
        </div>
    );
};

export default ComplianceTab;
