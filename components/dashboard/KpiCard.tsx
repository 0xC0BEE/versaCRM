import React from 'react';
import { Card, CardContent } from '../ui/Card';
import * as LucideIcons from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: string | number;
    iconName: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, iconName }) => {
    const Icon = (LucideIcons as any)[iconName] as React.ElementType || LucideIcons.BarChart2;

    return (
        <Card className="h-full">
            <CardContent className="flex items-center h-full p-4">
                <div className="p-3 mr-4 rounded-full bg-hover-bg">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium text-text-secondary">{title}</p>
                    <p className="text-3xl font-bold text-text-heading">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default KpiCard;
