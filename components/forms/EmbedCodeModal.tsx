import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmbedCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    formId: string;
}

const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ isOpen, onClose, formId }) => {
    const [hasCopied, setHasCopied] = useState(false);

    const embedCode = `<div id="versacrm-form-${formId}"></div>
<script src="https://cdn.versacrm.com/embed.js" data-form-id="${formId}" async defer></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setHasCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Embed Your Form">
             <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                    Copy and paste this snippet into the HTML of your website where you want the form to appear.
                </p>
                <div className="relative p-3 bg-gray-800 text-white rounded-md font-mono text-sm">
                    <pre><code>{embedCode}</code></pre>
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700 hover:bg-gray-600"
                        aria-label="Copy code"
                    >
                        {hasCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                    </button>
                </div>
                <div className="text-center">
                    <Button onClick={onClose}>
                        Done
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EmbedCodeModal;
