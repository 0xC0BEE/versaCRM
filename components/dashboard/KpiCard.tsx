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
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-accent-blue/10 dark:bg-accent-blue/20">
                    <Icon className="h-6 w-6 text-accent-blue" />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-2xl font-semibold text-light-text dark:text-dark-text">{value}</p>
                </div>
            </div>
        </Card>
    );
};

export default KpiCard;