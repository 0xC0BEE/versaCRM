import React from 'react';
import ApiKeysSettings from './ApiKeysSettings';
import IntegrationsSettings from './IntegrationsSettings';
import TrackingCodeSettings from './TrackingCodeSettings';
import DataMigration from './DataMigration';
import SandboxSettings from './SandboxSettings';
import FeatureFlagsSettings from './FeatureFlagsSettings';
import DataWarehouseSettings from './DataWarehouseSettings';

const DeveloperSettings: React.FC = () => {
    return (
        <div className="space-y-8">
            <ApiKeysSettings />
            <div className="border-t border-border-subtle pt-8">
                <IntegrationsSettings />
            </div>
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
                <DataWarehouseSettings />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <SandboxSettings />
            </div>
        </div>
    );
};
export default DeveloperSettings;