import React, { useState } from 'react';
import { AnyContact, Transaction } from '../../../types';
import Button from '../../ui/Button';
import { Plus, TrendingUp, TrendingDown, Link as LinkIcon } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';

interface BillingTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const BillingTab: React.FC<BillingTabProps> = ({ contact, isReadOnly }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chargeToPay, setChargeToPay] = useState<Transaction | null>(null);

    const transactions = contact.transactions || [];
    
    const balance = transactions.reduce((acc, t) => {
        if (t.type === 'Payment' || t.type === 'Credit' || t.type === 'Refund') {
            return acc - t.amount;
        }
        return acc + t.amount;
    }, 0);
    
    const handleAddTransaction = (charge: Transaction | null = null) => {
        setChargeToPay(charge);
        setIsModalOpen(true);
    };

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Billing History</h4>
                {!isReadOnly && (
                    <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => handleAddTransaction()}>Add Transaction</Button>
                )}
            </div>
            
            <div className="p-4 mb-4 bg-hover-bg rounded-lg">
                <p className="text-sm text-text-secondary">Current Balance</p>
                <p className={`text-2xl font-bold ${balance > 0 ? 'text-error' : 'text-success'}`}>
                    {balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
            </div>

            {transactions.length > 0 ? (
                <div className="space-y-2">
                    {[...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
                        const isCredit = t.type === 'Payment' || t.type === 'Credit' || t.type === 'Refund';
                        const isChargeFromOrder = t.type === 'Charge' && t.orderId;

                        const isPendingCharge = t.type === 'Charge' && !transactions.some(p =>
                            p.type === 'Payment' &&
                            (
                                (t.orderId && p.orderId === t.orderId) ||
                                (!t.orderId && p.relatedChargeId === t.id)
                            )
                        );


                        return (
                            <div key={t.id} className="p-3 bg-card-bg/50 rounded-md border border-border-subtle flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-1.5 rounded-full ${isCredit ? 'bg-success/10' : 'bg-error/10'}`}>
                                        {isCredit ? <TrendingDown className="h-4 w-4 text-success" /> : <TrendingUp className="h-4 w-4 text-error" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm flex items-center">
                                            {t.type}
                                            {isChargeFromOrder && (
                                                <span title={`From Order #${t.orderId?.slice(-6)}`}>
                                                    <LinkIcon size={12} className="ml-2 text-text-secondary" />
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            {new Date(t.date).toLocaleDateString()} via {t.method}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                     {isPendingCharge && !isReadOnly && (
                                        <Button size="sm" variant="secondary" onClick={() => handleAddTransaction(t)}>Log Payment</Button>
                                     )}
                                    <p className={`font-semibold text-sm ${isCredit ? 'text-success' : 'text-error'}`}>
                                        {isCredit ? '-' : '+'} {t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 text-text-secondary">
                    <p>No transactions found.</p>
                </div>
            )}
            
            {isModalOpen && (
                <AddTransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    contactId={contact.id}
                    chargeToPay={chargeToPay}
                />
            )}
        </div>
    );
};

export default BillingTab;
