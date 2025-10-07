import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface NewUserLoginInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    password: string;
}

const NewUserLoginInfoModal: React.FC<NewUserLoginInfoModalProps> = ({ isOpen, onClose, email, password }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invitation Sent!">
            <div className="text-center space-y-4">
                <p className="text-sm text-text-secondary">
                    An invitation has been sent. For demo purposes, here are the login details for the new team member.
                </p>
                <div className="p-4 bg-hover-bg rounded-lg text-left">
                    <p><span className="font-semibold">Email:</span> {email}</p>
                    <p><span className="font-semibold">Password:</span> {password}</p>
                </div>
                <Button onClick={onClose}>
                    OK
                </Button>
            </div>
        </Modal>
    );
};

export default NewUserLoginInfoModal;
