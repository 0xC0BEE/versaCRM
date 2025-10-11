import React from 'react';
import Card from '../ui/Card';
import * as LucideIcons from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: string | number;
    iconName: string; // e.g., 'Users', 'HeartPulse'
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, iconName }) => {
    const Icon = (LucideIcons as any)[iconName] as React.ElementType || LucideIcons.BarChart2;

    return (
        <Card className="h-full">
            <div className="flex items-center h-full gap-4">
                <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-secondary truncate">{title}</p>
                    <p className="text-2xl font-semibold text-text-primary truncate">{value}</p>
                </div>
            </div>
        </Card>
    );
};

export default KpiCard;