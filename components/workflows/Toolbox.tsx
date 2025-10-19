import React, { useState } from 'react';
import { Send, CheckSquare, Clock, GitFork, Edit, ClipboardCheck, UserCheck, Wand2, Loader, ArrowRight } from 'lucide-react';
import { NodeExecutionType, WorkflowNodeType, ProcessInsight, Deal, Ticket, DealStage } from '../../types';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import { GoogleGenAI, Type } from '@google/genai';
import toast from 'react-hot-toast';
import { differenceInDays } from 'date-fns';
import { useApp } from '../../contexts/AppContext';

interface DraggableNodeProps {
  type: WorkflowNodeType;
  nodeType: NodeExecutionType;
  label: string;
  icon: React.ReactNode;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ type, nodeType, label, icon }) => {
  const onDragStart = (event: React.DragEvent) => {
    const data = JSON.stringify({ type, nodeType, label });
    event.dataTransfer.setData('application/reactflow', data);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="p-3 mb-2 border border-border-subtle rounded-md bg-hover-bg cursor-grab flex items-center hover:border-primary/50 transition-colors"
    >
      {icon}
      <span className="ml-2 text-sm font-medium text-text-primary">{label}</span>
    </div>
  );
};


const actionNodes: Omit<DraggableNodeProps, 'type'>[] = [
    { nodeType: 'sendEmail', label: 'Send Email', icon: <Send size={16} className="text-primary"/> },
    { nodeType: 'createTask', label: 'Create Task', icon: <CheckSquare size={16} className="text-success"/> },
    { nodeType: 'updateContactField', label: 'Update Contact Field', icon: <Edit size={16} className="text-indigo-500"/> },
    { nodeType: 'wait', label: 'Wait', icon: <Clock size={16} className="text-warning"/> },
    { nodeType: 'sendSurvey', label: 'Send Survey', icon: <ClipboardCheck size={16} className="text-teal-500"/> },
];

const logicNodes: Omit<DraggableNodeProps, 'type'>[] = [
    { nodeType: 'ifCondition', label: 'If/Then Condition', icon: <GitFork size={16} className="text-purple-500"/> },
]

const approvalNodes: Omit<DraggableNodeProps, 'type'>[] = [
    { nodeType: 'approval', label: 'Request Approval', icon: <UserCheck size={16} className="text-orange-500"/> },
]

const AiProcessOptimization: React.FC<{ onSuggest: (insight: ProcessInsight) => void }> = ({ onSuggest }) => {
    const [analysisResult, setAnalysisResult] = useState<ProcessInsight[] | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { dealsQuery, ticketsQuery, dealStagesQuery } = useData();
    
    const isDataLoading = dealsQuery.isLoading || ticketsQuery.isLoading || dealStagesQuery.isLoading;

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);

        const deals = dealsQuery.data as Deal[] || [];
        const tickets = ticketsQuery.data as Ticket[] || [];
        const dealStages = dealStagesQuery.data as DealStage[] || [];

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const dealJourneys = deals.map(deal => ({
                stage: dealStages.find(s => s.id === deal.stageId)?.name || 'Unknown',
                durationDays: differenceInDays(new Date(), new Date(deal.createdAt)),
                value: deal.value,
            }));
            const ticketSummary = tickets.reduce((acc: Record<string, number>, ticket) => {
                acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
                return acc;
            }, {});
            const stageSummary = dealStages.map(s => ({ id: s.id, name: s.name }));

            const prompt = `You are a CRM process optimization expert. Analyze this summary of deal and ticket data to find bottlenecks and suggest simple workflow automations.

Data:
- Deal Journeys: ${JSON.stringify(dealJourneys.slice(0, 10))}
- Ticket Summary: ${JSON.stringify(ticketSummary)}
- Available Deal Stages: ${JSON.stringify(stageSummary)}

Your response MUST be a JSON object containing an array called 'insights'. Each object in the array should have:
1. 'observation': A string describing a potential bottleneck.
2. 'suggestion': A string suggesting a workflow.
3. 'workflow': An object with 'nodes' and 'edges' keys, structured for a React Flow canvas. For example, a "wait" and "create task" sequence.
   - The 'trigger' node MUST have the id '1' and type 'trigger'.
   - The 'nodes' should be an array of objects with 'id', 'type', 'position', and 'data' ({ label, nodeType, etc. }).
   - The 'edges' should be an array of objects with 'id', 'source', and 'target'.

Analyze the data and return 1-2 distinct insights in the specified JSON format.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            let jsonText = response.text.trim().replace(/^```json/, '').replace(/```$/, '').trim();
            const result = JSON.parse(jsonText);
            setAnalysisResult(result.insights || []);
        } catch (error) {
            console.error("AI Process Analysis Error:", error);
            toast.error("Failed to analyze processes. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    return (
         <div className="mb-4 p-3 border border-border-subtle rounded-md bg-card-bg">
            <h4 className="font-semibold text-text-primary flex items-center gap-2"><Wand2 size={16} className="text-primary" /> AI Suggestions</h4>
             {isAnalyzing ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader size={18} className="animate-spin text-primary" />
                        <p className="ml-2 text-sm">Analyzing...</p>
                    </div>
                ) : analysisResult ? (
                    analysisResult.length > 0 ? (
                        <div className="space-y-2 mt-2">
                            {analysisResult.map((insight, index) => (
                                <div key={index} className="p-2 bg-hover-bg rounded-lg">
                                    <p className="text-xs text-text-secondary">{insight.observation}</p>
                                    <div className="text-right mt-1">
                                        <Button size="sm" variant="secondary" onClick={() => onSuggest(insight)} rightIcon={<ArrowRight size={14}/>}>Use Suggestion</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-xs text-text-secondary mt-2">No specific bottlenecks found to suggest automations for.</p>
                ) : (
                    <>
                        <p className="text-xs text-text-secondary mt-2">Find bottlenecks and get workflow suggestions.</p>
                        <Button size="sm" onClick={handleAnalyze} disabled={isDataLoading} className="w-full mt-2">
                            {isDataLoading ? 'Loading data...' : 'Analyze with AI'}
                        </Button>
                    </>
                )}
        </div>
    );
};


const Toolbox: React.FC<{ onSuggest: (insight: ProcessInsight) => void }> = ({ onSuggest }) => {
  const { isFeatureEnabled } = useApp();

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-heading mb-4">Toolbox</h3>
      
      {isFeatureEnabled('aiProcessOptimization') && <AiProcessOptimization onSuggest={onSuggest} />}

      <div className="mb-4">
        <p className="text-sm font-semibold text-text-secondary mb-2">Actions</p>
        {actionNodes.map(node => (
            <DraggableNode key={node.nodeType} type="action" {...node} />
        ))}
      </div>

       <div className="mb-4">
        <p className="text-sm font-semibold text-text-secondary mb-2">Approvals</p>
         {approvalNodes.map(node => (
            <DraggableNode key={node.nodeType} type="approval" {...node} />
        ))}
      </div>

       <div>
        <p className="text-sm font-semibold text-text-secondary mb-2">Logic</p>
         {logicNodes.map(node => (
            <DraggableNode key={node.nodeType} type="condition" {...node} />
        ))}
      </div>

      <p className="text-xs text-text-secondary mt-6">Drag a node onto the canvas to add it to your workflow.</p>
    </div>
  );
};

export default Toolbox;
