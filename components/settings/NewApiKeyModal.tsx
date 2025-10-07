import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Copy, Check } from 'lucide-react';

interface NewApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    keyName: string;
}

const NewApiKeyModal: React.FC<NewApiKeyModalProps> = ({ isOpen, onClose, apiKey, keyName }) => {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`New API Key Generated: ${keyName}`}>
            <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                    Please copy your new API secret key. For security reasons,
                    <strong className="text-warning"> you will not be able to see it again.</strong>
                </p>
                <div className="relative p-3 bg-gray-800 text-white rounded-md font-mono text-sm">
                    <code>{apiKey}</code>
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700 hover:bg-gray-600"
                        aria-label="Copy API key"
                    >
                        {hasCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                    </button>
                </div>
                <div className="text-center">
                    <Button onClick={onClose}>
                        I have copied my key
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default NewApiKeyModal;