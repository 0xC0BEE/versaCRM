import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Lightbulb, ArrowRight, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { AiTip } from '../../types';

const AiTipCard: React.FC = () => {
    const { activeAiTip, setActiveAiTip, setCurrentPage } = useApp();

    if (!activeAiTip) {
        return null;
    }

    const handleAction = () => {
        if (activeAiTip.action.type === 'navigate') {
            setCurrentPage(activeAiTip.action.page);
        }
        // Dismiss the tip after taking action
        setActiveAiTip(null);
    };

    const handleDismiss = () => {
        setActiveAiTip(null);
    };

    return (
        <Card className="mb-6 bg-primary/5 border-primary/20 animate-fade-in-up">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-primary">Pro Tip</h4>
                        <p className="text-sm text-text-secondary">{activeAiTip.suggestion}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <Button size="sm" onClick={handleAction} rightIcon={<ArrowRight size={14} />}>
                        Take Action
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleDismiss} aria-label="Dismiss tip">
                        <X size={16} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AiTipCard;
