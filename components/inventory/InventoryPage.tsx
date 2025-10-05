import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import ProductsTab from './ProductsTab';
import SuppliersTab from './SuppliersTab';
import WarehousesTab from './WarehousesTab';

const InventoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Products');
    const tabs = ['Products', 'Suppliers', 'Warehouses'];

    const renderContent = () => {
        switch (activeTab) {
            case 'Products':
                return <ProductsTab />;
            case 'Suppliers':
                return <SuppliersTab />;
            case 'Warehouses':
                return <WarehousesTab />;
            default:
                return null;
        }
    };

    return (
        <PageWrapper>
            <h1 className="text-2xl font-semibold text-text-heading mb-6">Inventory</h1>
            <Card>
                 <div className="p-6">
                    <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="mt-6">
                        {renderContent()}
                    </div>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default InventoryPage;