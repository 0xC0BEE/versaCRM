import React, { useState, useEffect } from 'react';
import { Organization, Industry } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import toast from 'react-hot-toast';

interface OrganizationEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: Organization | null;
    // FIX: Corrected onSave prop to use the Organization type.
    onSave: (orgData: Pick<Organization, 'name' | 'industry' | 'primaryContactEmail'>) => void;
}

const OrganizationEditModal: React.FC<OrganizationEditModalProps> = ({ isOpen, onClose, organization, onSave }) => {
    const [name, setName] = useState('');
    const [industry, setIndustry] = useState<Industry>('Generic');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (organization) {
            setName(organization.name);
            setIndustry(organization.industry);
            // FIX: Used correct property name.
            setEmail(organization.primaryContactEmail);
        } else {
            // Reset for new entry
            setName('');
            setIndustry('Generic');
            setEmail('');
        }
    }, [organization, isOpen]);

    const handleSave = () => {
        if (!name || !email) {
            toast.error('Please fill in all required fields.');
            return;
        }
        onSave({
            name,
            industry,
            primaryContactEmail: email,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={organization ? 'Edit Organization' : 'Add New Organization'}>
            <div className="space-y-4">
                <Input
                    id="org-name"
                    label="Organization Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Input
                    id="org-email"
                    label="Primary Contact Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Select
                    id="org-industry"
                    label="Industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as Industry)}
                >
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal</option>
                    <option value="Generic">Generic</option>
                </Select>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </div>
        </Modal>
    );
};

export default OrganizationEditModal;
