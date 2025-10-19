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
    const [selectedPractitioners, setSelectedPractitioners] = useState<string[]>([]);

    const practitionerOptions = useMemo(() => 
        (teamMembers as User[]).map(tm => ({ value: tm.id, label: tm.name })),
    [teamMembers]);

    const filteredEvents = useMemo(() => {
        if (selectedPractitioners.length === 0) {
            return events;
        }
        return (events as CalendarEvent[]).filter(event => 
            event.practitionerIds.some(id => selectedPractitioners.includes(id))
        );
    }, [events, selectedPractitioners]);

    const handleSelectSlot = (slotInfo: SlotInfo) => {
        setSelectedEvent({ start: slotInfo.start, end: slotInfo.end });
        setIsModalOpen(true);
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const CustomEvent: React.FC<EventProps<CalendarEvent>> = ({ event }) => (
        <div className={`p-1 text-white rounded-sm text-xs ${event.status ? appointmentStatusColors[event.status] : 'bg-primary'}`}>
            <strong className="truncate block">{event.title}</strong>
        </div>
    );
    
    const isHealthCloud = currentIndustry === 'Health';

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Calendar</h1>
                {isHealthCloud && (
                    <div className="w-72">
                         <MultiSelectDropdown 
                            options={practitionerOptions}
                            selectedValues={selectedPractitioners}
                            onChange={setSelectedPractitioners}
                            placeholder={`Filter by ${industryConfig.teamMemberName}...`}
                         />
                    </div>
                )}
            </div>
            <Card className="h-[calc(100vh-10rem)] p-4">
                {(eventsLoading || membersLoading) ? <p>Loading calendar...</p> : (
                    <Calendar
                        localizer={localizer}
                        events={filteredEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        components={{
                            event: CustomEvent,
                        }}
                    />
                )}
            </Card>
            {isModalOpen && selectedEvent && (
                <EventModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    event={selectedEvent}
                />
            )}
        </PageWrapper>
    );
};

export default CalendarPage;