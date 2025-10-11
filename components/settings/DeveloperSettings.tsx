import React from 'react';
import ApiAndAppsPage from './ApiAndAppsPage';
import TrackingCodeSettings from './TrackingCodeSettings';
import DataMigration from './DataMigration';
import SandboxSettings from './SandboxSettings';
import FeatureFlagsSettings from './FeatureFlagsSettings';

const DeveloperSettings: React.FC = () => {
    return (
        <div className="space-y-8">
            <ApiAndAppsPage />
            <div className="border-t border-border-subtle pt-8">
                <TrackingCodeSettings />
            </div>
             <div className="border-t border-border-subtle pt-8">
                <FeatureFlagsSettings />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <DataMigration />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <SandboxSettings />
            </div>
        </div>
    );
};
export default DeveloperSettings;
