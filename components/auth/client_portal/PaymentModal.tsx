import React, { useState } from 'react';
import { AnyContact, ContactSubscription, SubscriptionPlan } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { useData } from '../../../contexts/DataContext';
import toast from 'react-hot-toast';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscription: ContactSubscription;
    contact: AnyContact;
    plan: SubscriptionPlan;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, subscription, contact, plan }) => {
    const { paySubscriptionMutation } = useData();

    const handlePayment = () => {
        paySubscriptionMutation.mutate({ contactId: contact.id, subscriptionId: subscription.id }, {
            onSuccess: () => {
                toast.success("Payment successful!");
                onClose();
            }
        });
    };

    const isPending = paySubscriptionMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Pay for ${plan.name}`}>
            <div className="space-y-4">
                <div className="p-4 bg-hover-bg rounded-lg text-center">
                    <p className="text-sm text-text-secondary">Amount Due</p>
                    <p className="text-3xl font-bold text-text-primary">
                        {plan.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-2">Payment Details (Simulation)</h4>
                    <div className="space-y-3 p-4 border border-border-subtle rounded-lg">
                        <Input id="card-name" label="Name on Card" defaultValue={contact.contactName} disabled />
                        <Input id="card-number" label="Card Number" defaultValue="**** **** **** 4242" disabled leftIcon={<CreditCard />} />
                        <div className="grid grid-cols-2 gap-3">
                            <Input id="card-expiry" label="Expiry (MM/YY)" defaultValue="12/25" disabled />
                            <Input id="card-cvc" label="CVC" defaultValue="123" disabled />
                        </div>
                    </div>
                </div>
            </div>
             <div className="mt-6 flex justify-end">
                <Button onClick={handlePayment} disabled={isPending} leftIcon={<Lock size={16} />}>
                    {isPending ? 'Processing...' : `Pay ${plan.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                </Button>
            </div>
        </Modal>
    );
};

export default PaymentModal;