import React, { useMemo, useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { User, CustomRole } from '../../types';
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
        role: ''
    }), [authenticatedUser, roles]);

    const { formData, handleChange, resetForm } = useForm(initialState, member);

    useEffect(() => {
        if (createUserMutation.isSuccess) {
            const newUser = createUserMutation.data as User;
            const tempPassword = 'password123';
            setNewUserCredentials({ email: newUser.email, password: tempPassword });
            createUserMutation.reset();
        }
    }, [createUserMutation.isSuccess, createUserMutation.data, createUserMutation]);

    useEffect(() => {
        if (updateUserMutation.isSuccess || deleteUserMutation.isSuccess) {
            onClose();
            updateUserMutation.reset();
            deleteUserMutation.reset();
        }
    }, [updateUserMutation.isSuccess, deleteUserMutation.isSuccess, onClose, updateUserMutation, deleteUserMutation]);

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
            createUserMutation.mutate(formData);
        } else {
            updateUserMutation.mutate({ ...member!, ...formData });
        }
    };

    const handleDelete = () => {
        if (member && window.confirm(`Are you sure you want to remove ${member.name}?`)) {
            deleteUserMutation.mutate(member.id);
        }
    };
    
    const handleCredentialsModalClose = () => {
        setNewUserCredentials(null);
        resetForm();
        onClose();
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
                        {!isNew && member?.id !== authenticatedUser?.id && (
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