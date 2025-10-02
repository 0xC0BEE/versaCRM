import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { EmailTemplate } from '../../types';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';

interface EmailTemplateEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: EmailTemplate | null;
}

const EmailTemplateEditModal: React.FC<EmailTemplateEditModalProps> = ({ isOpen, onClose, template }) => {
    const { createEmailTemplateMutation, updateEmailTemplateMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !template;

    const initialState = useMemo(() => ({
        name: '',
        subject: '',
        body: '',
    }), []);
    
    const { formData, handleChange } = useForm(initialState, template);

    const handleSave = () => {
        if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
            toast.error("All fields are required.");
            return;
        }

        if (isNew) {
            createEmailTemplateMutation.mutate({
                ...formData,
                organizationId: authenticatedUser!.organizationId!,
            }, {
                onSuccess: () => onClose()
            });
        } else {
            updateEmailTemplateMutation.mutate({
                ...template!,
                ...formData,
            }, {
                onSuccess: () => onClose()
            });
        }
    };

    const isPending = createEmailTemplateMutation.isPending || updateEmailTemplateMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Email Template' : `Edit Template: ${template?.name}`} size="3xl">
            <div className="space-y-4">
                <Input
                    id="template-name"
                    label="Template Name"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g., Welcome Email"
                    required
                    disabled={isPending}
                />
                <Input
                    id="template-subject"
                    label="Subject"
                    value={formData.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    placeholder="e.g., Welcome to our service!"
                    required
                    disabled={isPending}
                />
                <Textarea
                    id="template-body"
                    label="Body"
                    value={formData.body}
                    onChange={e => handleChange('body', e.target.value)}
                    rows={10}
                    required
                    disabled={isPending}
                />
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Placeholders:</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        <code>&#123;&#123;contactName&#125;&#125;</code>, <code>&#123;&#123;userName&#125;&#125;</code>, <code>&#123;&#123;organizationName&#125;&#125;</code>
                    </p>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Template'}
                </Button>
            </div>
        </Modal>
    );
};

export default EmailTemplateEditModal;