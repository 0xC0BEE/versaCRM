import React, { useState } from 'react';
import { AnyContact, SubscriptionPlan } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import { useData } from '../../../contexts/DataContext';
import toast from 'react-hot-toast';

interface SubscribeContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact;
}

const SubscribeContactModal: React.FC<SubscribeContactModalProps> = ({ isOpen, onClose, contact }) => {
    const { subscriptionPlansQuery, subscribeContactMutation } = useData();
    const { data: plans = [], isLoading } = subscriptionPlansQuery;
    const [selectedPlanId, setSelectedPlanId] = useState('');

    const handleSubscribe = () => {
        if (!selectedPlanId) {
            toast.error("Please select a subscription plan.");
            return;
        }
        subscribeContactMutation.mutate({ contactId: contact.id, planId: selectedPlanId }, {
            onSuccess: () => {
                toast.success(`${contact.contactName} subscribed successfully!`);
                onClose();
            }
        });
    };

    const isPending = subscribeContactMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Subscribe ${contact.contactName} to a Plan`}>
            {isLoading ? <p>Loading plans...</p> : (
                <div className="space-y-4">
                    <Select
                        id="subscription-plan"
                        label="Select a Plan"
                        value={selectedPlanId}
                        onChange={e => setSelectedPlanId(e.target.value)}
                        disabled={isPending}
                    >
                        <option value="">-- Choose a plan --</option>
                        {(plans as SubscriptionPlan[]).map(plan => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name} ({plan.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / {plan.billingCycle})
                            </option>
                        ))}
                    </Select>
                </div>
            )}
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSubscribe} disabled={isPending || !selectedPlanId}>
                    {isPending ? 'Subscribing...' : 'Subscribe'}
                </Button>
            </div>
        </Modal>
    );
};

export default SubscribeContactModal;