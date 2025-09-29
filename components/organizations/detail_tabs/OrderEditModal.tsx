import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
// FIX: Imported correct types.
import { Order, LineItem, AnyContact } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    contact: AnyContact;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({ isOpen, onClose, order, contact }) => {
    
    // State now only holds the core editable data.
    const getInitialState = (): Omit<Order, 'id' | 'contactId' | 'organizationId' | 'subtotal' | 'total'> => {
        if (order) {
            const { id, contactId, organizationId, subtotal, total, ...rest } = order;
            return rest;
        };
        return {
            orderDate: new Date().toISOString().split('T')[0],
            status: 'Pending' as Order['status'],
            paymentStatus: 'Unpaid' as Order['paymentStatus'],
            lineItems: [{ id: `new-${Date.now()}`, productId: '', description: '', quantity: 1, unitPrice: 0 }],
            tax: 0,
            discount: 0,
        };
    };

    const [data, setData] = useState(getInitialState());

    // Reset state when the modal is opened or the order prop changes.
    useEffect(() => {
        if (isOpen) {
            setData(getInitialState());
        }
    }, [isOpen, order]);
    
    // Derived values are calculated on every render. No useEffect needed.
    const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const total = subtotal + data.tax - data.discount;
    
    const handleLineItemChange = (index: number, field: keyof Omit<LineItem, 'id' | 'productId'>, value: string) => {
        const updatedLineItems = data.lineItems.map((item, i) => {
            if (i === index) {
                const numericValue = parseFloat(value) || 0;
                let newValue: any = value;
                if (field === 'quantity') {
                    newValue = numericValue > 0 ? numericValue : 0;
                } else if (field === 'unitPrice') {
                    newValue = numericValue >= 0 ? numericValue : 0;
                }
                return { ...item, [field]: newValue };
            }
            return item;
        });
        setData(prev => ({...prev, lineItems: updatedLineItems}));
    };

    const addLineItem = () => {
        setData(prev => ({
            ...prev,
            lineItems: [
                ...prev.lineItems,
                { id: `new-${Date.now()}`, productId: '', description: '', quantity: 1, unitPrice: 0 }
            ]
        }));
    };

    const removeLineItem = (index: number) => {
        if (data.lineItems.length <= 1) {
            toast.error("An order must have at least one line item.");
            return;
        }
        const updatedLineItems = data.lineItems.filter((_, i) => i !== index);
        setData(prev => ({...prev, lineItems: updatedLineItems}));
    };


    const handleSave = () => {
        // Mock save
        toast.success("Order saved successfully!");
        console.log("Saving order for contact " + contact.id, { ...data, subtotal, total }); // Add derived values to save payload
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={order ? `Edit Order #${order.id.slice(-6)}` : `New Order for ${contact.contactName}`} size="3xl">
            <div className="space-y-4">
                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input id="order-date" label="Order Date" type="date" value={data.orderDate.split('T')[0]} onChange={e => setData(d => ({...d, orderDate: e.target.value}))} />
                    <Input id="order-status" label="Status" value={data.status} onChange={e => setData(d => ({...d, status: e.target.value as any}))} />
                    <Input id="order-payment" label="Payment Status" value={data.paymentStatus} onChange={e => setData(d => ({...d, paymentStatus: e.target.value as any}))} />
                </div>

                {/* Line Items */}
                <div className="pt-4 border-t dark:border-dark-border">
                    <h4 className="font-semibold mb-2">Line Items</h4>
                    <div className="space-y-2">
                        {data.lineItems.map((item, index) => (
                            <div key={item.id || index} className="grid grid-cols-12 gap-2 items-center">
                                <Input id={`desc-${index}`} label={index === 0 ? "Description" : ""} placeholder="Item or service" className="col-span-6" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)}/>
                                <Input id={`qty-${index}`} label={index === 0 ? "Qty" : ""} type="number" placeholder="1" className="col-span-2" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} />
                                <Input id={`price-${index}`} label={index === 0 ? "Unit Price" : ""} type="number" placeholder="0.00" className="col-span-3" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} />
                                <div className="col-span-1 pt-6">
                                    <button onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button size="sm" variant="secondary" leftIcon={<Plus size={14}/>} className="mt-2" onClick={addLineItem}>Add Line Item</Button>
                </div>

                {/* Totals */}
                <div className="pt-4 mt-4 border-t dark:border-dark-border flex justify-end">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                         <div className="flex justify-between"><span>Subtotal:</span> <span className="font-mono">{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                         <div className="flex justify-between items-center">
                            <label htmlFor="tax" className="w-20">Tax:</label>
                            <Input id="tax" type="number" value={data.tax} onChange={e => setData(d => ({...d, tax: parseFloat(e.target.value) || 0}))} className="w-24 text-right font-mono" />
                         </div>
                         <div className="flex justify-between items-center">
                             <label htmlFor="discount" className="w-20">Discount:</label>
                             <Input id="discount" type="number" value={data.discount} onChange={e => setData(d => ({...d, discount: parseFloat(e.target.value) || 0}))} className="w-24 text-right font-mono" />
                         </div>
                         <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total:</span> <span className="font-mono">{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Order</Button>
            </div>
        </Modal>
    );
};

export default OrderEditModal;
