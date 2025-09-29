import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
// FIX: Imported correct types.
import { AnyContact, CustomField, Organization } from '../../../types';
import { industryConfigs } from '../../../config/industryConfig';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Textarea from '../../ui/Textarea';
import Button from '../../ui/Button';
import PhotoCaptureModal from './PhotoCaptureModal';
import { Camera, Upload } from 'lucide-react';

interface ProfileTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ contact, isReadOnly }) => {
    // Use a local query to get the specific organization for this contact.
    // This is more robust than relying on a global query that might not be enabled.
    // FIX: Used correct api method.
    const { data: organization, isLoading: isLoadingOrg } = useQuery<Organization | null, Error>({
        queryKey: ['organizationForContact', contact.organizationId],
        queryFn: () => api.getOrganizationById(contact.organizationId),
    });

    const industry = organization?.industry;
    const industryConfig = (industry && industryConfigs[industry]) ? industryConfigs[industry] : industryConfigs.Generic;
    
    const [isCaptureModalOpen, setCaptureModalOpen] = useState(false);
    
    const renderField = (field: CustomField) => {
        const value = contact.customFields?.[field.id] || '';
        const id = `custom-${field.id}`;
        
        switch(field.type) {
            case 'text':
            case 'date':
            case 'number':
                return <Input key={id} id={id} label={field.label} type={field.type} value={value} disabled={isReadOnly} />;
            case 'textarea':
                return <Textarea key={id} id={id} label={field.label} value={value} disabled={isReadOnly} />;
             case 'select':
                return <Select key={id} id={id} label={field.label} value={value} disabled={isReadOnly}>
                    <option value="">Select...</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>;
            default:
                return null;
        }
    }
    
    const handlePhotoCapture = (dataUrl: string) => {
        console.log("Photo capture data URL:", dataUrl);
        setCaptureModalOpen(false);
    };

    if (isLoadingOrg) {
        return <div className="p-4 text-center">Loading profile configuration...</div>;
    }

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 flex flex-col items-center">
                    <img
                        className="w-32 h-32 rounded-full object-cover border-4 dark:border-gray-600"
                        src={contact.avatarUrl || `https://i.pravatar.cc/150?u=${contact.id}`}
                        alt={contact.contactName}
                    />
                    {!isReadOnly && (
                        <div className="mt-4 space-y-2 w-full">
                            <Button size="sm" variant="secondary" className="w-full" leftIcon={<Camera size={14} />} onClick={() => setCaptureModalOpen(true)}>
                                Use Camera
                            </Button>
                            <Button size="sm" variant="secondary" className="w-full" leftIcon={<Upload size={14} />} disabled>
                                Upload Photo
                            </Button>
                        </div>
                    )}
                </div>
                
                <div className="md:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="contactName" label="Full Name" value={contact.contactName || ''} disabled={isReadOnly} />
                        <Input id="email" label="Email" type="email" value={contact.email || ''} disabled={isReadOnly} />
                        <Input id="phone" label="Phone" value={contact.phone || ''} disabled={isReadOnly} />
                        <Select id="status" label="Status" value={contact.status || 'Lead'} disabled={isReadOnly}>
                            <option>Lead</option>
                            <option>Active</option>
                            <option>Inactive</option>
                            <option>Archived</option>
                        </Select>
                         <Input id="leadSource" label="Lead Source" value={contact.leadSource || ''} disabled={isReadOnly} />
                         <Input id="createdAt" label="Created At" value={contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'} disabled />
                    </div>
                     {industryConfig.customFields.length > 0 && (
                        <div className="mt-6 pt-4 border-t dark:border-dark-border">
                             <h4 className="font-semibold mb-2">{industryConfig.name}-Specific Fields</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {industryConfig.customFields.map(field => renderField(field))}
                            </div>
                        </div>
                     )}
                </div>
            </div>
            
            <PhotoCaptureModal 
                isOpen={isCaptureModalOpen}
                onClose={() => setCaptureModalOpen(false)}
                onCapture={handlePhotoCapture}
            />
        </div>
    );
};

export default ProfileTab;
