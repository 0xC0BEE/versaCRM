

import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
// FIX: Changed default import of 'Card' to a named import '{ Card }' to resolve module export error.
import { Card } from '../ui/Card';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
// FIX: Corrected import path for types.
import { CalendarEvent } from '../../types';
import EventModal from './EventModal';
import { useAuth } from '../../contexts/AuthContext';

const localizer = momentLocalizer(moment);

const CalendarPage: React.FC = () => {
    const { calendarEventsQuery } = useData();
    const { authenticatedUser } = useAuth();
    const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data: events = [], isLoading } = calendarEventsQuery;

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleSelectSlot = (slotInfo: SlotInfo) => {
        setSelectedEvent({
            start: slotInfo.start,
            end: slotInfo.end,
            userIds: [authenticatedUser!.id],
        });
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    return (
        <PageWrapper>
            <h1 className="text-2xl font-semibold text-text-heading mb-6">Calendar</h1>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading calendar...</div>
                ) : (
                    <div className="p-6 h-[75vh]">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            selectable
                        />
                    </div>
                )}
            </Card>
            {selectedEvent && (
                <EventModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    event={selectedEvent}
                />
            )}
        </PageWrapper>
    );
};

export default CalendarPage;