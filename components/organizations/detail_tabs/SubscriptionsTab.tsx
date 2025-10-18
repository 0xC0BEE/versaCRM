import React, { useState, useMemo } from 'react';
import { AnyContact, ContactSubscription, SubscriptionPlan } from '../../../types';
import Button from '../../ui/Button';
import { Plus, CreditCard, XCircle } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { format } from 'date-fns';
import SubscribeContactModal from './SubscribeContactModal';
import toast from 'react-hot-toast';

interface SubscriptionsTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({ contact, isReadOnly }) => {
    const { subscriptionPlansQuery, cancelSubscriptionMutation } = useData();
    const { data: plans = [] } = subscriptionPlansQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const subscriptions = contact.subscriptions || [];
    const planMap = useMemo(() => new Map((plans as SubscriptionPlan[]).map(p => [p.id, p])), [plans]);

    const handleCancel = (subscriptionId: string) => {
        if (window.confirm("Are you sure you want to cancel this subscription?")) {
            cancelSubscriptionMutation.mutate({ contactId: contact.id, subscriptionId }, {
                onSuccess: () => toast.success("Subscription cancelled.")
            });
        }
    };

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Subscriptions</h4>
                {!isReadOnly && (
                    <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
                        Add Subscription
                    </Button>
                )}
            </div>
            {subscriptions.length > 0 ? (
                <div className="space-y-3">
                    {subscriptions.map(sub => {
                        const plan = planMap.get(sub.planId);
                        return (
                            <div key={sub.id} className="p-3 bg-card-bg/50 rounded-md border border-border-subtle">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-text-primary">{plan?.name || 'Unknown Plan'}</p>
                                        <p className="text-xs text-text-secondary">
                                            {plan ? `${plan.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / ${plan.billingCycle}` : ''}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-micro capitalize ${
                                        sub.status === 'active' ? 'bg-success/10 text-success' : 'bg-slate-400/10 text-text-secondary'
                                    }`}>
                                        {sub.status}
                                    </span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-border-subtle flex justify-between items-center text-xs">
                                    <div className="text-text-secondary">
                                        <p>Started: {format(new Date(sub.startDate), 'PP')}</p>
                                        {sub.status === 'active' && <p>Next billing: {format(new Date(sub.nextBillingDate), 'PP')}</p>}
                                    </div>
                                    {sub.status === 'active' && !isReadOnly && (
                                        <Button size="sm" variant="danger" onClick={() => handleCancel(sub.id)} leftIcon={<XCircle size={14} />} disabled={cancelSubscriptionMutation.isPending}>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 text-text-secondary">
                    <CreditCard className="mx-auto h-12 w-12 text-text-secondary/50" />
                    <p className="mt-2">No subscriptions found for this contact.</p>
                </div>
            )}
            {isModalOpen && (
                <SubscribeContactModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    contact={contact}
                />
            )}
        </div>
    );
};

export default SubscriptionsTab;