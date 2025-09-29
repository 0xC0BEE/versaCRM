import React from 'react';
import FileInput from '../../ui/FileInput';

const DocumentsTab: React.FC = () => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Your Documents</h3>
            <p className="text-sm text-gray-500 mb-4">View and upload important documents.</p>
            <FileInput />
            {/* A list of uploaded documents would go here */}
        </div>
    );
};

export default DocumentsTab;
