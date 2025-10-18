import React, { useState, useMemo, useCallback } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Zap, Code, Trash2, TestTube2, Wand2, Loader, ArrowRight } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Workflow, AdvancedWorkflow, ProcessInsight, Deal, Ticket, DealStage } from '../../types';
import WorkflowBuilder from './WorkflowBuilder';
import AdvancedWorkflowBuilder from './advanced/AdvancedWorkflowBuilder';
import toast from 'react-hot-toast';
import WorkflowTestModal from './WorkflowTestModal';
import { GoogleGenAI, Type } from '@google/genai';
import { differenceInDays } from 'date-fns';
import { useApp } from '../../contexts/AppContext';

interface WorkflowsPageProps {
    isTabbedView?: boolean;
}

interface AiProcessOptimizationCardProps { onSuggest: (insight: ProcessInsight) => void }

const AiProcessOptimizationCard: React.FC<AiProcessOptimizationCardProps> = ({ onSuggest }) => {
    const [analysisResult, setAnalysisResult] = useState<ProcessInsight[] | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { dealsQuery, ticketsQuery, dealStagesQuery } = useData();
    const { isFeatureEnabled } = useApp();
    
    const isDataLoading = dealsQuery.status !== 'success' || ticketsQuery.status !== 'success' || dealStagesQuery.status !== 'success';

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);

        if (dealsQuery.status !== 'success' || !Array.isArray(dealsQuery.data) ||
            ticketsQuery.status !== 'success' || !Array.isArray(ticketsQuery.data) ||
            dealStagesQuery.status !== 'success' || !Array.isArray(dealStagesQuery.data)) {
            toast.error("Data is not ready for analysis. Please try again in a moment.");
            setIsAnalyzing(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const deals = dealsQuery.data || [];
            const tickets = ticketsQuery.data || [];
            const dealStages = dealStagesQuery.data || [];

            // Summarize data to keep prompt concise
            const dealJourneys = deals.map(deal => ({
                stage: dealStages.find(s => s.id === deal.stageId)?.name || 'Unknown',
                durationDays: differenceInDays(new Date(), new Date(deal.createdAt)),
                value: deal.value,
            }));
            
            const ticketSummary = tickets.reduce((acc: Record<string, number>, ticket) => {
                const key = `${ticket.priority} Priority`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

            // Only send necessary fields for deal stages
            const stageSummary = dealStages.map(s => ({ id: s.id, name: s.name }));

            const prompt = `You are a CRM process optimization expert. Analyze this summary of deal and ticket data to find bottlenecks and suggest simple workflow automations.

Data:
- Deal Journeys: ${JSON.stringify(dealJourneys.slice(0, 10))}
- Ticket Summary: ${JSON.stringify(ticketSummary)}
- Available Deal Stages: ${JSON.stringify(stageSummary)}

Your response MUST be a JSON object containing an array called 'insights'. Each object in the array should have:
1. 'observation': A string describing a potential bottleneck (e.g., "Deals over $50k in 'Proposal Sent' seem to be stalling.").
2. 'suggestion': A string suggesting a workflow (e.g., "Create a workflow to notify a manager when a high-value deal is in 'Proposal Sent' for more than 7 days.").
3. 'workflow': An object with 'trigger' and 'actions' keys, structured for my system.

- 'workflow.trigger': Must have a 'type' (e.g., 'dealStageChanged', 'ticketCreated') and optional properties like 'toStageId' or 'priority'.
- 'workflow.actions': An array of objects, each with a 'type' (e.g., 'createTask', 'wait') and properties like 'taskTitle' or 'days'.

Example for 'workflow':
"workflow": {
  "trigger": { "type": "dealStageChanged", "toStageId": "stage_2" },
  "actions": [{ "type": "wait", "days": 7 }, { "type": "createTask", "taskTitle": "High-value deal stalled: {{deal.name}}" }]
}

Analyze the data and return 1-2 distinct insights in the specified JSON format.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            insights: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        observation: { type: Type.STRING },
                                        suggestion: { type: Type.STRING },
                                        workflow: {
                                            type: Type.OBJECT,
                                            properties: {
                                                trigger: {
                                                    type: Type.OBJECT,
                                                    properties: {
                                                        type: { type: Type.STRING },
                                                        fromStatus: { type: Type.STRING, nullable: true },
                                                        toStatus: { type: Type.STRING, nullable: true },
                                                        fromStageId: { type: Type.STRING, nullable: true },
                                                        toStageId: { type: Type.STRING, nullable: true },
                                                        priority: { type: Type.STRING, nullable: true }
                                                    },
                                                    required: ['type']
                                                },
                                                actions: {
                                                    type: Type.ARRAY,
                                                    items: {
                                                        type: Type.OBJECT,
                                                        properties: {
                                                            type: { type: Type.STRING },
                                                            taskTitle: { type: Type.STRING, nullable: true },
                                                            assigneeId: { type: Type.STRING, nullable: true },
                                                            emailTemplateId: { type: Type.STRING, nullable: true },
                                                            fieldId: { type: Type.STRING, nullable: true },
                                                            newValue: { type: Type.STRING, nullable: true },
                                                            days: { type: Type.INTEGER, nullable: true },
                                                            webhookUrl: { type: Type.STRING, nullable: true },
                                                            payloadTemplate: { type: Type.STRING, nullable: true },
                                                            surveyId: { type: Type.STRING, nullable: true }
                                                        },
                                                        required: ['type']
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            // The model can sometimes wrap the JSON in markdown even with the JSON response type.
            // Robustly clean the response before parsing.
            let jsonText = response.text.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.substring(7, jsonText.length - 3).trim();
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.substring(3, jsonText.length - 3).trim();
            }

            try {
                const result = JSON.parse(jsonText);
                setAnalysisResult(result.insights || []);
            } catch (parseError) {
                console.error("AI Process Analysis Error - Failed to parse JSON:", parseError);
                console.error("Raw AI response:", jsonText); // Log raw text for better debugging
                toast.error("AI returned an invalid format. Please try again.");
            }

        } catch (error) {
            console.error("AI Process Analysis Error:", error);
            toast.error("Failed to analyze processes. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wand2 size={20} className="text-primary" /> AI Process Optimization</CardTitle>
            </CardHeader>
            <CardContent>
                {isAnalyzing ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader size={24} className="animate-spin text-primary" />
                        <p className="ml-3">Analyzing your deal & ticket history...</p>
                    </div>
                ) : analysisResult ? (
                    analysisResult.length > 0 ? (
                        <div className="space-y-4">
                            {analysisResult.map((insight, index) => (
                                <div key={index} className="p-3 bg-hover-bg rounded-lg">
                                    <p className="font-semibold text-sm">Observation: <span className="font-normal text-text-secondary">{insight.observation}</span></p>
                                    <p className="font-semibold text-sm mt-1">Suggestion: <span className="font-normal text-text-secondary">{insight.suggestion}</span></p>
                                    <div className="text-right mt-2">
                                        <Button size="sm" variant="secondary" onClick={() => onSuggest(insight)} rightIcon={<ArrowRight size={14}/>}>Create Workflow</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p>No specific bottlenecks found to suggest automations for at this time. Your processes look efficient!</p>
                ) : (
                    <>
                        <p className="text-sm text-text-secondary mb-4">Let our AI analyze your process history to find bottlenecks and suggest helpful automations.</p>
                        <Button onClick={handleAnalyze} disabled={isDataLoading}>
                            {isDataLoading ? 'Loading data...' : 'Analyze with AI'}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};


const WorkflowsPage: React.FC<WorkflowsPageProps> = ({ isTabbedView = false }) => {
    const { 
        workflowsQuery, 
        advancedWorkflowsQuery,
        deleteAdvancedWorkflowMutation
    } = useData();
    const { isFeatureEnabled } = useApp();
    const { data: workflows = [], isLoading: simpleLoading } = workflowsQuery;
    const { data: advancedWorkflows = [], isLoading: advancedLoading } = advancedWorkflowsQuery;

    const [view, setView] = useState<'list' | 'builder' | 'advanced'>('list');
    const [selectedItem, setSelectedItem] = useState<Partial<Workflow> | Partial<AdvancedWorkflow> | null>(null);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);

    const allWorkflows = useMemo(() => {
        const simple = (workflows || []).map(w => ({ ...w, workflowType: 'Simple' as const }));
        const advanced = (advancedWorkflows || []).map(w => ({ ...w, workflowType: 'Advanced' as const }));
        return [...simple, ...advanced];
    }, [workflows, advancedWorkflows]);

    const handleEdit = (item: (Workflow | AdvancedWorkflow) & { workflowType: string }) => {
        setSelectedItem(item);
        if (item.workflowType === 'Advanced') {
            setView('advanced');
        } else {
            setView('builder');
        }
    };

    const handleNewSimple = () => {
        setSelectedItem(null);
        setView('builder');
    };
    
    const handleSuggestWorkflow = (insight: ProcessInsight) => {
        setSelectedItem({
            name: `AI: ${insight.observation.substring(0, 40)}...`,
            isActive: true,
            trigger: insight.workflow.trigger,
            actions: insight.workflow.actions,
        });
        setView('builder');
    };

    const handleNewAdvanced = () => {
        setSelectedItem(null);
        setView('advanced');
    };
    
    const handleCloseBuilder = () => {
        setView('list');
        setSelectedItem(null);
    };

    const handleDelete = (item: (Workflow | AdvancedWorkflow) & { workflowType: string }) => {
        if (item.workflowType === 'Advanced') {
            if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                deleteAdvancedWorkflowMutation.mutate(item.id);
            }
        } else {
            toast.error("Deletion for simple workflows is not yet implemented.");
        }
    };

    const isLoading = simpleLoading || advancedLoading;

    if (view === 'builder') {
        return <WorkflowBuilder workflow={selectedItem as Workflow | null} onClose={handleCloseBuilder} />;
    }

    if (view === 'advanced') {
        return <AdvancedWorkflowBuilder workflow={selectedItem as AdvancedWorkflow | null} onClose={handleCloseBuilder} />;
    }

    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-text-heading">Workflows</h1>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsTestModalOpen(true)} leftIcon={<TestTube2 size={16}/>} variant="secondary">
                            Test Triggers
                        </Button>
                        <Button onClick={handleNewAdvanced} leftIcon={<Code size={16}/>} variant="secondary">
                            New Advanced Workflow
                        </Button>
                        <Button onClick={handleNewSimple} leftIcon={<Plus size={16} />}>
                            New Simple Workflow
                        </Button>
                    </div>
                </div>
            )}

            {isFeatureEnabled('aiProcessOptimization') && (
                <AiProcessOptimizationCard onSuggest={handleSuggestWorkflow} />
            )}

            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading workflows...</div>
                ) : allWorkflows.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Name</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Type</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Trigger</th>
                                    <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {allWorkflows.map((w) => (
                                    <tr key={w.id} className="border-b border-border-subtle hover:bg-hover-bg">
                                        <td className="px-6 py-4 font-medium text-text-primary">{w.name}</td>
                                        <td className="px-6 py-4">
                                             <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${
                                                'nodes' in w ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                            }`}>
                                                {w.workflowType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${
                                                w.isActive ? 'bg-success/10 text-success' : 'bg-slate-400/10 text-text-secondary'
                                            }`}>
                                                {w.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{w.workflowType === 'Simple' && w.trigger?.type ? w.trigger.type : ('nodes' in w && w.nodes.find(n => n.type === 'trigger')?.data.label)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="secondary" onClick={() => handleEdit(w)}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(w)} disabled={deleteAdvancedWorkflowMutation.isPending}>
                                                    <Trash2 size={14}/>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-secondary">
                        <Zap className="mx-auto h-16 w-16 text-text-secondary/50" />
                        <h2 className="mt-4 text-lg font-semibold text-text-primary">No Workflows Created Yet</h2>
                        <p className="mt-2 text-sm">Automate your processes by creating a new workflow.</p>
                         <Button onClick={handleNewSimple} leftIcon={<Plus size={16} />} className="mt-4">
                            Create First Workflow
                        </Button>
                    </div>
                )}
            </Card>
            <WorkflowTestModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
        </>
    );

    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>
    }
    
    return <PageWrapper>{pageContent}</PageWrapper>;
};

export default WorkflowsPage;