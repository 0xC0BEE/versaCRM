import React from 'react';
import { Organization } from '../../../types';
import ReportsPage from '../../reports/ReportsPage';

interface OrganizationReportsTabProps {
    organization: Organization;
}

const OrganizationReportsTab: React.FC<OrganizationReportsTabProps> = ({ organization }) => {
    // This component can reuse the main ReportsPage component.
    // The DataContext and API calls will be scoped to the logged-in user's organization.
    return (
        <div>
            <ReportsPage isTabbedView={true} />
        </div>
    );
};

export default OrganizationReportsTab;