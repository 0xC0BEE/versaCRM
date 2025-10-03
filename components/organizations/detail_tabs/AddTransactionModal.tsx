import React, { useMemo } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import toast from 'react-hot-toast';
// FIX: Corrected the import path for types to be a valid relative path.
import { Transaction } from '../../../types';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../../contexts/DataContext';
import { useForm } from '../../../hooks/useForm';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactId: string;
    chargeToPay: Transaction | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, contactId, chargeToPay }) => {
    const { createTransactionMutation } = useData();

    const initialState = useMemo(() => ({
        type: (chargeToPay ? 'Payment' : 'Charge') as Transaction['type'],
        amount: chargeToPay ? chargeToPay.amount : 0,
        date: new Date().toISOString().split('T')[0],
        method: 'Credit Card' as Transaction['method'],
        orderId: chargeToPay ? chargeToPay.orderId : undefined,
        relatedChargeId: (chargeToPay && !chargeToPay.orderId) ? chargeToPay.id : undefined,
    }), [chargeToPay]);

    // The dependency is now tied to whether the modal is open.
    // When it opens, the dependency becomes the initialState object, triggering a reset.
    // When it closes, the dependency becomes null, also triggering a reset for the next open.
    const formDependency = isOpen ? initialState : null;
    const { formData, handleChange } = useForm(initialState, formDependency);

    const handleSave = () => {
        if (formData.amount <= 0) {
            toast.error("Amount must be greater than zero.");
            return;
        }
        
        createTransactionMutation.mutate({ contactId, data: formData }, {
            onSuccess: () => onClose()
        });
    };

    const isPending = createTransactionMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={chargeToPay ? `Log Payment for Charge #${chargeToPay.id.slice(-6)}` : 'Add New Transaction'}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Select id="trans-type" label="Type" value={formData.type} onChange={e => handleChange('type', e.target.value as any)} disabled={!!chargeToPay || isPending}>
                        <option>Charge</option>
                        <option>Payment</option>
                        <option>Refund</option>
                        <option>Credit</option>
                    </Select>
                     <Input id="trans-amount" label="Amount" type="number" min="0.01" step="0.01" value={formData.amount} onChange={e => handleChange('amount', parseFloat(e.target.value) || 0)} disabled={isPending} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="trans-date" label="Date" type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} disabled={isPending} />
                    <Select id="trans-method" label="Method" value={formData.method} onChange={e => handleChange('method', e.target.value as any)} disabled={isPending}>
                        <option>Credit Card</option>
                        <option>Bank Transfer</option>
                        <option>Cash</option>
                        <option>Insurance</option>
                        <option>Other</option>
                    </Select>
                </div>
            </div>
             <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Transaction'}</Button>
            </div>
        </Modal>
    );
};

export default AddTransactionModal;