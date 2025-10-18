import React, { useState, useMemo } from 'react';
import { Deal, RevenueRecognitionSchedule } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useForm } from '../../hooks/useForm';
import { addMonths, format } from 'date-fns';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface RevenueRecognitionTabProps {
    deal: Deal;
}

const RevenueRecognitionTab: React.FC<RevenueRecognitionTabProps> = ({ deal }) => {
    const { updateDealMutation } = useData();

    const initialState = useMemo(() => ({
        startDate: deal.expectedCloseDate,
        months: 12,
    }), [deal]);

    const { formData, handleChange } = useForm(initialState, deal.revenueSchedule);

    const handleCreateSchedule = () => {
        const { startDate, months } = formData;
        if (months <= 0) {
            toast.error("Number of months must be positive.");
            return;
        }

        const monthlyAmount = deal.value / months;
        const newSchedule: RevenueRecognitionSchedule = {
            startDate,
            months,
            schedule: Array.from({ length: months }).map((_, i) => ({
                month: i + 1,
                date: format(addMonths(new Date(startDate), i), 'yyyy-MM-dd'),
                amount: monthlyAmount,
                status: 'Pending',
            })),
        };
        updateDealMutation.mutate({ ...deal, revenueSchedule: newSchedule });
    };
    
    const handleToggleStatus = (monthIndex: number) => {
        if (!deal.revenueSchedule) return;

        const updatedScheduleItems = deal.revenueSchedule.schedule.map((item, index) => {
            if (index === monthIndex) {
                return { ...item, status: item.status === 'Pending' ? 'Recognized' : 'Pending' };
            }
            return item;
        });
        
        const updatedSchedule = { ...deal.revenueSchedule, schedule: updatedScheduleItems };
        updateDealMutation.mutate({ ...deal, revenueSchedule: updatedSchedule });
    };

    const isPending = updateDealMutation.isPending;

    if (deal.revenueSchedule) {
        const schedule = deal.revenueSchedule;
        const recognizedAmount = schedule.schedule.filter(s => s.status === 'Recognized').reduce((sum, s) => sum + s.amount, 0);

        return (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-hover-bg rounded-lg">
                        <p className="text-xs text-text-secondary">Total Recognized</p>
                        <p className="text-lg font-bold text-success">{recognizedAmount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</p>
                    </div>
                     <div className="p-3 bg-hover-bg rounded-lg">
                        <p className="text-xs text-text-secondary">Remaining to Recognize</p>
                        <p className="text-lg font-bold text-text-primary">{(deal.value - recognizedAmount).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</p>
                    </div>
                </div>

                <div className="divide-y divide-border-subtle border-t border-border-subtle">
                    {schedule.schedule.map((item, index) => (
                        <div key={item.month} className="p-2 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                {item.status === 'Recognized' ? <CheckCircle size={16} className="text-success" /> : <Clock size={16} className="text-text-secondary" />}
                                <div>
                                    <p className="text-sm font-medium">Month {item.month} ({format(new Date(item.date), 'MMM yyyy')})</p>
                                    <p className="text-sm font-semibold">{item.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</p>
                                </div>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => handleToggleStatus(index)} disabled={isPending}>
                                Mark as {item.status === 'Pending' ? 'Recognized' : 'Pending'}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-text-secondary">
                Create a revenue recognition schedule to spread the deal's value over multiple months.
            </p>
            <div className="grid grid-cols-2 gap-4">
                <Input
                    id="revrec-start"
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    disabled={isPending}
                />
                <Input
                    id="revrec-months"
                    label="Number of Months"
                    type="number"
                    min="1"
                    value={formData.months}
                    onChange={(e) => handleChange('months', parseInt(e.target.value))}
                    disabled={isPending}
                />
            </div>
            <div className="flex justify-end mt-4">
                <Button onClick={handleCreateSchedule} disabled={isPending}>
                    Create Schedule
                </Button>
            </div>
        </div>
    );
};

export default RevenueRecognitionTab;