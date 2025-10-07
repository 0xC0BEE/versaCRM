import React, { useMemo } from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { Organization, Industry } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { useForm } from '../../hooks/useForm';

interface OrganizationEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: Organization | null;
    onSave: (orgData: Partial<Organization>) => void;
    onDelete: (orgId: string) => void;
    isLoading: boolean;
}

const OrganizationEditModal: React.FC<OrganizationEditModalProps> = ({ isOpen, onClose, organization, onSave, onDelete, isLoading }) => {
    const initialState = useMemo(() => ({
        name: '',
        industry: 'Generic' as Industry,
        primaryContactEmail: '',
    }), []);
    
    const { formData, handleChange } = useForm(initialState, organization);

    const handleSave = () => {
        if (!formData.name.trim() || !formData.primaryContactEmail.trim()) {
            toast.error('Organization Name and Contact Email are required.');
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.primaryContactEmail)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        onSave(formData);
    };

    const handleDelete = () => {
        if (organization && window.confirm(`Are you sure you want to delete "${organization.name}"? This action cannot be undone.`)) {
            onDelete(organization.id);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={organization ? 'Edit Organization' : 'Add New Organization'}>
            <div className="space-y-4">
                <Input
                    id="org-name"
                    label="Organization Name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    disabled={isLoading}
                />
                <Input
                    id="org-email"
                    label="Primary Contact Email"
                    type="email"
                    value={formData.primaryContactEmail}
                    onChange={(e) => handleChange('primaryContactEmail', e.target.value)}
                    required
                    disabled={isLoading}
                />
                <Select
                    id="org-industry"
                    label="Industry"
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value as Industry)}
                    disabled={isLoading}
                >
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal</option>
                    <option value="Generic">Generic</option>
                </Select>
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>
                    {organization && (
                        <Button variant="danger" onClick={handleDelete} disabled={isLoading} leftIcon={<Trash2 size={16} />}>
                            {isLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default OrganizationEditModal;
