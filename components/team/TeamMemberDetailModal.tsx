import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import { User, UserRole } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from '../../hooks/useForm';

interface TeamMemberDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: User | null;
}

const TeamMemberDetailModal: React.FC<TeamMemberDetailModalProps> = ({ isOpen, onClose, member }) => {
    const { createTeamMemberMutation, updateTeamMemberMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !member;

    const initialState = useMemo(() => ({
        name: '',
        email: '',
        role: 'Team Member' as UserRole,
    }), []);
    
    const { formData, handleChange } = useForm(initialState, member);

    const handleSave = () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error("Name and email are required.");
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (isNew) {
            createTeamMemberMutation.mutate({
                ...formData,
                organizationId: authenticatedUser!.organizationId,
            } as Omit<User, 'id'>, {
                onSuccess: () => onClose()
            });
        } else {
            updateTeamMemberMutation.mutate({
                ...member!,
                ...formData,
            }, {
                onSuccess: () => onClose()
            });
        }
    };

    const isPending = createTeamMemberMutation.isPending || updateTeamMemberMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={member ? `Edit ${member.name}` : 'Invite New Team Member'}>
            <div className="space-y-4">
                <Input
                    id="member-name"
                    label="Full Name"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    disabled={isPending}
                    required
                />
                 <Input
                    id="member-email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    disabled={isPending}
                    required
                />
                <Select id="member-role" label="Role" value={formData.role} onChange={e => handleChange('role', e.target.value as UserRole)}>
                    <option value="Organization Admin">Organization Admin</option>
                    <option value="Team Member">Team Member</option>
                </Select>
                 <div className="pt-4 border-t dark:border-dark-border">
                    <h4 className="font-semibold text-base">Permissions</h4>
                    <p className="text-sm text-gray-500">Permissions are based on the selected role and cannot be edited individually at this time.</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : (isNew ? 'Send Invite' : 'Save Changes')}
                </Button>
            </div>
        </Modal>
    );
};

export default TeamMemberDetailModal;