import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import { DocumentTemplate, User, DocumentPermission, DocumentAccessLevel } from '../../types';
import toast from 'react-hot-toast';

interface ShareDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: DocumentTemplate;
}

const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({ isOpen, onClose, template }) => {
    const { teamMembersQuery, updateDocumentTemplatePermissionsMutation } = useData();
    const { data: teamMembers = [] } = teamMembersQuery;

    const [permissions, setPermissions] = useState<DocumentPermission[]>(template.permissions || []);

    const userMap = useMemo(() => new Map((teamMembers as User[]).map(u => [u.id, u])), [teamMembers]);

    const handlePermissionChange = (userId: string, accessLevel: DocumentAccessLevel | 'none') => {
        setPermissions(prev => {
            const existing = prev.find(p => p.userId === userId);
            if (accessLevel === 'none') {
                return prev.filter(p => p.userId !== userId);
            }
            if (existing) {
                return prev.map(p => p.userId === userId ? { ...p, accessLevel } : p);
            }
            return [...prev, { userId, accessLevel }];
        });
    };

    const handleSave = () => {
        updateDocumentTemplatePermissionsMutation.mutate({ id: template.id, permissions }, {
            onSuccess: () => {
                toast.success("Permissions updated!");
                onClose();
            },
        });
    };

    const isPending = updateDocumentTemplatePermissionsMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Share "${template.name}"`}>
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {(teamMembers as User[]).map(user => {
                    const currentPermission = permissions.find(p => p.userId === user.id)?.accessLevel || 'none';
                    return (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-hover-bg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">{user.name.charAt(0)}</div>
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-text-secondary">{user.email}</p>
                                </div>
                            </div>
                            <select
                                value={currentPermission}
                                onChange={e => handlePermissionChange(user.id, e.target.value as any)}
                                className="bg-card-bg border border-border-subtle rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="edit">Can edit</option>
                                <option value="view">Can view</option>
                                <option value="none">No access</option>
                            </select>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Permissions'}
                </Button>
            </div>
        </Modal>
    );
};

export default ShareDocumentModal;