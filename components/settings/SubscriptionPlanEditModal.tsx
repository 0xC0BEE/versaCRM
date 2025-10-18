import React, { useMemo } from 'react';
import { SubscriptionPlan } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface SubscriptionPlanEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: SubscriptionPlan | null;
}

const SubscriptionPlanEditModal: React.FC<SubscriptionPlanEditModalProps> = ({ isOpen, onClose, plan }) => {
    const { createSubscriptionPlanMutation, updateSubscriptionPlanMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !plan;

    const initialState = useMemo(() => ({
        name: '',
        price: 0,
        billingCycle: 'monthly' as 'monthly' | 'yearly',
    }), []);

    const { formData, handleChange } = useForm(initialState, plan);

    const handleSave = () => {
        if (!formData.name.trim() || formData.price <= 0) {
            toast.error("Plan name and a positive price are required.");
            return;
        }

        if (isNew) {
            createSubscriptionPlanMutation.mutate({
                ...formData,
                organizationId: authenticatedUser!.organizationId,
            }, { onSuccess: onClose });
        } else {
            updateSubscriptionPlanMutation.mutate({ ...plan!, ...formData }, { onSuccess: onClose });
        }
    };

    const isPending = createSubscriptionPlanMutation.isPending || updateSubscriptionPlanMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Subscription Plan' : 'Edit Plan'}>
            <div className="space-y-4">
                <Input
                    id="plan-name"
                    label="Plan Name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    disabled={isPending}
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        id="plan-price"
                        label="Price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                        required
                        disabled={isPending}
                    />
                    <Select
                        id="plan-cycle"
                        label="Billing Cycle"
                        value={formData.billingCycle}
                        onChange={(e) => handleChange('billingCycle', e.target.value as any)}
                        disabled={isPending}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </Select>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Plan'}
                </Button>
            </div>
        </Modal>
    );
};

export default SubscriptionPlanEditModal;