import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { checkAndTriggerWorkflows } from '../../services/workflowService';
import { AnyContact, ContactStatus, Deal, DealStage } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Loader, TestTube2 } from 'lucide-react';

interface WorkflowTestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type EventType = 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged';

const WorkflowTestModal: React.FC<WorkflowTestModalProps> = ({ isOpen, onClose }) => {
    const { dealStagesQuery } = useData();
    const { data: dealStages = [] } = dealStagesQuery;
    
    const [eventType, setEventType] = useState<EventType>('contactCreated');
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    
    // Form state
    const [contactName, setContactName] = useState('Test Contact');
    const [oldStatus, setOldStatus] = useState<ContactStatus>('Active');
    const [newStatus, setNewStatus] = useState<ContactStatus>('Lead');
    const [dealName, setDealName] = useState('Test Deal');
    const [dealValue, setDealValue] = useState(1000);
    const [oldStage, setOldStage] = useState<string>(dealStages[0]?.id || '');
    const [newStage, setNewStage] = useState<string>(dealStages[1]?.id || '');

    const handleRunTest = async () => {
        setIsLoading(true);
        setLogs([]);

        const mockContact: AnyContact = {
            id: 'contact_test', organizationId: 'org_1', contactName, email: 'test@example.com', phone: '555-TEST',
            status: newStatus, leadSource: 'Web', createdAt: new Date().toISOString(), customFields: {}
        };
        const mockOldContact: AnyContact = { ...mockContact, status: oldStatus };

        const mockDeal: Deal = {
            id: 'deal_test', organizationId: 'org_1', name: dealName, value: dealValue, stageId: newStage,
            contactId: 'contact_test', expectedCloseDate: new Date().toISOString(), createdAt: new Date().toISOString()
        };
        const mockOldDeal: Deal = { ...mockDeal, stageId: oldStage };

        let payload: any = { contact: mockContact };
        switch(eventType) {
            case 'contactStatusChanged':
                payload.oldContact = mockOldContact;
                break;
            case 'dealCreated':
                payload.deal = mockDeal;
                break;
            case 'dealStageChanged':
                payload.deal = mockDeal;
                payload.oldDeal = mockOldDeal;
                break;
        }

        const resultLogs = await checkAndTriggerWorkflows(eventType, payload);
        setLogs(resultLogs);
        setIsLoading(false);
    };

    const renderOptions = () => {
        switch(eventType) {
            case 'contactCreated':
                return <Input id="test-contact-name" label="Contact Name" value={contactName} onChange={e => setContactName(e.target.value)} />;
            case 'contactStatusChanged':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <Select id="test-old-status" label="From Status" value={oldStatus} onChange={e => setOldStatus(e.target.value as ContactStatus)}>
                            <option>Active</option><option>Lead</option><option>Inactive</option>
                        </Select>
                        <Select id="test-new-status" label="To Status" value={newStatus} onChange={e => setNewStatus(e.target.value as ContactStatus)}>
                           <option>Active</option><option>Lead</option><option>Inactive</option>
                        </Select>
                    </div>
                );
            case 'dealCreated':
                return (
                     <div className="grid grid-cols-2 gap-2">
                        <Input id="test-deal-name" label="Deal Name" value={dealName} onChange={e => setDealName(e.target.value)} />
                        <Input id="test-deal-value" label="Deal Value" type="number" value={dealValue} onChange={e => setDealValue(Number(e.target.value))} />
                    </div>
                );
            case 'dealStageChanged':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <Select id="test-old-stage" label="From Stage" value={oldStage} onChange={e => setOldStage(e.target.value)}>
                            {dealStages.map((s: DealStage) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                        <Select id="test-new-stage" label="To Stage" value={newStage} onChange={e => setNewStage(e.target.value)}>
                            {dealStages.map((s: DealStage) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Workflow Trigger Test Tool" size="2xl">
            <div className="space-y-4">
                <Select id="test-event-type" label="Event to Trigger" value={eventType} onChange={e => setEventType(e.target.value as EventType)}>
                    <option value="contactCreated">Contact is Created</option>
                    <option value="contactStatusChanged">Contact Status Changes</option>
                    <option value="dealCreated">Deal is Created</option>
                    <option value="dealStageChanged">Deal Stage Changes</option>
                </Select>
                {renderOptions()}
                <div className="flex justify-end">
                    <Button onClick={handleRunTest} leftIcon={<TestTube2 size={16} />} disabled={isLoading}>
                        {isLoading ? 'Running...' : 'Run Test'}
                    </Button>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border-subtle">
                <h4 className="font-semibold mb-2">Execution Log</h4>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-text-secondary"><Loader size={16} className="animate-spin" /> <span>Checking workflows...</span></div>
                ) : (
                    <pre className="bg-gray-800 text-white p-4 rounded-md text-xs max-h-64 overflow-y-auto">
                        {logs.length > 0 ? logs.join('\n') : 'Run a test to see logs here.'}
                    </pre>
                )}
            </div>
        </Modal>
    );
};

export default WorkflowTestModal;