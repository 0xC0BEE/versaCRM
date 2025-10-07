import React, { useState } from 'react';
import { PublicForm } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

interface PublicFormTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    form: PublicForm;
}

const PublicFormTestModal: React.FC<PublicFormTestModalProps> = ({ isOpen, onClose, form }) => {
    const { submitPublicFormMutation } = useData();
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const handleChange = (id: string, value: any) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        for (const field of form.fields) {
            if (field.required && !formData[field.id]) {
                toast.error(`Field "${field.label}" is required.`);
                return;
            }
        }

        submitPublicFormMutation.mutate({ formId: form.id, submissionData: formData }, {
            onSuccess: () => {
                setIsSubmitted(true);
            },
            onError: () => {
                toast.error("Failed to submit form.");
            }
        });
    };
    
    const handleClose = () => {
        setFormData({});
        setIsSubmitted(false);
        onClose();
    }

    const renderField = (field: typeof form.fields[0]) => {
        const fieldId = field.id.split('.').pop()!;
         const props = {
            key: field.id,
            id: field.id,
            label: field.label,
            value: formData[fieldId] || '',
            onChange: (e: React.ChangeEvent<any>) => handleChange(fieldId, e.target.value),
            required: field.required,
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
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Test Form: ${form.name}`}>
            {isSubmitted ? (
                <div className="text-center p-8">
                    <CheckCircle className="mx-auto h-16 w-16 text-success" />
                    <h3 className="mt-4 text-lg font-semibold text-text-primary">Submission Successful!</h3>
                    <p className="mt-2 text-sm text-text-secondary">{form.actions.successMessage}</p>
                    <Button onClick={handleClose} className="mt-6">Close</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {form.fields.map(field => renderField(field))}
                     <div className="pt-4 flex justify-end">
                        <Button type="submit" style={{backgroundColor: form.style.buttonColor}} disabled={submitPublicFormMutation.isPending}>
                            {submitPublicFormMutation.isPending ? 'Submitting...' : form.style.buttonText}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default PublicFormTestModal;
