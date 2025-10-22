import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Organization, Industry, FeatureFlag } from '../../types';
import { GoogleGenAI, Type } from '@google/genai';
import { useData } from '../../contexts/DataContext';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import { Wand2, Loader, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../../contexts/AppContext';
import { featureFlags as defaultFlags } from '../../config/featureFlags';
import Switch from '../ui/Switch';
import { Card } from '../ui/Card';


interface OnboardingWizardProps {
    organization: Organization;
}

interface FeatureSuggestion {
    featureId: string;
    reason: string;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ organization }) => {
    const [step, setStep] = useState(1);
    const [industry, setIndustry] = useState<Industry>('Health');
    const [businessDescription, setBusinessDescription] = useState('');
    const [salesStages, setSalesStages] = useState('Lead\nQualification\nProposal\nNegotiation\nClosed Won\nClosed Lost');
    const [marketingGoal, setMarketingGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const isSubmittingRef = useRef(false);

    const [featureSuggestions, setFeatureSuggestions] = useState<(FeatureFlag & { reason: string })[]>([]);
    const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({});
    
    const { createCustomObjectDefMutation, updateOrganizationMutation, updateDealStagesMutation, createCampaignMutation, updateOrganizationSettingsMutation } = useData();
    const queryClient = useQueryClient();
    const { isFeatureEnabled } = useApp();

    const handleSkip = useCallback(() => {
        setIsLoading(true);
        setStep(6); // Show loading screen
        setLoadingMessage('Finalizing your account setup...');
        updateOrganizationMutation.mutate({ ...organization, isSetupComplete: true }, {
            onSuccess: () => {
                toast.success("Setup complete! You can explore AI features later in settings.");
                queryClient.invalidateQueries({ queryKey: ['organizations'] });
            },
            onError: (error) => {
                toast.error(`Failed to finalize setup: ${error.message}`);
                setIsLoading(false);
                setStep(1); // Go back to start
            }
        });
    }, [organization, updateOrganizationMutation, queryClient]);
    
    // This effect handles the case where the AI wizard is disabled by a feature flag
    useEffect(() => {
        if (!isFeatureEnabled('aiOnboardingWizard')) {
            handleSkip();
        }
    }, [isFeatureEnabled, handleSkip]);

    const getFeatureSuggestions = async () => {
        setLoadingMessage('Analyzing your business for feature recommendations...');
        
        const featuresForAI = defaultFlags
            .filter(f => f.id !== 'aiOnboardingWizard')
            .map(f => ({ id: f.id, name: f.name, description: f.description }));

        const prompt = `You are a CRM configuration expert. A user has described their business as: "${businessDescription}".

Based on this description, which of the following AI features would be most valuable to them? Recommend between 2 and 4 features.

Available Features:
${JSON.stringify(featuresForAI, null, 2)}

Your response MUST be a JSON object with a single key 'suggestions', containing an array of objects. Each object must have:
1. 'featureId': The exact ID of the feature you are recommending.
2. 'reason': A short, compelling, single-sentence reason (less than 100 characters) explaining WHY this feature is a good fit for THEIR specific business. Frame it for the user (e.g., "Because you are a law firm, this will help you...").`;
        
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    featureId: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const result = JSON.parse(response.text);

        if (result.suggestions && result.suggestions.length > 0) {
            const enrichedSuggestions = result.suggestions
                .map((s: FeatureSuggestion) => {
                    const flag = defaultFlags.find(f => f.id === s.featureId);
                    return flag ? { ...flag, reason: s.reason } : null;
                })
                .filter(Boolean);
            
            setFeatureSuggestions(enrichedSuggestions);
            setEnabledFeatures(enrichedSuggestions.reduce((acc: Record<string, boolean>, s: FeatureFlag) => {
                acc[s.id] = true;
                return acc;
            }, {}));
            setStep(7);
            setIsLoading(false); // Stop loading before showing the feature selection screen
        } else {
            // If no suggestions, just finish
            await finalizeSetup();
        }
    };
    
    const finalizeSetup = async () => {
        await updateOrganizationMutation.mutateAsync({ ...organization, isSetupComplete: true });
        queryClient.invalidateQueries();
        setStep(8);
    }

    const handleFeatureSetup = async () => {
        setIsLoading(true);
        setStep(6);
        setLoadingMessage('Saving your feature preferences...');
        
        try {
            await updateOrganizationSettingsMutation.mutateAsync({ featureFlags: enabledFeatures });
            await finalizeSetup();
        } catch (error) {
            toast.error("Failed to save your feature preferences. Please try again.");
            console.error("Error saving feature flags:", error);
            // Revert to the feature selection step on failure
            setIsLoading(false);
            setStep(7);
        }
    };


    const handleFinish = async () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        if (!businessDescription.trim() || !salesStages.trim() || !marketingGoal.trim()) {
            toast.error("Please provide a business description, sales stages, and a marketing goal.");
            isSubmittingRef.current = false;
            return;
        }

        setIsLoading(true);
        setStep(6);
        setLoadingMessage('Configuring your CRM with AI...');

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const prompt = `You are a CRM configuration expert. Based on the following information about a business, generate a structured JSON response to set up their CRM, including a starter marketing campaign.
Industry: ${industry}
Business Description: "${businessDescription}"
Sales Stages (one per line):
${salesStages}
Primary Marketing Goal: "${marketingGoal}"
Generate a JSON object with three keys: 'customObjects', 'dealStages', and 'starterCampaign'.
- 'customObjects': An array of custom objects. For each, provide 'nameSingular', 'namePlural', a relevant Lucide icon, and an array of 'fields' ('id', 'label', 'type').
- 'dealStages': An array of strings for the deal stage names.
- 'starterCampaign': A single object for a marketing journey. It needs a 'name', 'targetAudience', and React Flow 'nodes' and 'edges' arrays to build the flow visually. The first node must be the trigger.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            customObjects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { nameSingular: { type: Type.STRING }, namePlural: { type: Type.STRING }, icon: { type: Type.STRING }, fields: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, label: { type: Type.STRING }, type: { type: Type.STRING } } } } } } },
                            dealStages: { type: Type.ARRAY, items: { type: Type.STRING } },
                            starterCampaign: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, targetAudience: { type: Type.OBJECT, properties: { status: { type: Type.STRING, nullable: true }}}, nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, position: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }}}, data: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, nodeType: { type: Type.STRING }, emailTemplateId: { type: Type.STRING, nullable: true }, days: { type: Type.NUMBER, nullable: true }, taskTitle: { type: Type.STRING, nullable: true }}, additionalProperties: true } } } }, edges: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, source: { type: Type.STRING }, target: { type: Type.STRING } } } } } }
                        }
                    }
                }
            });

            const config = JSON.parse(response.text);

            if (config.customObjects) {
                for (const obj of config.customObjects) {
                    await createCustomObjectDefMutation.mutateAsync({ ...obj, organizationId: organization.id });
                }
            }
            if (config.dealStages) {
                await updateDealStagesMutation.mutateAsync({ orgId: organization.id, stages: config.dealStages });
            }
            if (config.starterCampaign) {
                await createCampaignMutation.mutateAsync({ ...config.starterCampaign, status: 'Draft', stats: { recipients: 0, sent: 0, opened: 0, clicked: 0 }, organizationId: organization.id });
            }
            
            // Now, get feature suggestions
            await getFeatureSuggestions();

        } catch (error: any) {
            console.error("AI Onboarding Error:", error);
            const isRateLimitError = error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
            if (isRateLimitError) {
                toast.error("AI is busy right now. Let's skip this and set up manually.");
                handleSkip();
            } else {
                toast.error("An error occurred during AI setup. Please try again or skip.");
                setIsLoading(false);
                setStep(5);
            }
        } finally {
            isSubmittingRef.current = false;
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1: return (
                <div className="text-center">
                    <Wand2 size={48} className="mx-auto text-primary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Welcome to VersaCRM!</h2>
                    <p className="text-text-secondary mb-6">Let's get your CRM configured in just a few minutes. We'll use AI to tailor it to your specific business needs.</p>
                    <Button onClick={() => setStep(2)} size="lg" className="w-full">Get Started</Button>
                </div>
            );
            case 2: return (
                 <div>
                    <h2 className="text-xl font-bold mb-4">What industry are you in?</h2>
                    <select value={industry} onChange={e => setIndustry(e.target.value as Industry)} className="w-full p-2 border border-border-subtle rounded-md bg-card-bg">
                        <option value="Health">Health</option>
                        <option value="Finance">Finance</option>
                        <option value="Legal">Legal</option>
                        <option value="Generic">Other</option>
                    </select>
                </div>
            );
             case 3: return (
                <div>
                    <h2 className="text-xl font-bold mb-4">Briefly describe your business.</h2>
                    <p className="text-sm text-text-secondary mb-2">What do you sell or what service do you provide? (e.g., "We are a residential real estate agency," "We are a law firm specializing in corporate law").</p>
                    <textarea value={businessDescription} onChange={e => setBusinessDescription(e.target.value)} rows={4} className="w-full p-2 border border-border-subtle rounded-md bg-card-bg" />
                </div>
            );
            case 4: return (
                <div>
                    <h2 className="text-xl font-bold mb-4">What are your sales stages?</h2>
                    <p className="text-sm text-text-secondary mb-2">List the typical stages a deal goes through, one per line.</p>
                    <textarea value={salesStages} onChange={e => setSalesStages(e.target.value)} rows={6} className="w-full p-2 border border-border-subtle rounded-md bg-card-bg" />
                </div>
            );
            case 5: return (
                <div>
                    <h2 className="text-xl font-bold mb-4">What's the goal of your first marketing campaign?</h2>
                    <p className="text-sm text-text-secondary mb-2">Describe what you want to achieve. (e.g., "Nurture new leads by sending a welcome email, then create a follow-up task for sales after 3 days").</p>
                    <textarea value={marketingGoal} onChange={e => setMarketingGoal(e.target.value)} rows={4} className="w-full p-2 border border-border-subtle rounded-md bg-card-bg" />
                </div>
            );
            case 6:
                return (
                <div className="text-center p-8">
                    <Loader size={48} className="animate-spin text-primary mx-auto" />
                    <h2 className="text-xl font-bold mt-4">{loadingMessage || 'Please wait...'}</h2>
                    <p className="text-text-secondary mt-2">This may take a moment.</p>
                </div>
            );
            case 7: return (
                <div>
                    <h2 className="text-xl font-bold mb-4">AI Feature Recommendations</h2>
                    <p className="text-sm text-text-secondary mb-4">Based on your business, we recommend enabling these powerful AI features to get started.</p>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {featureSuggestions.map(flag => (
                            <Card key={flag.id} className="p-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <label htmlFor={`flag-${flag.id}`} className="font-semibold cursor-pointer">{flag.name}</label>
                                        <p className="text-xs text-text-secondary mt-1 pr-4">{flag.reason}</p>
                                    </div>
                                    <Switch 
                                        id={`flag-${flag.id}`}
                                        checked={enabledFeatures[flag.id] || false}
                                        onChange={(isChecked) => setEnabledFeatures(prev => ({ ...prev, [flag.id]: isChecked }))}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            );
            case 8: return (
                 <div className="text-center p-8">
                    <PartyPopper size={48} className="text-success mx-auto" />
                    <h2 className="text-xl font-bold mt-4">Your CRM is ready!</h2>
                    <p className="text-text-secondary mt-2">The application will now reload with your custom configuration.</p>
                </div>
            )
            default: return null;
        }
    };

    // If the feature flag is disabled, this component will trigger the skip and then essentially become a loading screen.
    if (!isFeatureEnabled('aiOnboardingWizard')) {
        return (
            <div className="fixed inset-0 bg-bg-primary z-50 flex items-center justify-center">
                <div className="bg-card-bg p-8 rounded-lg shadow-lg w-full max-w-2xl border border-border-subtle">
                   {renderStep()}
                </div>
            </div>
        );
    }


    return (
        <div className="fixed inset-0 bg-bg-primary z-50 flex items-center justify-center">
            <div className="bg-card-bg p-8 rounded-lg shadow-lg w-full max-w-2xl border border-border-subtle">
                {renderStep()}
                {step > 1 && step < 6 && (
                    <div className="mt-6 flex justify-between">
                        <div>
                           <Button variant="secondary" onClick={handleSkip} disabled={isLoading}>Skip for now</Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={isLoading}>Back</Button>
                            {step < 5 && <Button onClick={() => setStep(step + 1)}>Next</Button>}
                            {step === 5 && (
                                <Button onClick={handleFinish} leftIcon={isLoading ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16}/>} disabled={isLoading}>
                                    {isLoading ? 'Building...' : 'Finish & Build'}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
                {step === 7 && (
                     <div className="mt-6 flex justify-end">
                        <Button onClick={handleFeatureSetup} disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Finish Setup'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingWizard;