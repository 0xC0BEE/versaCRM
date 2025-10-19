import React from 'react';
import LiveChatSettings from './LiveChatSettings';
import AiLeadScoringSettings from './AiLeadScoringSettings';
import EmailTemplates from './EmailTemplates';
import TicketSettings from './TicketSettings';
import CannedResponses from './CannedResponses';
import SurveySettings from './SurveySettings';

const ChannelsAndLeadGenSettings: React.FC = () => {
    return (
        <div className="space-y-8">
            <LiveChatSettings />
            <div className="border-t border-border-subtle pt-8">
                <AiLeadScoringSettings />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <EmailTemplates />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <CannedResponses />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <TicketSettings />
            </div>
            <div className="border-t border-border-subtle pt-8">
                <SurveySettings />
            </div>
        </div>
    );
};
export default ChannelsAndLeadGenSettings;