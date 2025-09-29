import React, { ReactNode } from 'react';
import Card from '../ui/Card';

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => {
    return (
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900">
                    {icon}
                </div>
                <div className="ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </div>
        </Card>
    );
};

export default KpiCard;
