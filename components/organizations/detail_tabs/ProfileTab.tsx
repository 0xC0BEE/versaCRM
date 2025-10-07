import React, { useState } from 'react';
import { AnyContact, ContactStatus, CustomField, User } from '../../../types';
import { useForm } from '../../../hooks/useForm';
import { useApp } from '../../../contexts/AppContext';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Textarea from '../../ui/Textarea';
import Button from '../../ui/Button';
import { Save, Trash2, Camera, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoCaptureModal from './PhotoCaptureModal';
import { fileToDataUrl } from '../../../utils/fileUtils';
// FIX: Corrected import path for DataContext.
import { useData } from '../../../contexts/DataContext';

interface ProfileTabProps {
    contact: AnyContact;
    onSave?: (contact: AnyContact) => void;
    onDelete?: (contactId: string) => void;
    isSaving?: boolean;
    isDeleting?: boolean;
    isReadOnly?: boolean;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ 
    contact, onSave, onDelete, isSaving, isDeleting, isReadOnly = false
}) => {
    const { industryConfig } = useApp();
    const { teamMembersQuery } = useData();
    const { data: teamMembers = [] } = teamMembersQuery;
    const { formData, setFormData, handleChange, handleCustomFieldChange } = useForm(contact, contact);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    const handleSave = () => {
        if (!formData.contactName.trim() || !formData.email.trim()) {
            toast.error("Contact Name and Email are required.");
            return;
        }
        if (onSave) onSave(formData);
    };

    const handleDelete = () => {
        if (onDelete && window.confirm(`Are you sure you want to delete ${contact.contactName}? This action cannot be undone.`)) {
            onDelete(contact.id);
        }
    };
    
    const renderCustomField = (field: CustomField) => {
        const value = formData.customFields ? formData.customFields[field.id] : '';
        const props = {
            key: field.id,
            id: field.id,
            label: field.label,
            value: value || '',
            onChange: (e: React.ChangeEvent<any>) => handleCustomFieldChange(field.id, e.target.value),
            disabled: isReadOnly,
            required: false, // Assuming custom fields aren't required for now
        };
        switch (field.type) {
            case 'textarea': return <Textarea {...props} />;
            case 'select': return (
                <Select {...props}>
                    <option value="">-- Select --</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
            );
            default: return <Input {...props} type={field.type} />;
        }
    };

    const handleAvatarCapture = (dataUrl: string) => {
        setFormData(prev => ({ ...prev, avatar: dataUrl }));
        setIsPhotoModalOpen(false);
        toast.success("Photo captured!");
    };
    
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const dataUrl = await fileToDataUrl(file);
                setFormData(prev => ({...prev, avatar: dataUrl}));
                toast.success("Image uploaded!");
            } catch (error) {
                toast.error("Failed to upload image.");
            }
        }
    };

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Avatar */}
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full mb-4 bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-slate-500 text-5xl">{formData.contactName.charAt(0)}</span>
                        )}
                    </div>
                    {!isReadOnly && (
                        <div className="flex flex-col gap-2 w-full">
                            <Button variant="secondary" size="sm" leftIcon={<Camera size={14} />} onClick={() => setIsPhotoModalOpen(true)}>Capture Photo</Button>
                            <Button as="label" variant="secondary" size="sm" leftIcon={<Upload size={14} />} className="cursor-pointer">
                                Upload Image
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right Column: Fields */}
                <div className="md:col-span-2 space-y-4">
                     <Input id="contactName" label="Full Name" value={formData.contactName} onChange={(e) => handleChange('contactName', e.target.value)} required disabled={isReadOnly} />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input id="email" label="Email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required disabled={isReadOnly} />
                        <Input id="phone" label="Phone" type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} disabled={isReadOnly} />
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select id="status" label="Status" value={formData.status} onChange={(e) => handleChange('status', e.target.value as ContactStatus)} disabled={isReadOnly}>
                            <option>Lead</option>
                            <option>Active</option>
                            <option>Inactive</option>
                            <option>Do Not Contact</option>
                        </Select>
                         <Input id="leadSource" label="Lead Source" value={formData.leadSource} onChange={(e) => handleChange('leadSource', e.target.value)} disabled={isReadOnly} />
                     </div>
                      <Select
                        id="assignedTo"
                        label="Assigned To"
                        value={formData.assignedToId || ''}
                        onChange={(e) => handleChange('assignedToId', e.target.value)}
                        disabled={isReadOnly}
                    >
                        <option value="">Unassigned</option>
                        {teamMembers.map((member: User) => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </Select>

                    {/* Custom Fields */}
                    {industryConfig.customFields.length > 0 && (
                        <div className="pt-4 border-t border-border-subtle">
                             <h4 className="text-sm font-semibold mb-2 text-text-secondary">Additional Information</h4>
                             <div className="space-y-4">
                                {industryConfig.customFields.map(field => renderCustomField(field))}
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {!isReadOnly && (
                <div className="mt-8 pt-4 border-t border-border-subtle flex justify-between">
                    <Button variant="danger" onClick={handleDelete} disabled={isDeleting || isNewContact(contact)} leftIcon={<Trash2 size={16} />}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} leftIcon={<Save size={16} />}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            )}
            
            <PhotoCaptureModal 
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onCapture={handleAvatarCapture}
            />
        </div>
    );
};

// A small helper to determine if it's a new, unsaved contact
const isNewContact = (contact: AnyContact) => !contact.id;


export default ProfileTab;