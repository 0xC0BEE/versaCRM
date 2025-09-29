import React from 'react';
import { Organization } from '../../../types';
import WorkflowsPage from '../../workflows/WorkflowsPage';

interface OrganizationWorkflowsTabProps {
    organization: Organization;
}

const OrganizationWorkflowsTab: React.FC<OrganizationWorkflowsTabProps> = ({ organization }) => {
    // This tab can reuse the main WorkflowsPage component logic.
    // In a real app, you might pass the organization ID down to filter workflows.
    // For this mock setup, the WorkflowsPage already handles fetching based on the logged-in user's org.
    return (
        <div>
            <WorkflowsPage isTabbedView={true} />
        </div>
    );
};

export default OrganizationWorkflowsTab;