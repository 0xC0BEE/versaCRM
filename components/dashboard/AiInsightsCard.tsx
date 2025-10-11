import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
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
                <div className="h-full animate-pulse bg-hover-bg rounded-md"></div>
            </Card>
        );
    }


    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center">
                        <Bot size={20} className="mr-2 text-primary" />
                        AI Insights
                    </CardTitle>
                    <CardDescription>Let Gemini analyze your current dashboard data.</CardDescription>
                </div>
                <Button 
                    onClick={generateInsight} 
                    disabled={isGenerating} 
                    size="sm"
                >
                    {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-start">
                 <div className="p-4 w-full h-full bg-bg-primary rounded-lg flex items-center justify-start">
                    {isGenerating ? (
                        <div className="flex items-center space-x-2 text-text-secondary">
                            <Loader size={20} className="animate-spin" />
                            <span>Analyzing data...</span>
                        </div>
                    ) : insight ? (
                        <p className="text-sm whitespace-pre-wrap text-left">{insight}</p>
                    ) : (
                        <p className="text-sm text-text-secondary text-left">Click "Generate" to see what's happening.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default AiInsightsCard;