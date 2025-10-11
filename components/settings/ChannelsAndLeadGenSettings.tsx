import React from 'react';
import LiveChatSettings from './LiveChatSettings';
import LeadScoringSettings from './LeadScoringSettings';
import EmailTemplates from './EmailTemplates';
import TicketSettings from './TicketSettings';

const ChannelsAndLeadGenSettings: React.FC = () => {
    return (
        <div className="space-y-8">
            <LiveChatSettings />
            <div className="border-t border-border-subtle pt-8">
                <LeadScoringSettings />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <EmailTemplates />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <TicketSettings />
            </div>
        </div>
    );
};
export default ChannelsAndLeadGenSettings;
