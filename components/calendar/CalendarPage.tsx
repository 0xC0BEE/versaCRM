

import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { Card } from '../ui/Card';
import { Calendar, momentLocalizer, SlotInfo, EventProps } from 'react-big-calendar';
import moment from 'moment';
import { useData } from '../../contexts/DataContext';
import { CalendarEvent, User, AppointmentStatus } from '../../types';
import EventModal from './EventModal';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';

const localizer = momentLocalizer(moment);

const appointmentStatusColors: Record<AppointmentStatus, string> = {
    'Scheduled': 'bg-blue-500',
    'Confirmed': 'bg-green-500',
    'Checked-in': 'bg-purple-500',
    'Completed': 'bg-gray-500',
    'Cancelled': 'bg-red-500',
    'No-show': 'bg-yellow-600',
};

const CalendarPage: React.FC = () => {
    const { calendarEventsQuery, teamMembersQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { currentIndustry, industryConfig } = useApp();
    
    const { data: events = [], isLoading: eventsLoading } = calendarEventsQuery;
    const { data: teamMembers = [], isLoading: membersLoading } = teamMembersQuery;

    const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // For Health Scheduler
    const [visiblePractitioners, setVisiblePractitioners] = useState<string[]>(() => 
        (teamMembers as User[]).map(tm => tm.id)
    );

    const isLoading = eventsLoading || membersLoading;

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleSelectSlot = (slotInfo: SlotInfo & { resourceId?: string }) => {
        setSelectedEvent({
            start: slotInfo.start,
            end: slotInfo.end,
            practitionerIds: slotInfo.resourceId ? [slotInfo.resourceId] : [authenticatedUser!.id],
            contactId: '', // To be filled in modal
        });
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };
    
    const eventPropGetter = (event: CalendarEvent): React.HTMLAttributes<HTMLDivElement> => {
        const style: React.CSSProperties = {
            backgroundColor: event.status ? appointmentStatusColors[event.status] : '#3174ad',
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block',
        };
        return { style };
    };

    const renderHealthScheduler = () => {
        const practitioners = (teamMembers as User[]).map(tm => ({ resourceId: tm.id, resourceTitle: tm.name }));
        const visiblePractitionerResources = practitioners.filter(p => visiblePractitioners.includes(p.resourceId));

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-text-heading">Appointment Scheduler</h1>
                    <div className="w-80">
                         <MultiSelectDropdown
                            options={practitioners.map(p => ({ value: p.resourceId, label: p.resourceTitle }))}
                            selectedValues={visiblePractitioners}
                            onChange={setVisiblePractitioners}
                            placeholder="Filter Practitioners..."
                        />
                    </div>
                </div>
                <Card>
                    <div className="p-6 h-[75vh]">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            defaultView="day"
                            views={['day', 'week', 'month']}
                            step={15}
                            timeslots={4}
                            resources={visiblePractitionerResources}
                            resourceIdAccessor="resourceId"
                            resourceTitleAccessor="resourceTitle"
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot as any}
                            selectable
                            eventPropGetter={eventPropGetter}
                        />
                    </div>
                </Card>
            </div>
        );
    };

    const renderGenericCalendar = () => (
        <>
            <h1 className="text-2xl font-semibold text-text-heading mb-6">Calendar</h1>
            <Card>
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
            </Card>
        </>
    );

    return (
        <PageWrapper>
            {isLoading ? (
                <div className="p-8 text-center">Loading calendar...</div>
            ) : currentIndustry === 'Health' ? (
                renderHealthScheduler()
            ) : (
                renderGenericCalendar()
            )}
            
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