import React, { useMemo, useEffect } from 'react';
import { CustomRole, Permission } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface RoleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: CustomRole | null;
}

const permissionGroups: { category: string; permissions: { id: Permission; label: string }[] }[] = [
    {
        category: 'Contacts',
        permissions: [
            { id: 'contacts:read:all', label: 'View All Contacts' },
            { id: 'contacts:read:own', label: 'View Own (Assigned) Contacts' },
            { id: 'contacts:create', label: 'Create Contacts' },
            { id: 'contacts:edit', label: 'Edit Contacts' },
            { id: 'contacts:delete', label: 'Delete Contacts' },
        ]
    },
    {
        category: 'Deals',
        permissions: [
            { id: 'deals:read', label: 'View Deals' },
            { id: 'deals:create', label: 'Create Deals' },
            { id: 'deals:edit', label: 'Edit Deals' },
            { id: 'deals:delete', label: 'Delete Deals' },
        ]
    },
    {
        category: 'Tickets',
        permissions: [
            { id: 'tickets:read', label: 'View Tickets' },
            { id: 'tickets:create', label: 'Create Tickets' },
            { id: 'tickets:edit', label: 'Edit/Reply to Tickets' },
        ]
    },
    {
        category: 'Automations',
        permissions: [
            { id: 'automations:manage', label: 'Manage Workflows & Campaigns' },
        ]
    },
    {
        category: 'Reports',
        permissions: [
            { id: 'reports:read', label: 'View Standard Reports' },
            { id: 'reports:manage', label: 'Manage Custom Reports' },
        ]
    },
    {
        category: 'Inventory',
        permissions: [
            { id: 'inventory:read', label: 'View Inventory' },
            { id: 'inventory:manage', label: 'Manage Inventory' },
        ]
    },
    {
        category: 'Settings',
        permissions: [
            { id: 'settings:access', label: 'Access Settings' },
            { id: 'settings:manage:team', label: 'Manage Team Members' },
            { id: 'settings:manage:roles', label: 'Manage Roles & Permissions' },
        ]
    }
];

const RoleEditModal: React.FC<RoleEditModalProps> = ({ isOpen, onClose, role }) => {
    const { createRoleMutation, updateRoleMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !role;

    const initialState = useMemo((): Omit<CustomRole, 'id'> => ({
        name: '',
        description: '',
        organizationId: authenticatedUser!.organizationId,
        isSystemRole: false,
        permissions: {},
    }), [authenticatedUser]);

    const { formData, handleChange, setFormData } = useForm(initialState, role);
    
    useEffect(() => {
        if (createRoleMutation.isSuccess || updateRoleMutation.isSuccess) {
            onClose();
            createRoleMutation.reset();
            updateRoleMutation.reset();
        }
    }, [createRoleMutation.isSuccess, updateRoleMutation.isSuccess, onClose, createRoleMutation, updateRoleMutation]);

    const handlePermissionChange = (permissionId: Permission, isChecked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permissionId]: isChecked,
            }
        }));
    };

    const handleSave = () => {
        if (!formData.name.trim()) {
            toast.error("Role name is required.");
            return;
        }

        if (isNew) {
            createRoleMutation.mutate(formData);
        } else {
            updateRoleMutation.mutate(formData as CustomRole);
        }
    };
    
    const isPending = createRoleMutation.isPending || updateRoleMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Role' : `Edit Role: ${role?.name}`} size="3xl">
            <div className="space-y-4">
                <Input id="role-name" label="Role Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required disabled={isPending || formData.isSystemRole} />
                <Textarea id="role-desc" label="Description" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={2} disabled={isPending} />

                <div className="pt-4 border-t border-border-subtle">
                    <h3 className="font-semibold mb-2">Permissions</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                        {permissionGroups.map(group => (
                            <div key={group.category}>
                                <h4 className="font-medium text-sm text-text-primary mb-2">{group.category}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {group.permissions.map(perm => (
                                        <label key={perm.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-hover-bg">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-border-subtle text-primary focus:ring-primary"
                                                checked={!!formData.permissions[perm.id]}
                                                onChange={(e) => handlePermissionChange(perm.id, e.target.checked)}
                                                disabled={isPending || formData.isSystemRole}
                                            />
                                            <span className="text-sm">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending || formData.isSystemRole}>
                    {isPending ? 'Saving...' : 'Save Role'}
                </Button>
            </div>
        </Modal>
    );
};

export default RoleEditModal;