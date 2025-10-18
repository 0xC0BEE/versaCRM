import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Industry } from '../../types';
import Select from '../ui/Select';

const OrganizationProfileSettings: React.FC = () => {
    const { currentIndustry, setCurrentIndustry } = useApp();

    const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentIndustry(e.target.value as Industry);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold">Organization Profile</h3>
            <p className="text-sm text-text-secondary mb-4">
                Manage your organization's core settings.
            </p>
            <div className="max-w-md">
                <Select
                    id="org-industry"
                    label="Industry"
                    value={currentIndustry}
                    onChange={handleIndustryChange}
                >
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal</option>
                    <option value="Generic">Generic</option>
                </Select>
                 <p className="text-xs text-text-secondary mt-2">
                    Changing the industry will reload the application with industry-specific terminology, fields, and dashboards.
                </p>
            </div>
        </div>
    );
};

export default OrganizationProfileSettings;
