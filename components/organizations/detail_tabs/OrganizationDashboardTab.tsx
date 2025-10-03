import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { Organization } from '../../../types';
import DashboardPage from '../../dashboard/DashboardPage';

interface OrganizationDashboardTabProps {
    organization: Organization;
}

const OrganizationDashboardTab: React.FC<OrganizationDashboardTabProps> = ({ organization }) => {
    // This component can reuse the main DashboardPage component.
    // The DataContext is already scoped to the logged-in user's organization,
    // so the data displayed will be correct for the current Org Admin.
    // FIX: Passed the required isTabbedView prop and corrected typo from isTabbed.
    // FIX: Completed the JSX to resolve syntax error.
    return (
        <div>
            <DashboardPage isTabbedView={true} />
        </div>
    );
};

export default OrganizationDashboardTab;