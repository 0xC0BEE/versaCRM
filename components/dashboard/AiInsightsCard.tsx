import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Bot, Loader } from 'lucide-react';
import { DashboardData } from '../../types';
import toast from 'react-hot-toast';

interface AiInsightsCardProps {
    dashboardData: DashboardData | undefined;
    isLoading: boolean;
}

const AiInsightsCard: React.FC<AiInsightsCardProps> = ({ dashboardData, isLoading: isDataLoading }) => {
    const [insight, setInsight] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateInsight = async () => {
        if (!dashboardData) {
            toast.error("Dashboard data is not available yet.");
            return;
        }
        setIsGenerating(true);
        setInsight('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const prompt = `Analyze the following CRM dashboard data and provide a concise, actionable insight for an organization admin. Data: ${JSON.stringify(dashboardData.kpis)}`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setInsight(response.text);
        } catch (error) {
            console.error("AI Insight Generation Error:", error);
            toast.error("Failed to generate AI insight.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (isDataLoading) {
        return (
             <Card className="h-full">
                <div className="h-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            </Card>
        );
    }


    return (
        <Card className="h-full">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-base font-semibold flex items-center">
                            <Bot size={20} className="mr-2 text-primary" />
                            AI Insights
                        </h3>
                        <p className="text-sm text-text-secondary">Let Gemini analyze your current dashboard data.</p>
                    </div>
                    <Button onClick={generateInsight} disabled={isGenerating} size="sm">
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                </div>
                <div className="mt-4 p-4 flex-grow bg-bg-primary rounded-lg flex items-center justify-center">
                    {isGenerating ? (
                        <div className="flex items-center space-x-2 text-text-secondary">
                            <Loader size={20} className="animate-spin" />
                            <span>Analyzing data...</span>
                        </div>
                    ) : insight ? (
                        <p className="text-sm whitespace-pre-wrap">{insight}</p>
                    ) : (
                        <p className="text-sm text-text-secondary text-center">Click "Generate" to see what's happening.</p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default AiInsightsCard;