import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { Survey } from '../../types';
import { Star, Smile, Frown, Meh, Angry, Laugh, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

const queryClient = new QueryClient();

// A self-contained wrapper to provide react-query to this public page
const PublicSurveyPageWrapper = () => (
    <QueryClientProvider client={queryClient}>
        <PublicSurveyPage />
    </QueryClientProvider>
);

const CSAT_OPTIONS = [
    { score: 1, icon: <Angry size={32} />, label: 'Very Unsatisfied' },
    { score: 2, icon: <Frown size={32} />, label: 'Unsatisfied' },
    { score: 3, icon: <Meh size={32} />, label: 'Neutral' },
    { score: 4, icon: <Smile size={32} />, label: 'Satisfied' },
    { score: 5, icon: <Laugh size={32} />, label: 'Very Satisfied' },
];

const PublicSurveyPage = () => {
    const [surveyId, setSurveyId] = useState<string | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const hash = window.location.hash;
        const idFromHash = hash.substring(hash.lastIndexOf('/') + 1);
        setSurveyId(idFromHash);
    }, []);

    const { data: survey, isLoading, isError } = useQuery<Survey | null>({
        queryKey: ['publicSurvey', surveyId],
        queryFn: () => apiClient.getPublicSurvey(surveyId!),
        enabled: !!surveyId,
    });

    const submitMutation = useMutation({
        mutationFn: (data: { surveyId: string, score: number, comment?: string }) => apiClient.submitSurveyResponse(data),
        onSuccess: () => {
            setIsSubmitted(true);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (score === null || !survey) return;
        submitMutation.mutate({ surveyId: survey.id, score, comment });
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (isError || !survey) {
        return <div className="min-h-screen flex items-center justify-center"><h1>404 - Survey Not Found</h1></div>;
    }
    
    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
                <Card className="w-full max-w-lg text-center">
                    <CardContent className="p-8">
                        <CheckCircle size={48} className="mx-auto text-success mb-4" />
                        <h2 className="text-xl font-semibold">Thank You!</h2>
                        <p className="text-text-secondary mt-2">Your feedback has been submitted successfully.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const renderResponseUI = () => {
        if (survey.type === 'CSAT') {
            return (
                <div className="flex justify-center items-end gap-4">
                    {CSAT_OPTIONS.map(opt => (
                        <button
                            key={opt.score}
                            onClick={() => setScore(opt.score)}
                            className={`flex flex-col items-center gap-2 text-text-secondary transition-transform duration-200 hover:text-primary ${score === opt.score ? 'text-primary scale-110' : 'hover:scale-105'}`}
                        >
                            {React.cloneElement(opt.icon, { className: 'w-10 h-10' })}
                            <span className="text-xs">{opt.label}</span>
                        </button>
                    ))}
                </div>
            );
        }
        if (survey.type === 'NPS') {
            return (
                 <div className="flex flex-wrap justify-center gap-2">
                    {Array.from({ length: 11 }, (_, i) => i).map(num => (
                        <button
                            key={num}
                            onClick={() => setScore(num)}
                            className={`w-10 h-10 rounded-md border text-sm font-semibold transition-colors ${
                                score === num ? 'bg-primary text-white border-primary' : 'bg-card-bg border-border-subtle hover:border-primary'
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            );
        }
        return null;
    };


    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-center">{survey.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="py-4">
                            {renderResponseUI()}
                        </div>
                        <Textarea
                            id="comment"
                            label="Additional Comments (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            placeholder="Tell us more..."
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={score === null || submitMutation.isPending}>
                            {submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default PublicSurveyPageWrapper;