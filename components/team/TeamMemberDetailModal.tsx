

import React, { useMemo, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
// FIX: Corrected import path for types.
import { User, CustomRole } from '../../types';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import NewUserLoginInfoModal from './NewUserLoginInfoModal';

interface TeamMemberDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: User | null;
}

const TeamMemberDetailModal: React.FC<TeamMemberDetailModalProps> = ({ isOpen, onClose, member }) => {
    const { createUserMutation, updateUserMutation, deleteUserMutation, rolesQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { data: roles = [] } = rolesQuery;
    const isNew = !member;

    const [newUserCredentials, setNewUserCredentials] = useState<{ email: string; password: string } | null>(null);

    const initialState = useMemo((): Omit<User, 'id'| 'contactId'> => ({
        name: '',
        email: '',
        roleId: (roles as CustomRole[])[0]?.id || '',
        organizationId: authenticatedUser!.organizationId!,
        isClient: false,
        //FIX: Added role property to satisfy type
        role: ''
    }), [authenticatedUser, roles]);

    const { formData, handleChange, resetForm } = useForm(initialState, member);

    const handleSave = () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error("Name and Email are required.");
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (isNew) {
            createUserMutation.mutate(formData, {
                onSuccess: (newUser) => {
                    const tempPassword = 'password123'; // In a real app, this would be generated securely
                    setNewUserCredentials({ email: newUser.email, password: tempPassword });
                },
            });
        } else {
            updateUserMutation.mutate({ ...member!, ...formData }, {
                onSuccess: () => {
                    toast.success("Team member updated.");
                    onClose();
                }
            });
        }
    };

    const handleDelete = () => {
        if (member && window.confirm(`Are you sure you want to remove ${member.name}?`)) {
            deleteUserMutation.mutate(member.id, {
                onSuccess: () => {
                    toast.success("Team member removed.");
                    onClose();
                }
            });
        }
    };
    
    const handleCredentialsModalClose = () => {
        setNewUserCredentials(null);
        resetForm();
        onClose(); // Close the main modal now
    };

    const isPending = createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending;

    return (
        <>
            <Modal isOpen={isOpen && !newUserCredentials} onClose={onClose} title={isNew ? 'Invite New Team Member' : `Edit ${member?.name}`}>
                <div className="space-y-4">
                    <Input id="member-name" label="Full Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required disabled={isPending} />
                    <Input id="member-email" label="Email Address" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required disabled={isPending} />
                    <Select id="member-role" label="Role" value={formData.roleId} onChange={e => handleChange('roleId', e.target.value)} disabled={isPending || rolesQuery.isLoading}>
                        {(roles as CustomRole[]).map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </Select>
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <div>
                        {!isNew && member?.id !== authenticatedUser?.id && ( // Prevent self-deletion
                            <Button variant="danger" onClick={handleDelete} disabled={isPending} leftIcon={<Trash2 size={16} />}>
                                {deleteUserMutation.isPending ? 'Removing...' : 'Remove Member'}
                            </Button>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isPending}>
                            {isPending ? 'Saving...' : (isNew ? 'Send Invite' : 'Save Changes')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {newUserCredentials && (
                <NewUserLoginInfoModal
                    isOpen={!!newUserCredentials}
                    onClose={handleCredentialsModalClose}
                    email={newUserCredentials.email}
                    password={newUserCredentials.password}
                />
            )}
        </>
    );
};

export default TeamMemberDetailModal;