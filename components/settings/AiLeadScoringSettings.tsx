import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Wand2, Zap, Loader, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleGenAI, Type } from '@google/genai';
import { AnyContact, Deal, DealStage } from '../../types';
import { format } from 'date-fns';

// FIX: Changed to a named export to resolve module import error.
export const AiLeadScoringSettings: React.FC = () => {
    const { 
        organizationSettingsQuery, 
        updateOrganizationSettingsMutation, 
        recalculateAllScoresMutation,
        contactsQuery,
        dealsQuery,
        dealStagesQuery 
    } = useData();
    const { authenticatedUser } = useAuth();
    const { data: settings } = organizationSettingsQuery;

    const [isTraining, setIsTraining] = useState(false);

    const model = settings?.aiLeadScoringModel;

    const handleTrainModel = async () => {
        setIsTraining(true);
        toast('Starting AI model training...', { icon: '🤖' });

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const contacts = (contactsQuery.data as AnyContact[]) || [];
            const deals = (dealsQuery.data as Deal[]) || [];
            const dealStages = (dealStagesQuery.data as DealStage[]) || [];
            
            const wonStageId = dealStages.find(s => s.name.toLowerCase().includes('won'))?.id;
            const lostStageId = dealStages.find(s => s.name.toLowerCase().includes('lost'))?.id;

            const getContactDataForDeal = (deal: Deal) => {
                const contact = contacts.find(c => c.id === deal.contactId);
                if (!contact) return null;
                return {
                    leadSource: contact.leadSource,
                    // interactionsCount: contact.interactions?.length || 0,
                };
            };
            
            const wonDealsData = deals.filter(d => d.stageId === wonStageId).map(getContactDataForDeal).filter(Boolean);
            const lostDealsData = deals.filter(d => d.stageId === lostStageId).map(getContactDataForDeal).filter(Boolean);

            const prompt = `Analyze this CRM data of won vs. lost deals. Based on the contact properties, identify the top 2-3 positive factors (attributes common in won deals) and top 2-3 negative factors (attributes common in lost deals).

Won Deals' Contact Data: ${JSON.stringify(wonDealsData.slice(0, 10))}
Lost Deals' Contact Data: ${JSON.stringify(lostDealsData.slice(0, 10))}

Respond with a JSON object containing 'positiveFactors' and 'negativeFactors', each being an array of short, descriptive strings.`;

            const response = await ai.models.generateContent({
                // FIX: Corrected the Gemini model name.
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            positiveFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                            negativeFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                        }
                    }
                }
            });

            const newModel = {
                status: 'trained' as const,
                lastTrained: new Date().toISOString(),
                ...JSON.parse(response.text)
            };
            
            updateOrganizationSettingsMutation.mutate({ aiLeadScoringModel: newModel }, {
                onSuccess: () => {
                    toast.success("AI model trained successfully!");
                }
            });

        } catch (error) {
            toast.error("Failed to train AI model.");
            console.error("AI Training Error:", error);
        } finally {
            setIsTraining(false);
        }
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
                            <p className="text-xs text-text-secondary">Not trained yet.</p>
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
                <Button variant="secondary" onClick={handleRecalculate} leftIcon={<Zap size={14} />} disabled={recalculateAllScoresMutation.isPending}>
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
