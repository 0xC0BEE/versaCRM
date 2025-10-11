import React from 'react';
import ApiAndAppsPage from './ApiAndAppsPage';
import TrackingCodeSettings from './TrackingCodeSettings';
import DataMigration from './DataMigration';

const DeveloperSettings: React.FC = () => {
    return (
        <div className="space-y-8">
            <ApiAndAppsPage />
            <div className="border-t border-border-subtle pt-8">
                <TrackingCodeSettings />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <DataMigration />
            </div>
        </div>
    );
};
export default DeveloperSettings;
