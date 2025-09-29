import React from 'react';
import Modal from './Modal';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileName: string;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, fileUrl, fileName }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={fileName} size="4xl">
            <div>
                <img src={fileUrl} alt={`Preview of ${fileName}`} className="max-w-full max-h-[70vh] mx-auto" />
            </div>
        </Modal>
    );
};

export default FilePreviewModal;
