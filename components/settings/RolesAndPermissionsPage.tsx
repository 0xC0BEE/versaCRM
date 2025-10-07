import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { CustomRole } from '../../types';
import Button from '../ui/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import RoleEditModal from './RoleEditModal';

const RolesAndPermissionsPage: React.FC = () => {
    const { rolesQuery, deleteRoleMutation } = useData();
    const { data: roles = [], isLoading } = rolesQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);

    const handleAdd = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleEdit = (role: CustomRole) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleDelete = (role: CustomRole) => {
        if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            deleteRoleMutation.mutate(role.id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Roles & Permissions</h3>
                    <p className="text-sm text-text-secondary">Define what different users can see and do.</p>
                </div>
                <Button size="sm" onClick={handleAdd} leftIcon={<Plus size={14} />}>
                    New Role
                </Button>
            </div>

            {isLoading ? (
                <p>Loading roles...</p>
            ) : (
                <div className="space-y-3">
                    {roles.map((role: CustomRole) => (
                        <div key={role.id} className="p-3 border border-border-subtle rounded-md bg-card-bg/50 flex justify-between items-center">
                            <div>
                                <p className="font-medium">{role.name} {role.isSystemRole && <span className="text-xs text-text-secondary">(System)</span>}</p>
                                <p className="text-xs text-text-secondary">{role.description}</p>
                            </div>
                            <div className="space-x-2">
                                <Button size="sm" variant="secondary" onClick={() => handleEdit(role)} leftIcon={<Edit size={14} />}>Edit</Button>
                                {!role.isSystemRole && (
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(role)} leftIcon={<Trash2 size={14} />} disabled={deleteRoleMutation.isPending}>
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <RoleEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                role={selectedRole}
            />
        </div>
    );
};

export default RolesAndPermissionsPage;