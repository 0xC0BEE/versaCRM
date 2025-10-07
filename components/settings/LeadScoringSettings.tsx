import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { LeadScoringRule, OrganizationSettings } from '../../types';
import Button from '../ui/Button';
import { Plus, Edit, Trash2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import LeadScoringRuleEditModal from './LeadScoringRuleEditModal';

const LeadScoringSettings: React.FC = () => {
    const { organizationSettingsQuery, updateOrganizationSettingsMutation, recalculateAllScoresMutation } = useData();
    const { authenticatedUser } = useAuth();
    const { data: settings } = organizationSettingsQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<LeadScoringRule | null>(null);

    const rules = settings?.leadScoringRules || [];

    const handleAddRule = () => {
        setSelectedRule(null);
        setIsModalOpen(true);
    };

    const handleEditRule = (rule: LeadScoringRule) => {
        setSelectedRule(rule);
        setIsModalOpen(true);
    };

    const handleDeleteRule = (ruleId: string) => {
        if (window.confirm("Are you sure you want to delete this rule?")) {
            const newRules = rules.filter((r: LeadScoringRule) => r.id !== ruleId);
            updateOrganizationSettingsMutation.mutate({ leadScoringRules: newRules });
        }
    };

    const handleSaveRule = (ruleData: LeadScoringRule) => {
        let newRules;
        if (selectedRule) {
            newRules = rules.map((r: LeadScoringRule) => (r.id === ruleData.id ? ruleData : r));
        } else {
            newRules = [...rules, { ...ruleData, id: `rule_${Date.now()}` }];
        }
        updateOrganizationSettingsMutation.mutate({ leadScoringRules: newRules }, {
            onSuccess: () => setIsModalOpen(false)
        });
    };
    
    const handleRecalculate = () => {
        recalculateAllScoresMutation.mutate(authenticatedUser!.organizationId);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Lead Scoring Rules</h3>
                    <p className="text-sm text-text-secondary">Define rules to automatically score contacts based on their activities and status.</p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={handleRecalculate} leftIcon={<Zap size={14} />} disabled={recalculateAllScoresMutation.isPending}>
                        {recalculateAllScoresMutation.isPending ? 'Recalculating...' : 'Recalculate All Scores'}
                    </Button>
                    <Button size="sm" onClick={handleAddRule} leftIcon={<Plus size={14} />}>
                        Add Rule
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {rules.map((rule: LeadScoringRule) => (
                    <div key={rule.id} className="p-3 border border-border-subtle rounded-md bg-card-bg/50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className={`font-bold text-xl ${rule.points > 0 ? 'text-success' : 'text-error'}`}>
                                {rule.points > 0 ? `+${rule.points}` : rule.points}
                            </span>
                            <div>
                                <p className="font-medium">When a <span className="font-bold">{rule.event === 'interaction' ? 'Interaction' : 'Status Change'}</span> event occurs</p>
                                <p className="text-xs text-text-secondary">
                                    {rule.interactionType && `Type is "${rule.interactionType}"`}
                                    {rule.status && `New status is "${rule.status}"`}
                                </p>
                            </div>
                        </div>
                        <div className="space-x-2">
                            <Button size="sm" variant="secondary" onClick={() => handleEditRule(rule)} leftIcon={<Edit size={14} />}>Edit</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDeleteRule(rule.id)} leftIcon={<Trash2 size={14} />} disabled={updateOrganizationSettingsMutation.isPending}>Delete</Button>
                        </div>
                    </div>
                ))}
                {rules.length === 0 && (
                    <p className="text-sm text-text-secondary py-4">No lead scoring rules defined yet.</p>
                )}
            </div>
            
            <LeadScoringRuleEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                rule={selectedRule}
                onSave={handleSaveRule}
                isSaving={updateOrganizationSettingsMutation.isPending}
            />
        </div>
    );
};

export default LeadScoringSettings;
