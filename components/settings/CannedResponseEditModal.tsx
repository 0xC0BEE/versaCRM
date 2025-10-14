import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { CannedResponse } from '../../types';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';

interface CannedResponseEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    response: CannedResponse | null;
}

const CannedResponseEditModal: React.FC<CannedResponseEditModalProps> = ({ isOpen, onClose, response }) => {
    const { createCannedResponseMutation, updateCannedResponseMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !response;

    const initialState = useMemo(() => ({
        name: '',
        body: '',
    }), []);
    
    const { formData, handleChange } = useForm(initialState, response);

    const handleSave = () => {
        if (!formData.name.trim() || !formData.body.trim()) {
            toast.error("Name and Body are required.");
            return;
        }

        if (isNew) {
            createCannedResponseMutation.mutate({
                ...formData,
                organizationId: authenticatedUser!.organizationId!,
            }, {
                onSuccess: () => onClose()
            });
        } else {
            updateCannedResponseMutation.mutate({
                ...response!,
                ...formData,
            }, {
                onSuccess: () => onClose()
            });
        }
    };

    const isPending = createCannedResponseMutation.isPending || updateCannedResponseMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Canned Response' : `Edit Response: ${response?.name}`} size="lg">
            <div className="space-y-4">
                <Input
                    id="response-name"
                    label="Response Name"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g., Follow-up"
                    required
                    disabled={isPending}
                />
                <Textarea
                    id="response-body"
                    label="Response Body"
                    value={formData.body}
                    onChange={e => handleChange('body', e.target.value)}
                    rows={8}
                    required
                    disabled={isPending}
                />
                 <div>
                    <p className="text-sm font-medium text-text-secondary">Available Placeholders:</p>
                    <p className="text-xs text-text-secondary">
                        <code>&#123;&#123;contact.contactName&#125;&#125;</code>, <code>&#123;&#123;userName&#125;&#125;</code>
                    </p>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Response'}
                </Button>
            </div>
        </Modal>
    );
};

export default CannedResponseEditModal;