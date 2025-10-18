import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { AnyContact, ContactSubscription, SubscriptionPlan } from '../../../types';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { CreditCard, CheckCircle } from 'lucide-react';
import Button from '../../ui/Button';
import { format } from 'date-fns';
import PaymentModal from './PaymentModal';

const ClientBillingTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const { subscriptionPlansQuery, organizationSettingsQuery } = useData();
    const { data: plans = [] } = subscriptionPlansQuery;
    const { data: settings } = organizationSettingsQuery;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<ContactSubscription | null>(null);

    const { data: contact, isLoading: contactLoading } = useQuery<AnyContact | null, Error>({
        queryKey: ['contactProfile', authenticatedUser?.contactId],
        queryFn: () => apiClient.getContactById(authenticatedUser!.contactId!),
        enabled: !!authenticatedUser?.contactId,
    });
    
    const subscriptions = contact?.subscriptions || [];
    const planMap = useMemo(() => new Map((plans as SubscriptionPlan[]).map(p => [p.id, p])), [plans]);
    
    const handlePayNow = (sub: ContactSubscription) => {
        setSelectedSubscription(sub);
        setIsModalOpen(true);
    };

    if (contactLoading) {
        return <p>Loading billing information...</p>;
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">My Subscriptions</h3>
            {subscriptions.length > 0 ? (
                <div className="space-y-4">
                    {subscriptions.map(sub => {
                        const plan = planMap.get(sub.planId);
                        const isGatewayConnected = settings?.paymentGateway?.isConnected;

                        return (
                             <div key={sub.id} className="p-4 border border-border-subtle rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-text-primary">{plan?.name || 'Unknown Plan'}</p>
                                        <p className="text-sm text-text-secondary">
                                            {plan ? `${plan.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / ${plan.billingCycle}` : ''}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-micro capitalize ${
                                        sub.status === 'active' ? 'bg-success/10 text-success' : 'bg-slate-400/10 text-text-secondary'
                                    }`}>
                                        {sub.status}
                                    </span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-border-subtle flex justify-between items-center text-sm">
                                    <div className="text-text-secondary">
                                        {sub.status === 'active' ? (
                                            <p>Next payment due: <span className="font-semibold text-text-primary">{format(new Date(sub.nextBillingDate), 'PP')}</span></p>
                                        ) : (
                                             <p>Subscription is inactive.</p>
                                        )}
                                    </div>
                                    {sub.status === 'active' && isGatewayConnected && (
                                        <Button size="sm" onClick={() => handlePayNow(sub)}>
                                            Pay Now
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center py-12 text-text-secondary">
                    <CreditCard className="mx-auto h-12 w-12 text-text-secondary/50" />
                    <p className="mt-2">You have no active subscriptions.</p>
                </div>
            )}
            
            {isModalOpen && selectedSubscription && contact && (
                <PaymentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    subscription={selectedSubscription}
                    contact={contact}
                    plan={planMap.get(selectedSubscription.planId)!}
                />
            )}
        </div>
    );
};

export default ClientBillingTab;