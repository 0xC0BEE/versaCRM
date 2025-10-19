import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { CalendarEvent, AppointmentStatus, AnyContact, User } from '../../types';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useForm } from '../../hooks/useForm';
import { useApp } from '../../contexts/AppContext';
import Select from '../ui/Select';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import { useQueryClient } from '@tanstack/react-query';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Partial<CalendarEvent>;
}

const appointmentTypes = ['New Patient Visit', 'Follow-up', 'Annual Physical', 'Consultation'];
const appointmentStatuses: AppointmentStatus[] = ['Scheduled', 'Confirmed', 'Checked-in', 'Completed', 'Cancelled', 'No-show'];

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
    const { createCalendarEventMutation, updateCalendarEventMutation, contactsQuery, teamMembersQuery } = useData();
    const queryClient = useQueryClient();
    const { currentIndustry, industryConfig } = useApp();
    const { data: contacts = [] } = contactsQuery;
    const { data: teamMembers = [] } = teamMembersQuery;

    const isHealthCloud = currentIndustry === 'Health';
    const isNew = !event.id;

    const initialState = useMemo(() => ({
        title: '',
        start: '',
        end: '',
        contactId: '',
        practitionerIds: [] as string[],
        appointmentType: isHealthCloud ? appointmentTypes[0] : '',
        status: isHealthCloud ? 'Scheduled' as AppointmentStatus : undefined,
    }), [isHealthCloud]);

    const formDependency = useMemo(() => {
        if (!event) return null;
        return {
            // FIX: Spread initialState first to ensure the dependency object has all required fields, satisfying TypeScript.
            ...initialState,
            ...event,
            title: event.title || '',
            start: event.start ? format(new Date(event.start), "yyyy-MM-dd'T'HH:mm") : '',
            end: event.end ? format(new Date(event.end), "yyyy-MM-dd'T'HH:mm") : '',
            practitionerIds: event.practitionerIds || [],
        };
    }, [event, initialState]);

    const { formData, handleChange, setFormData } = useForm(initialState, formDependency);

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.start || !formData.end || !formData.contactId) {
            toast.error("All fields are required.");
            return;
        }

        try {
            if (isNew) {
                const eventToCreate: Omit<CalendarEvent, 'id'> = {
                    title: formData.title,
                    start: new Date(formData.start),
                    end: new Date(formData.end),
                    practitionerIds: formData.practitionerIds,
                    contactId: formData.contactId,
                    appointmentType: formData.appointmentType,
                    status: formData.status,
                };
                await createCalendarEventMutation.mutateAsync(eventToCreate);
            } else {
                const eventToUpdate: CalendarEvent = {
                    id: event.id!,
                    title: formData.title,
                    start: new Date(formData.start),
                    end: new Date(formData.end),
                    practitionerIds: formData.practitionerIds,
                    contactId: formData.contactId,
                    appointmentType: formData.appointmentType,
                    status: formData.status,
                };
                await updateCalendarEventMutation.mutateAsync(eventToUpdate);
            }
            
            await queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
            toast.success(`Event ${isNew ? 'created' : 'updated'}!`);
            onClose();

        } catch (error) {
            // Error is handled by the mutation's global onError handler
        }
    };

    const practitionerOptions = (teamMembers as User[]).map(tm => ({ value: tm.id, label: tm.name }));

    const isPending = createCalendarEventMutation.isPending || updateCalendarEventMutation.isPending;
    const modalTitle = isNew ? (isHealthCloud ? 'New Appointment' : 'Create New Event') : (isHealthCloud ? 'Edit Appointment' : 'Edit Event');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <div className="space-y-4">
                <Input
                    id="event-title"
                    label={isHealthCloud ? "Appointment Title" : "Event Title"}
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                />
                 <Select
                    id="contact-id"
                    label={industryConfig.contactName}
                    value={formData.contactId}
                    onChange={(e) => handleChange('contactId', e.target.value)}
                    required
                >
                    <option value="">Select a {industryConfig.contactName.toLowerCase()}...</option>
                    {(contacts as AnyContact[]).map(c => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                </Select>
                {isHealthCloud && (
                    <>
                        <Select
                            id="appointment-type"
                            label="Appointment Type"
                            value={formData.appointmentType}
                            onChange={(e) => handleChange('appointmentType', e.target.value)}
                        >
                            {appointmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </Select>
                         <Select
                            id="appointment-status"
                            label="Status"
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value as AppointmentStatus)}
                        >
                            {appointmentStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </Select>
                    </>
                )}
                 <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">{industryConfig.teamMemberNamePlural}</label>
                    <MultiSelectDropdown
                        options={practitionerOptions}
                        selectedValues={formData.practitionerIds}
                        onChange={(selected) => setFormData(prev => ({...prev, practitionerIds: selected}))}
                        placeholder={`Select ${industryConfig.teamMemberNamePlural.toLowerCase()}...`}
                    />
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="event-start"
                        label="Start Time"
                        type="datetime-local"
                        value={formData.start}
                        onChange={(e) => handleChange('start', e.target.value)}
                        required
                    />
                    <Input
                        id="event-end"
                        label="End Time"
                        type="datetime-local"
                        value={formData.end}
                        onChange={(e) => handleChange('end', e.target.value)}
                        required
                    />
                </div>
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