import React, { useMemo } from 'react';
import Modal from '../../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import toast from 'react-hot-toast';
import { AnyContact, Order, OrderLineItem, Product } from '../../../types';
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

    const initialState = useMemo(() => ({
        organizationId: contact.organizationId,
        contactId: contact.id,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Pending' as Order['status'],
        lineItems: [] as OrderLineItem[],
        total: 0,
    }), [contact.organizationId, contact.id]);

    // FIX: Memoize a dependency that merges the `order` prop with the initial state to ensure type compatibility with the useForm hook.
    const formDependency = useMemo(() => (order ? { ...initialState, ...order } : null), [order, initialState]);

    const { formData, setFormData, handleChange } = useForm(initialState, formDependency);

    const total = useMemo(() => {
        if (!formData.lineItems) return 0;
        return formData.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }, [formData.lineItems]);

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
        setFormData(d => ({...d, lineItems: [...(d.lineItems || []), newLineItem]}));
    };
    
    const removeLineItem = (index: number) => {
        setFormData(d => ({...d, lineItems: (d.lineItems || []).filter((_, i) => i !== index)}));
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
        
        const saveData = { ...formData, total };

        if (isNew) {
            const newOrderData = { ...saveData, contactId: contact.id };
            createOrderMutation.mutate(newOrderData as Omit<Order, 'id'>, {
                onSuccess: () => onClose()
            });
        } else {
            // FIX: Merged original `order` to ensure `id` is present, fixing the type casting error.
            updateOrderMutation.mutate({ ...order!, ...saveData }, {
                onSuccess: () => onClose()
            });
        }
    };

    const handleDelete = () => {
        if (order && window.confirm(`Are you sure you want to delete this order?`)) {
            deleteOrderMutation.mutate({ contactId: contact.id, orderId: order.id }, {
                onSuccess: () => onClose()
            });
        }
    };

    const isPending = createOrderMutation.isPending || updateOrderMutation.isPending || deleteOrderMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Order' : `Edit Order #${order?.id.slice(-6)}`} size="3xl">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="order-date" label="Order Date" type="date" value={formData.orderDate} onChange={e => handleChange('orderDate', e.target.value)} disabled={isPending} />
                    <Select id="order-status" label="Status" value={formData.status} onChange={e => handleChange('status', e.target.value as Order['status'])} disabled={isPending}>
                        <option>Pending</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </Select>
                </div>
                
                <div className="pt-4 border-t border-border-subtle">
                    <h4 className="font-semibold mb-2">Line Items</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {formData.lineItems?.map((item, index) => (
                            <div key={index} className="flex items-end gap-2 p-2 bg-hover-bg rounded-md">
                                <Select id={`li-prod-${index}`} label="Product" value={item.productId} onChange={e => handleLineItemChange(index, 'productId', e.target.value)} className="flex-grow">
                                    <option value="">Select product...</option>
                                    {products.map((p: Product) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </Select>
                                <Input id={`li-qty-${index}`} label="Qty" type="number" min="1" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', parseInt(e.target.value))} className="w-20" />
                                <Input id={`li-price-${index}`} label="Unit Price" type="number" step="0.01" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value))} className="w-28" />
                                <Button size="sm" variant="danger" onClick={() => removeLineItem(index)}><Trash2 size={14}/></Button>
                            </div>
                        ))}
                    </div>
                    <Button size="sm" variant="secondary" onClick={addLineItem} leftIcon={<Plus size={14}/>} className="mt-2">Add Item</Button>
                </div>

                <div className="pt-4 text-right">
                    <p className="text-sm text-text-secondary">Total</p>
                    <p className="text-2xl font-bold text-text-primary">{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
                <div>
                    {!isNew && (
                        <Button variant="danger" onClick={handleDelete} disabled={isPending} leftIcon={<Trash2 size={16}/>}>
                            {deleteOrderMutation.isPending ? 'Deleting...' : 'Delete Order'}
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
