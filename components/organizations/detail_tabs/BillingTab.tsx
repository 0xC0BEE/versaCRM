import React, { useState } from 'react';
// FIX: Imported correct types.
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
            
            <div className="p-4 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
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
                            <div key={t.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-dark-border flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-1.5 rounded-full ${isCredit ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                        {isCredit ? <TrendingDown className="h-4 w-4 text-green-600" /> : <TrendingUp className="h-4 w-4 text-red-600" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm flex items-center">
                                            {t.type}
                                            {isChargeFromOrder && (
                                                <span title={`From Order #${t.orderId?.slice(-6)}`}>
                                                    <LinkIcon size={12} className="ml-2 text-gray-400" />
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(t.date).toLocaleDateString()} via {t.method}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                     {isPendingCharge && !isReadOnly && (
                                        <Button size="sm" variant="secondary" onClick={() => handleAddTransaction(t)}>Log Payment</Button>
                                     )}
                                    <p className={`font-semibold text-sm ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                        {isCredit ? '-' : '+'} {t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
