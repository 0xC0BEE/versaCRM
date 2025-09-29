import React from 'react';
import Modal from '../ui/Modal';
import { User, UserRole } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface TeamMemberDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: User | null;
}

const TeamMemberDetailModal: React.FC<TeamMemberDetailModalProps> = ({ isOpen, onClose, member }) => {
    
    // In a real app, you'd have state and save handlers here.
    // This is a read-only mock for now.

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={member ? `Edit ${member.name}` : 'Invite New Team Member'}>
            <div className="space-y-4">
                <Input
                    id="member-name"
                    label="Full Name"
                    value={member?.name || ''}
                    readOnly={!!member} // Make fields editable for new member
                />
                 <Input
                    id="member-email"
                    label="Email"
                    type="email"
                    value={member?.email || ''}
                     readOnly={!!member}
                />
                <Select id="member-role" label="Role" value={member?.role || 'Team Member'}>
                    <option value="Organization Admin">Organization Admin</option>
                    <option value="Team Member">Team Member</option>
                </Select>
                 <div className="pt-4 border-t dark:border-dark-border">
                    <h4 className="font-semibold text-base">Permissions</h4>
                    <p className="text-sm text-gray-500">Permission details based on role would be shown here.</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Close</Button>
                <Button>Save Changes</Button>
            </div>
        </Modal>
    );
};

export default TeamMemberDetailModal;
