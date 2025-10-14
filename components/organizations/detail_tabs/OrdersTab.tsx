

import React, { useState } from 'react';
// FIX: Corrected import path for types.
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
                        <div key={order.id} className="p-3 bg-card-bg/50 rounded-md border border-border-subtle cursor-pointer hover:bg-hover-bg" onClick={() => handleEdit(order)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-text-primary">Order #{order.id.slice(-6)}</p>
                                    <p className="text-xs text-text-secondary">
                                        Date: {new Date(order.orderDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-text-primary">{order.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${
                                        order.status === 'Completed' ? 'bg-success/10 text-success' :
                                        order.status === 'Cancelled' ? 'bg-error/10 text-error' :
                                        'bg-warning/10 text-warning'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-text-secondary">
                    <ShoppingCart className="mx-auto h-12 w-12 text-text-secondary/50" />
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