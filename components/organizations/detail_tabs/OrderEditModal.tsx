import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import toast from 'react-hot-toast';
// FIX: Corrected the import path for types to be a valid relative path.
import { AnyContact, Order, OrderLineItem, Product } from '../../../types';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../../contexts/DataContext';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from '../../../hooks/useForm';

interface OrderEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact;
    order: Order | null;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({ isOpen, onClose, contact, order }) => {
    const { productsQuery, createOrderMutation, updateOrderMutation, deleteOrderMutation } = useData();
    const { data: products = [] } = productsQuery;
    const isNew = !order;

    const getInitialState = (): Omit<Order, 'id' | 'contactId'> => ({
        // FIX: Added organizationId to the initial state to satisfy the Order type.
        organizationId: contact.organizationId,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        total: 0,
        lineItems: [],
    });

    const { formData, setFormData } = useForm(getInitialState(), order);

    useEffect(() => {
        // Recalculate total when line items change
        const total = formData.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        setFormData(d => ({ ...d, total }));
    }, [formData.lineItems, setFormData]);

    const handleLineItemChange = (index: number, field: keyof OrderLineItem, value: any) => {
        const updatedLineItems = [...formData.lineItems];
        const item = { ...updatedLineItems[index] };
        (item as any)[field] = value;

        if (field === 'productId') {
            const product = products.find((p: Product) => p.id === value);
            if (product) {
                item.description = product.name;
                item.unitPrice = product.salePrice;
            }
        }
        updatedLineItems[index] = item;
        setFormData(d => ({...d, lineItems: updatedLineItems }));
    };

    const addLineItem = () => {
        const newLineItem: OrderLineItem = {
            productId: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
        };
        setFormData(d => ({...d, lineItems: [...d.lineItems, newLineItem]}));
    };
    
    const removeLineItem = (index: number) => {
        setFormData(d => ({...d, lineItems: d.lineItems.filter((_, i) => i !== index)}));
    };

    const handleSave = () => {
        if (formData.lineItems.length === 0) {
            toast.error("An order must have at least one line item.");
            return;
        }
        if (formData.lineItems.some(item => !item.productId || item.quantity <= 0 || item.unitPrice < 0)) {
            toast.error("All line items must have a product, positive quantity, and non-negative price.");
            return;
        }
        
        if (isNew) {
            const newOrderData = { ...formData, contactId: contact.id };
            createOrderMutation.mutate(newOrderData as Omit<Order, 'id'>, {
                onSuccess: () => onClose()
            });
        } else {
            updateOrderMutation.mutate({ ...order, ...formData } as Order, {
                onSuccess: () => onClose()
            });
        }
    };
    
    const handleDelete = () => {
        if (order && window.confirm(`Are you sure you want to delete order #${order.id.slice(-6)}?`)) {
            deleteOrderMutation.mutate({ contactId: contact.id, orderId: order.id }, {
                onSuccess: () => onClose()
            });
        }
    };

    const isPending = createOrderMutation.isPending || updateOrderMutation.isPending || deleteOrderMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={order ? `Edit Order #${order.id.slice(-6)}` : 'Create New Order'} size="3xl">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="orderDate" label="Order Date" type="date" value={formData.orderDate.split('T')[0]} onChange={e => setFormData(d => ({...d, orderDate: e.target.value}))} disabled={isPending} />
                    <Select id="orderStatus" label="Status" value={formData.status} onChange={e => setFormData(d => ({...d, status: e.target.value as any}))} disabled={isPending}>
                        <option>Pending</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </Select>
                </div>

                {/* Line Items */}
                <div className="space-y-3 pt-4 border-t dark:border-dark-border">
                    <h4 className="font-semibold">Line Items</h4>
                    {formData.lineItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md bg-gray-50 dark:bg-gray-800/50">
                            <div className="col-span-5">
                                <Select id={`li-prod-${index}`} label="" value={item.productId} onChange={e => handleLineItemChange(index, 'productId', e.target.value)} disabled={isPending}>
                                    <option value="">Select a product...</option>
                                    {products.map((p: Product) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Input id={`li-qty-${index}`} label="" type="number" min="1" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', parseInt(e.target.value) || 1)} disabled={isPending} />
                            </div>
                            <div className="col-span-2">
                                <Input id={`li-price-${index}`} label="" type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} disabled={isPending} />
                            </div>
                            <div className="col-span-2 text-right font-medium">
                                {(item.quantity * item.unitPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                             <div className="col-span-1 text-right">
                                <button onClick={() => removeLineItem(index)} className="p-1 text-gray-400 hover:text-red-500" disabled={isPending}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={addLineItem} leftIcon={<Plus size={14} />} disabled={isPending}>Add Item</Button>
                </div>
                
                <div className="text-right pt-4 border-t dark:border-dark-border">
                    <span className="font-semibold text-lg">Total: {formData.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>

            </div>
            <div className="mt-6 flex justify-between items-center">
                 <div>
                    {!isNew && (
                        <Button variant="danger" onClick={handleDelete} disabled={isPending} leftIcon={<Trash2 size={16} />}>
                           {deleteOrderMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Order'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default OrderEditModal;