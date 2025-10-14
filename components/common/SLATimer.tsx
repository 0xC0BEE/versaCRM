import React, { useState, useEffect } from 'react';
import { Ticket, OrganizationSettings, SLAPolicy } from '../../types';
import { differenceInMilliseconds, addHours } from 'date-fns';
import { useData } from '../../contexts/DataContext';

interface SLATimerProps {
    ticket: Ticket;
    settings: OrganizationSettings | undefined | null;
}

const formatDuration = (ms: number) => {
    if (ms < 0) {
        const absMs = Math.abs(ms);
        const seconds = Math.floor((absMs / 1000) % 60);
        const minutes = Math.floor((absMs / (1000 * 60)) % 60);
        const hours = Math.floor(absMs / (1000 * 60 * 60));
        return { sign: '-', hours: String(hours).padStart(2, '0'), minutes: String(minutes).padStart(2, '0'), seconds: String(seconds).padStart(2, '0') };
    }
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return {
        sign: '+',
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
    };
};

const SLATimer: React.FC<SLATimerProps> = ({ ticket, settings }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!settings || ticket.status === 'Closed') return 0;
            
            const priorityKey = ticket.priority.toLowerCase() as keyof SLAPolicy['responseTime'];
            const responseTimeHours = settings.ticketSla.responseTime[priorityKey];
            const resolutionTimeHours = settings.ticketSla.resolutionTime[priorityKey];

            if (responseTimeHours === undefined || resolutionTimeHours === undefined) return 0;

            const createdAt = new Date(ticket.createdAt);
            const firstTeamReply = ticket.replies.find(r => r.userId.startsWith('user_') && !r.isInternal);

            let targetDate;
            
            if (!firstTeamReply) {
                targetDate = addHours(createdAt, responseTimeHours);
            } else {
                targetDate = addHours(createdAt, resolutionTimeHours);
            }

            return differenceInMilliseconds(targetDate, new Date());
        };
        
        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);

    }, [ticket, settings]);

    if (!settings || ticket.status === 'Closed') {
        // Final status display
        return <span className="text-xs text-gray-500">{ticket.status === 'Closed' ? 'Closed' : 'No Policy'}</span>;
    }

    const { sign, hours, minutes, seconds } = formatDuration(timeLeft);
    const isBreached = sign === '-';
    const isWarning = !isBreached && timeLeft < 3600 * 1000; // Less than 1 hour

    const color = isBreached ? 'text-error' : isWarning ? 'text-warning' : 'text-success';

    const firstTeamReply = ticket.replies.find(r => r.userId.startsWith('user_') && !r.isInternal);
    const label = !firstTeamReply ? 'Response' : 'Resolution';

    return (
        <div className={`text-xs font-mono font-semibold ${color}`}>
            <span>{label}: </span>
            <span>{sign === '-' && '-'}</span>
            <span>{hours}:{minutes}:{seconds}</span>
        </div>
    );
};

export default SLATimer;