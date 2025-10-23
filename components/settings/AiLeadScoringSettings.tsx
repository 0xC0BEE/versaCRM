import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Wand2, Zap, Loader, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AiLeadScoringSettings: React.FC = () => {
    const { 
        organizationSettingsQuery, 
        updateOrganizationSettingsMutation, 
        recalculateAllScoresMutation,
    } = useData();
    const { authenticatedUser } = useAuth();
    const { data: settings } = organizationSettingsQuery;

    const model = settings?.aiLeadScoringModel;
    const isTraining = model?.status === 'training';
    const isPending = updateOrganizationSettingsMutation.isPending || recalculateAllScoresMutation.isPending;

    const handleTrainModel = async () => {
        // Optimistically set the status to 'training'
        updateOrganizationSettingsMutation.mutate({ 
            aiLeadScoringModel: { 
                ...(model || {}),
                status: 'training' 
            } 
        });
    };
    
    const handleRecalculate = () => {
        recalculateAllScoresMutation.mutate(authenticatedUser!.organizationId, {
            onSuccess: () => {
                toast.success("Recalculation started. Scores will be updated shortly.");
            }
        });
    };

    return (
        <div>
            <h3 className="text-lg font-semibold">AI-Powered Lead Scoring</h3>
            <p className="text-sm text-text-secondary mb-4">
                Let Gemini analyze your past deals to automatically identify the characteristics of high-value leads.
            </p>
            
            <div className="p-4 border border-border-subtle rounded-lg bg-card-bg/50">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-medium">Lead Scoring Model</h4>
                        {model?.status === 'trained' ? (
                            <p className="text-xs text-text-secondary">Last trained: {format(new Date(model.lastTrained!), 'PPp')}</p>
                        ) : (
                            <p className="text-xs text-text-secondary">{model?.status === 'training' ? 'Training in progress...' : 'Not trained yet.'}</p>
                        )}
                    </div>
                    <Button onClick={handleTrainModel} disabled={isTraining} leftIcon={isTraining ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16}/>}>
                        {isTraining ? 'Training...' : (model?.status === 'trained' ? 'Re-train Model' : 'Train Model')}
                    </Button>
                </div>

                {model?.status === 'trained' && (
                    <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h5 className="font-semibold flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-success"/> Positive Factors</h5>
                            <ul className="list-disc list-inside text-sm text-text-secondary">
                                {model.positiveFactors.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold flex items-center gap-2 mb-1"><TrendingDown size={16} className="text-error"/> Negative Factors</h5>
                            <ul className="list-disc list-inside text-sm text-text-secondary">
                                {model.negativeFactors.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-4 flex gap-4 items-center">
                <Button variant="secondary" onClick={handleRecalculate} leftIcon={<Zap size={14} />} disabled={isPending || model?.status !== 'trained'}>
                    Recalculate All Scores
                </Button>
                 {model?.status === 'trained' && (
                    <div className="flex items-center gap-2 text-sm text-success">
                        <CheckCircle size={16} />
                        <span>AI model is active and scoring new contacts.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiLeadScoringSettings;