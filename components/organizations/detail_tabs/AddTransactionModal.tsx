import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import toast from 'react-hot-toast';
// FIX: Imported correct type.
import { Transaction } from '../../../types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactId: string;
    chargeToPay: Transaction | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, contactId, chargeToPay }) => {

    const getInitialState = () => ({
        type: (chargeToPay ? 'Payment' : 'Charge') as Transaction['type'],
        amount: chargeToPay ? chargeToPay.amount : 0,
        date: new Date().toISOString().split('T')[0],
        method: 'Credit Card' as Transaction['method'],
        orderId: chargeToPay ? chargeToPay.orderId : undefined,
        relatedChargeId: (chargeToPay && !chargeToPay.orderId) ? chargeToPay.id : undefined,
    });

    const [data, setData] = useState(getInitialState());

    useEffect(() => {
        setData(getInitialState());
    }, [isOpen, chargeToPay]);

    const handleSave = () => {
        if (data.amount <= 0) {
            toast.error("Amount must be greater than zero.");
            return;
        }
        // Mock save
        toast.success("Transaction saved successfully!");
        console.log("Saving transaction:", { ...data, contactId });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={chargeToPay ? `Log Payment for Charge #${chargeToPay.id.slice(-6)}` : 'Add New Transaction'}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Select id="trans-type" label="Type" value={data.type} onChange={e => setData(d => ({...d, type: e.target.value as any}))} disabled={!!chargeToPay}>
                        <option>Charge</option>
                        <option>Payment</option>
                        <option>Refund</option>
                        <option>Credit</option>
                    </Select>
                     <Input id="trans-amount" label="Amount" type="number" value={data.amount} onChange={e => setData(d => ({...d, amount: parseFloat(e.target.value) || 0}))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="trans-date" label="Date" type="date" value={data.date} onChange={e => setData(d => ({...d, date: e.target.value}))} />
                    <Select id="trans-method" label="Method" value={data.method} onChange={e => setData(d => ({...d, method: e.target.value as any}))}>
                        <option>Credit Card</option>
                        <option>Bank Transfer</option>
                        <option>Cash</option>
                        <option>Insurance</option>
                        <option>Other</option>
                    </Select>
                </div>
            </div>
             <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Transaction</Button>
            </div>
        </Modal>
    );
};

export default AddTransactionModal;
