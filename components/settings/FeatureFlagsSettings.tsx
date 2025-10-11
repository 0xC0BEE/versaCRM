import React from 'react';
import { useData } from '../../contexts/DataContext';
import { featureFlags as defaultFlags } from '../../config/featureFlags';
import { FeatureFlag } from '../../types';
import toast from 'react-hot-toast';

const FeatureFlagsSettings: React.FC = () => {
    const { organizationSettingsQuery, updateOrganizationSettingsMutation } = useData();
    const { data: settings, isLoading } = organizationSettingsQuery;

    const handleFlagToggle = (flagId: string, isEnabled: boolean) => {
        const currentFlags = settings?.featureFlags || {};
        const newFlags = { ...currentFlags, [flagId]: isEnabled };
        updateOrganizationSettingsMutation.mutate({ featureFlags: newFlags }, {
            onSuccess: () => toast.success("Feature flag updated! The app may need a refresh to see changes.")
        });
    };
    
    const isPending = updateOrganizationSettingsMutation.isPending;

    if (isLoading) {
        return <p>Loading feature flags...</p>;
    }

    return (
        <div>
            <h3 className="text-lg font-semibold">Feature Flags</h3>
            <p className="text-sm text-text-secondary mb-4">
                Enable or disable experimental features for your organization. Changes may require a page refresh to take effect.
            </p>

            <div className="space-y-3">
                {defaultFlags.map((flag: FeatureFlag) => {
                    const isEnabled = settings?.featureFlags?.[flag.id] ?? flag.isEnabled;
                    return (
                        <div key={flag.id} className="p-3 border border-border-subtle rounded-md bg-card-bg/50 flex justify-between items-center">
                            <div>
                                <p className="font-medium">{flag.name}</p>
                                <p className="text-xs text-text-secondary">{flag.description}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => handleFlagToggle(flag.id, e.target.checked)}
                                className="h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-600 checked:bg-primary focus:ring-primary border-transparent"
                                disabled={isPending}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FeatureFlagsSettings;
