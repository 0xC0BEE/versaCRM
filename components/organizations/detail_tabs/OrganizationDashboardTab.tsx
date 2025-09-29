import React from 'react';
import { Organization } from '../../../types';
import DashboardPage from '../../dashboard/DashboardPage';

interface OrganizationDashboardTabProps {
    organization: Organization;
}

const OrganizationDashboardTab: React.FC<OrganizationDashboardTabProps> = ({ organization }) => {
    // This component can reuse the main DashboardPage component.
    // The DataContext is already scoped to the logged-in user's organization,
    // so the data displayed will be correct for the current Org Admin.
    // FIX: Passed the required isTabbedView prop.
    return (
        <div>
            <DashboardPage isTabbedView={true} />
        </div>
    );
};

export default OrganizationDashboardTab;
