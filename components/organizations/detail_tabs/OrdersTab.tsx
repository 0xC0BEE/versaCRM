import React, { useState } from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { AnyContact, Order } from '../../../types';
import Button from '../../ui/Button';
import { Plus, ShoppingCart } from 'lucide-react';
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
                    <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={handleAdd}>Add Order</Button>
                )}
            </div>
            {orders.length > 0 ? (
                <div className="space-y-3">
                    {orders.map(order => (
                        <div key={order.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-dark-border cursor-pointer hover:bg-gray-100" onClick={() => handleEdit(order)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">Order #{order.id.slice(-6)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Date: {new Date(order.orderDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-800 dark:text-white">{order.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        order.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No orders found.</p>
                </div>
            )}
            {isModalOpen && (
                <OrderEditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    contact={contact}
                    order={selectedOrder}
                />
            )}
        </div>
    );
};

export default OrdersTab;