import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { CalendarEvent } from '../../types';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Partial<CalendarEvent>;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
    const { createCalendarEventMutation, updateCalendarEventMutation } = useData();

    const [title, setTitle] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    useEffect(() => {
        if (event) {
            setTitle(event.title || '');
            setStart(event.start ? format(new Date(event.start), "yyyy-MM-dd'T'HH:mm") : '');
            setEnd(event.end ? format(new Date(event.end), "yyyy-MM-dd'T'HH:mm") : '');
        }
    }, [event]);

    const handleSave = () => {
        if (!title || !start || !end) {
            toast.error('Title, start, and end times are required.');
            return;
        }

        const eventData = {
            ...event,
            title,
            start: new Date(start),
            end: new Date(end),
        };
        
        if (event.id) {
            // Update existing event
            updateCalendarEventMutation.mutate(eventData as CalendarEvent, {
                onSuccess: () => {
                    toast.success('Event updated!');
                    onClose();
                },
                onError: () => toast.error('Failed to update event.'),
            });
        } else {
            // Create new event
            createCalendarEventMutation.mutate(eventData as Omit<CalendarEvent, 'id'>, {
                onSuccess: () => {
                    toast.success('Event created!');
                    onClose();
                },
                onError: () => toast.error('Failed to create event.'),
            });
        }
    };

    const isPending = createCalendarEventMutation.isPending || updateCalendarEventMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={event.id ? 'Edit Event' : 'Create New Event'}>
            <div className="space-y-4">
                <Input
                    id="event-title"
                    label="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="event-start"
                        label="Start Time"
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        required
                    />
                    <Input
                        id="event-end"
                        label="End Time"
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        required
                    />
                </div>
                {/* In a real app, you might add a contact selector or other fields here */}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Event'}
                </Button>
            </div>
        </Modal>
    );
};

export default EventModal;
