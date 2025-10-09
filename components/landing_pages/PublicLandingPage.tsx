import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { LandingPage, PublicForm } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

const PublicLandingPage: React.FC = () => {
    const [slug, setSlug] = useState('');
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const { formsQuery, submitPublicFormMutation, trackPageViewMutation } = useData();
    const { data: forms = [] } = formsQuery;

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            const slugFromHash = hash.substring(2); // Remove '#/'
            setSlug(slugFromHash);
        }
        handleHashChange(); // Initial load
        window.addEventListener('hashchange', handleHashChange);
        
        // Simulate tracking script
        const sessionId = localStorage.getItem('versa_session_id') || `anon_session_${Date.now()}`;
        localStorage.setItem('versa_session_id', sessionId);
        trackPageViewMutation.mutate({ sessionId, orgId: 'org_1', url: window.location.href });

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const { data: page, isLoading, isError } = useQuery<LandingPage | null>({
        queryKey: ['publicLandingPage', slug],
        queryFn: () => apiClient.getLandingPageBySlug(slug),
        enabled: !!slug,
    });

    const formComponent = page?.content.find(c => c.type === 'form');
    const formConfig = formComponent ? (forms as PublicForm[]).find((f: PublicForm) => f.id === (formComponent.content as any).formId) : null;

    const handleChange = (id: string, value: any) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formConfig) return;

        for (const field of formConfig.fields) {
            if (field.required && !formData[field.id.split('.').pop()!]) {
                toast.error(`Field "${field.label}" is required.`);
                return;
            }
        }

        const sessionId = localStorage.getItem('versa_session_id');
        submitPublicFormMutation.mutate({ formId: formConfig.id, submissionData: formData, sessionId }, {
            onSuccess: () => {
                setIsSubmitted(true);
                localStorage.removeItem('versa_session_id'); // Clear session on conversion
            }
        });
    };

    const renderField = (field: typeof formConfig.fields[0]) => {
         const fieldId = field.id.split('.').pop()!;
         const props = {
            key: field.id, id: field.id, label: field.label, value: formData[fieldId] || '',
            onChange: (e: React.ChangeEvent<any>) => handleChange(fieldId, e.target.value),
            required: field.required,
            placeholder: field.placeholder,
        };
        switch (field.type) {
            case 'textarea': return <Textarea {...props} />;
            case 'select': return (
                <Select {...props}>
                    <option value="">-- Select --</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
            );
            default: return <Input {...props} type={field.type} />;
        }
    }

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading page...</div>;
    if (isError || !page) return <div className="min-h-screen flex items-center justify-center"><h1>404 - Page Not Found</h1></div>;

    return (
        <div style={{ backgroundColor: page.style.backgroundColor, color: page.style.textColor }} className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto">
                {page.content.map(comp => {
                    switch(comp.type) {
                        case 'header': return (
                            <div key={comp.id} className="text-center my-12">
                                <h1 className="text-4xl font-bold">{comp.content.title}</h1>
                                <p className="text-xl mt-2 opacity-80">{comp.content.subtitle}</p>
                            </div>
                        );
                        case 'text': return <p key={comp.id} className="my-6 whitespace-pre-wrap leading-relaxed">{comp.content.text}</p>;
                        case 'image': return <img key={comp.id} src={comp.content.src} alt={comp.content.alt} className="w-full h-auto my-6 rounded-lg" />;
                        case 'form': 
                            if (!formConfig) return <div key={comp.id} className="my-6 p-8 text-center bg-red-100 text-red-700 rounded-lg">Form not found or configured incorrectly.</div>;
                            return (
                                <div key={comp.id} className="my-12 p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl text-black">
                                    {isSubmitted ? (
                                        <div className="text-center py-8">
                                            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                                            <p className="mt-4">{formConfig.actions.successMessage}</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {formConfig.fields.map(field => renderField(field))}
                                            <Button type="submit" style={{backgroundColor: formConfig.style.buttonColor}} className="w-full">
                                                {formConfig.style.buttonText}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            );
                        default: return null;
                    }
                })}
            </div>
        </div>
    );
};

export default PublicLandingPage;