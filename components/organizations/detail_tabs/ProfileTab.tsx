import React, { useState, useRef } from 'react';
import { AnyContact, CustomField } from '../../../types';
// FIX: Corrected import path for useApp.
import { useApp } from '../../../contexts/AppContext';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Textarea from '../../ui/Textarea';
import { Trash2, Camera, Bot, Loader, UploadCloud } from 'lucide-react';
import PhotoCaptureModal from './PhotoCaptureModal';
import { GoogleGenAI } from '@google/genai';
import toast from 'react-hot-toast';
import Card from '../../ui/Card';

interface ProfileTabProps {
    contact: AnyContact;
    onSave?: (contact: AnyContact) => void;
    onDelete?: (contactId: string) => void;
    isSaving?: boolean;
    isDeleting?: boolean;
    isReadOnly?: boolean;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
    contact,
    onSave,
    onDelete,
    isSaving = false,
    isDeleting = false,
    isReadOnly = false,
}) => {
    const { industryConfig } = useApp();
    const [formData, setFormData] = useState<AnyContact>(contact);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [summary, setSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleChange = (field: keyof AnyContact, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCustomFieldChange = (fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            customFields: {
                ...prev.customFields,
                [fieldId]: value,
            }
        }));
    };

    const handlePhotoCapture = (dataUrl: string) => {
        handleChange('avatar', dataUrl);
        setIsPhotoModalOpen(false);
    };

    const handleSaveClick = () => {
        onSave?.(formData);
    };

    const handleDeleteClick = () => {
        if (window.confirm(`Are you sure you want to delete ${contact.contactName}? This cannot be undone.`)) {
            onDelete?.(contact.id);
        }
    };
    
     const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        setSummary('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const promptContext = {
                name: contact.contactName,
                status: contact.status,
                createdAt: contact.createdAt,
                interactions: contact.interactions.slice(0, 5).map(i => ({ type: i.type, date: i.date, notes: i.notes.slice(0, 100) })),
                orders: contact.orders.slice(0, 3).map(o => ({ status: o.status, total: o.total, date: o.orderDate })),
            };
            const prompt = `Generate a concise summary for a CRM team member about the following contact:\n${JSON.stringify(promptContext, null, 2)}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setSummary(response.text);
        } catch (error) {
            console.error("AI Summary Error:", error);
            toast.error("Failed to generate summary.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const renderCustomField = (field: CustomField) => {
        const value = formData.customFields[field.id] as string || '';
        const props = {
            key: field.id,
            id: field.id,
            label: field.label,
            value: value,
            onChange: (e: React.ChangeEvent<any>) => handleCustomFieldChange(field.id, e.target.type === 'checkbox' ? e.target.checked : e.target.value),
            disabled: isReadOnly,
        };
        switch (field.type) {
            case 'text':
            case 'number':
            case 'date':
                return <Input {...props} type={field.type} />;
            case 'textarea':
                return <Textarea {...props} />;
            case 'select':
                return (
                    <Select {...props}>
                        <option value="">Select...</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>
                );
            case 'checkbox':
                 return (
                    <div className="flex items-center pt-2">
                        <input type="checkbox" id={props.id} checked={!!props.value} onChange={props.onChange} disabled={props.disabled} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <label htmlFor={props.id} className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{props.label}</label>
                    </div>
                 );
            case 'file':
                return (
                    <div key={field.id}>
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                        <div className="mt-1">
                            <input
                                type="file"
                                id={field.id}
                                // FIX: Wrapped the ref callback assignment in curly braces to ensure a void return type.
                                ref={(el) => { fileInputRefs.current[field.id] = el; }}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        handleCustomFieldChange(field.id, e.target.files[0].name);
                                    }
                                }}
                                className="hidden"
                                disabled={isReadOnly}
                            />
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => fileInputRefs.current[field.id]?.click()}
                                    disabled={isReadOnly}
                                    leftIcon={<UploadCloud size={16} />}
                                >
                                    Upload File
                                </Button>
                                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {value || 'No file selected.'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1 pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: Avatar and AI Summary */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full mb-2 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative group">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span className="text-4xl font-bold text-gray-500">{formData.contactName.charAt(0)}</span>
                            )}
                            {!isReadOnly && (
                                <button onClick={() => setIsPhotoModalOpen(true)} className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} />
                                </button>
                            )}
                        </div>
                        <h3 className="text-xl font-semibold">{formData.contactName}</h3>
                        <p className="text-sm text-gray-500">{formData.email}</p>
                    </div>
                    {!isReadOnly && (
                        <Card>
                            <div className="p-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold flex items-center text-sm">
                                        <Bot size={16} className="mr-2 text-primary-500" />
                                        AI Summary
                                    </h4>
                                    <Button size="sm" variant="secondary" onClick={handleGenerateSummary} disabled={isGeneratingSummary}>
                                        {isGeneratingSummary ? <Loader size={14} className="animate-spin" /> : "Generate"}
                                    </Button>
                                </div>
                                <div className="mt-2 p-2 min-h-[4rem] bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-300">
                                    {isGeneratingSummary ? 'Generating...' : (summary || 'Click generate to get an AI-powered summary.')}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right side: Form Fields */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="contactName" label="Full Name" value={formData.contactName} onChange={e => handleChange('contactName', e.target.value)} disabled={isReadOnly} required />
                        <Input id="email" label="Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} disabled={isReadOnly} required />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="phone" label="Phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} disabled={isReadOnly} />
                        <Select id="status" label="Status" value={formData.status} onChange={e => handleChange('status', e.target.value)} disabled={isReadOnly}>
                            <option>Lead</option>
                            <option>Active</option>
                            <option>Inactive</option>
                            <option>Do Not Contact</option>
                        </Select>
                    </div>
                     <Select id="leadSource" label="Lead Source" value={formData.leadSource} onChange={e => handleChange('leadSource', e.target.value)} disabled={isReadOnly}>
                        <option>Web</option>
                        <option>Referral</option>
                        <option>Event</option>
                        <option>Cold Call</option>
                        <option>Manual</option>
                    </Select>
                    
                    {industryConfig.customFields.length > 0 && (
                        <div className="pt-4 border-t dark:border-dark-border space-y-4">
                            <h4 className="font-semibold">Additional Information</h4>
                            {industryConfig.customFields.map(field => renderCustomField(field))}
                        </div>
                    )}
                </div>
            </div>

            {!isReadOnly && (
                <div className="mt-6 pt-4 border-t dark:border-dark-border flex justify-between items-center">
                    <Button variant="danger" onClick={handleDeleteClick} disabled={isDeleting || isSaving} leftIcon={<Trash2 size={16} />}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                    <Button onClick={handleSaveClick} disabled={isSaving || isDeleting}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            )}

            <PhotoCaptureModal 
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onCapture={handlePhotoCapture}
            />
        </div>
    );
};

export default ProfileTab;