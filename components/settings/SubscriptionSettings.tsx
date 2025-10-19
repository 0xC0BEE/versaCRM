import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { SubscriptionPlan } from '../../types';
import Button from '../ui/Button';
import { Plus, Edit, Trash2, Power, PowerOff, CheckCircle } from 'lucide-react';
import SubscriptionPlanEditModal from './SubscriptionPlanEditModal';
import toast from 'react-hot-toast';

const BillingAndCommerceSettings: React.FC = () => {
    const { subscriptionPlansQuery, deleteSubscriptionPlanMutation, organizationSettingsQuery, updateOrganizationSettingsMutation } = useData();
    const { data: plans = [], isLoading: plansLoading } = subscriptionPlansQuery;
    const { data: settings, isLoading: settingsLoading } = organizationSettingsQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

    const handleAdd = () => {
        setSelectedPlan(null);
        setIsModalOpen(true);
    };

    const handleEdit = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handleDelete = (planId: string) => {
        if (window.confirm("Are you sure you want to delete this plan?")) {
            deleteSubscriptionPlanMutation.mutate(planId);
        }
    };
    
    const handleToggleGateway = () => {
        const isConnected = !!settings?.paymentGateway?.isConnected;
        updateOrganizationSettingsMutation.mutate({
            paymentGateway: { isConnected: !isConnected, provider: isConnected ? undefined : 'stripe' }
        }, {
            onSuccess: () => toast.success(`Payment gateway ${!isConnected ? 'connected' : 'disconnected'}!`)
        });
    };

    const isLoading = plansLoading || settingsLoading;

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Subscription Plans</h3>
                        <p className="text-sm text-text-secondary">Manage your recurring billing plans.</p>
                    </div>
                    <Button size="sm" onClick={handleAdd} leftIcon={<Plus size={14} />}>
                        New Plan
                    </Button>
                </div>

                {isLoading ? (
                    <p>Loading plans...</p>
                ) : (
                    <div className="space-y-3">
                        {(plans as SubscriptionPlan[]).map((plan: SubscriptionPlan) => (
                            <div key={plan.id} className="p-3 border border-border-subtle rounded-md bg-card-bg/50 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{plan.name}</p>
                                    <p className="text-xs text-text-secondary">
                                        {plan.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / {plan.billingCycle}
                                    </p>
                                </div>
                                <div className="space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(plan)} leftIcon={<Edit size={14} />}>Edit</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(plan.id)} leftIcon={<Trash2 size={14} />} disabled={deleteSubscriptionPlanMutation.isPending}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {plans.length === 0 && (
                            <p className="text-sm text-text-secondary py-4">No subscription plans created yet.</p>
                        )}
                    </div>
                )}
            </div>
            
            <div className="border-t border-border-subtle pt-8">
                <h3 className="text-lg font-semibold">Payment Gateway</h3>
                 <p className="text-sm text-text-secondary mb-4">Connect a payment provider to accept payments online.</p>
                 <div className="p-4 border border-border-subtle rounded-lg bg-card-bg/50 flex justify-between items-center">
                    <div>
                        <h4 className="font-medium">Stripe</h4>
                        {settings?.paymentGateway?.isConnected ? (
                            <p className="text-sm text-success flex items-center gap-2"><CheckCircle size={14}/> Connected</p>
                        ) : (
                            <p className="text-sm text-text-secondary">Not Connected</p>
                        )}
                    </div>
                    <Button 
                        size="sm" 
                        variant={settings?.paymentGateway?.isConnected ? 'danger' : 'secondary'}
                        onClick={handleToggleGateway}
                        leftIcon={settings?.paymentGateway?.isConnected ? <PowerOff size={14} /> : <Power size={14} />}
                        disabled={updateOrganizationSettingsMutation.isPending}
                    >
                        {settings?.paymentGateway?.isConnected ? 'Disconnect' : 'Connect with Stripe'}
                    </Button>
                 </div>
            </div>

            <SubscriptionPlanEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plan={selectedPlan}
            />
        </div>
    );
};

export default BillingAndCommerceSettings;