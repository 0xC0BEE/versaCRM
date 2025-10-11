import React from 'react';
import CustomObjectsSettings from './CustomObjectsSettings';
import FormBuilder from './FormBuilder';
import InteractionFormBuilder from './InteractionFormBuilder';

const ObjectsAndFieldsSettings: React.FC = () => {
    return (
        <div className="space-y-8">
            <CustomObjectsSettings />
            <div className="border-t border-border-subtle pt-8">
                <FormBuilder />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <InteractionFormBuilder />
            </div>
        </div>
    );
};
export default ObjectsAndFieldsSettings;
