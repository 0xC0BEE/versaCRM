import React, { useMemo } from 'react';
import { CustomObjectDefinition } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import * as LucideIcons from 'lucide-react';

interface CustomObjectDefinitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    definition: CustomObjectDefinition | null;
}

const iconOptions = Object.keys(LucideIcons).filter(key => /^[A-Z]/.test(key) && key !== 'createReactComponent');

const CustomObjectDefinitionModal: React.FC<CustomObjectDefinitionModalProps> = ({ isOpen, onClose, definition }) => {
    const { createCustomObjectDefMutation, updateCustomObjectDefMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !definition;

    const initialState = useMemo(() => ({
        nameSingular: '',
        namePlural: '',
        icon: 'Shapes',
    }), []);

    const { formData, handleChange } = useForm(initialState, definition);

    const handleSave = () => {
        if (!formData.nameSingular.trim() || !formData.namePlural.trim()) {
            toast.error("Singular and Plural names are required.");
            return;
        }

        if (isNew) {
            createCustomObjectDefMutation.mutate({
                ...formData,
                organizationId: authenticatedUser!.organizationId,
                fields: [],
            }, { onSuccess: onClose });
        } else {
            updateCustomObjectDefMutation.mutate({ ...definition!, ...formData }, { onSuccess: onClose });
        }
    };

    const isPending = createCustomObjectDefMutation.isPending || updateCustomObjectDefMutation.isPending;
    const IconComponent = (LucideIcons as any)[formData.icon] || LucideIcons.Shapes;


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Custom Object' : `Edit Object: ${definition?.namePlural}`}>
            <div className="space-y-4">
                <Input
                    id="name-singular"
                    label="Singular Name"
                    value={formData.nameSingular}
                    onChange={(e) => handleChange('nameSingular', e.target.value)}
                    placeholder="e.g., Property"
                    required
                    disabled={isPending}
                />
                <Input
                    id="name-plural"
                    label="Plural Name"
                    value={formData.namePlural}
                    onChange={(e) => handleChange('namePlural', e.target.value)}
                    placeholder="e.g., Properties"
                    required
                    disabled={isPending}
                />
                <div>
                    <label htmlFor="icon-select" className="block text-sm font-medium text-text-primary">Icon</label>
                    <div className="flex items-center gap-2 mt-1">
                        <IconComponent className="h-5 w-5 text-text-secondary" />
                        <select
                            id="icon-select"
                            value={formData.icon}
                            onChange={(e) => handleChange('icon', e.target.value)}
                            className="w-full bg-card-bg border border-border-subtle rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Object'}
                </Button>
            </div>
        </Modal>
    );
};

export default CustomObjectDefinitionModal;