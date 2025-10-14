import React, { useState } from 'react';
import { Organization, Industry, CustomObjectDefinition, DealStage } from '../../types';
import { GoogleGenAI, Type } from '@google/genai';
import { useData } from '../../contexts/DataContext';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Wand2, Loader, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';

interface OnboardingWizardProps {
    organization: Organization;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ organization }) => {
    const [step, setStep] = useState(1);
    const [industry, setIndustry] = useState<Industry>('Health');
    const [businessDescription, setBusinessDescription] = useState('');
    const [salesStages, setSalesStages] = useState('Lead\nQualification\nProposal\nNegotiation\nClosed Won\nClosed Lost');
    const [isLoading, setIsLoading] = useState(false);
    
    const { createCustomObjectDefMutation, updateOrganizationMutation, updateDealStagesMutation } = useData();
    const queryClient = useQueryClient();

    const handleFinish = async () => {
        if (!businessDescription.trim() || !salesStages.trim()) {
            toast.error("Please provide a description and your sales stages.");
            return;
        }

        setIsLoading(true);
        setStep(5); // Move to loading step

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});

            const prompt = `You are a CRM configuration expert. Based on the following information about a business, generate a structured JSON response to set up their CRM.

Industry: ${industry}
Business Description: "${businessDescription}"
Sales Stages (one per line):
${salesStages}

Generate a JSON object with two keys: 'customObjects' and 'dealStages'.

- 'customObjects': An array of custom objects to create. For each object, provide 'nameSingular', 'namePlural', a relevant 'icon' from the Lucide icon library, and an array of 'fields' (with 'id', 'label', and 'type' like 'text', 'number', 'date', 'select').
- 'dealStages': An array of strings representing the deal stage names.

Example for a Real Estate agency:
{
  "customObjects": [
    {
      "nameSingular": "Property",
      "namePlural": "Properties",
      "icon": "Home",
      "fields": [
        { "id": "address", "label": "Address", "type": "text" },
        { "id": "price", "label": "Price", "type": "number" }
      ]
    }
  ],
  "dealStages": ["Showing", "Offer Made", "Under Contract", "Sold"]
}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            customObjects: { 
                                type: Type.ARRAY, 
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        nameSingular: { type: Type.STRING },
                                        namePlural: { type: Type.STRING },
                                        icon: { type: Type.STRING },
                                        fields: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    id: { type: Type.STRING },
                                                    label: { type: Type.STRING },
                                                    type: { type: Type.STRING },
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            dealStages: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });

            const config = JSON.parse(response.text);

            // Create Custom Objects
            if (config.customObjects) {
                for (const obj of config.customObjects) {
                    await createCustomObjectDefMutation.mutateAsync({
                        ...obj,
                        organizationId: organization.id,
                    });
                }
            }
            
            // Update Deal Stages
            if (config.dealStages) {
                await updateDealStagesMutation.mutateAsync({
                    orgId: organization.id,
                    stages: config.dealStages,
                });
            }
            
            // Mark setup as complete
            await updateOrganizationMutation.mutateAsync({ ...organization, isSetupComplete: true });
            
            // Invalidate queries to refetch all data for the newly configured app
            queryClient.invalidateQueries();

            setStep(6); // Move to success step

        } catch (error) {
            console.error("AI Onboarding Error:", error);
            toast.error("An error occurred during AI setup. Please try again.");
            setIsLoading(false);
            setStep(1); // Go back to the first step
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1: return (
                <div>
                    <h2 className="text-2xl font-bold mb-2">Welcome to VersaCRM!</h2>
                    <p className="text-text-secondary">Let's get your CRM configured in just a few minutes. We'll use AI to tailor it to your specific business needs.</p>
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
                <div className="text-center p-8">
                    <Loader size={48} className="animate-spin text-primary mx-auto" />
                    <h2 className="text-xl font-bold mt-4">Configuring your CRM...</h2>
                    <p className="text-text-secondary mt-2">Our AI is building your custom objects and sales pipeline.</p>
                </div>
            );
            case 6: return (
                 <div className="text-center p-8">
                    <PartyPopper size={48} className="text-success mx-auto" />
                    <h2 className="text-xl font-bold mt-4">Your CRM is ready!</h2>
                    <p className="text-text-secondary mt-2">The application will now reload with your custom configuration.</p>
                </div>
            )
        }
    };

    return (
        <div className="fixed inset-0 bg-bg-primary z-50 flex items-center justify-center">
            <div className="bg-card-bg p-8 rounded-lg shadow-lg w-full max-w-2xl border border-border-subtle">
                {renderStep()}
                <div className="mt-6 flex justify-between">
                    {step > 1 && step < 5 && (
                        <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={isLoading}>Back</Button>
                    )}
                    <div/>
                    {step < 4 && (
                        <Button onClick={() => setStep(step + 1)}>Next</Button>
                    )}
                    {step === 4 && (
                        <Button onClick={handleFinish} leftIcon={isLoading ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16}/>} disabled={isLoading}>
                            {isLoading ? 'Building...' : 'Finish & Build'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;