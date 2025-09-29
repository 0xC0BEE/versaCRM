import React, { useState } from 'react';
// FIX: Imported correct types.
import { AnyContact, Order } from '../../../types';
import Button from '../../ui/Button';
import { Plus } from 'lucide-react';
import OrderEditModal from './OrderEditModal';

interface OrdersTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ contact, isReadOnly }) => {
    const orders = contact.orders || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const handleEdit = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedOrder(null);
        setIsModalOpen(true);
    };

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Order History</h4>
                {!isReadOnly && (
                    <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={handleAdd}>New Order</Button>
                )}
            </div>
            {orders.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-4 py-3">Order ID</th>
                                <th scope="col" className="px-4 py-3">Date</th>
                                <th scope="col" className="px-4 py-3">Status</th>
                                <th scope="col" className="px-4 py-3">Payment</th>
                                <th scope="col" className="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} onClick={() => handleEdit(order)} className="bg-white border-b dark:bg-dark-card dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">#{order.id.slice(-6)}</td>
                                    <td className="px-4 py-3">{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">{order.status}</td>
                                    <td className="px-4 py-3">{order.paymentStatus}</td>
                                    <td className="px-4 py-3 text-right font-mono">{order.total.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>No orders found.</p>
                </div>
            )}
            <OrderEditModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                contact={contact}
            />
        </div>
    );
};

export default OrdersTab;
