import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Survey } from '../../types';
import SurveyEditModal from './SurveyEditModal';

const SurveySettings: React.FC = () => {
    const { surveysQuery, deleteSurveyMutation } = useData();
    const { data: surveys = [], isLoading } = surveysQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

    const handleEdit = (survey: Survey) => {
        setSelectedSurvey(survey);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedSurvey(null);
        setIsModalOpen(true);
    };

    const handleDelete = (surveyId: string) => {
        if (window.confirm("Are you sure you want to delete this survey?")) {
            deleteSurveyMutation.mutate(surveyId);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Surveys</h3>
                    <p className="text-sm text-text-secondary">Manage CSAT and NPS surveys to gather customer feedback.</p>
                </div>
                <Button size="sm" onClick={handleAdd} leftIcon={<Plus size={14} />}>
                    New Survey
                </Button>
            </div>

            {isLoading ? (
                <p>Loading surveys...</p>
            ) : (
                <div className="space-y-3">
                    {surveys.length > 0 ? (
                        (surveys as Survey[]).map((survey: Survey) => (
                            <div key={survey.id} className="p-3 border border-border-subtle rounded-md bg-card-bg/50 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{survey.name} <span className="text-xs font-semibold px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary">{survey.type}</span></p>
                                    <p className="text-xs text-text-secondary truncate">Question: "{survey.question}"</p>
                                </div>
                                <div className="space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(survey)} leftIcon={<Edit size={14} />}>Edit</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(survey.id)} leftIcon={<Trash2 size={14} />} disabled={deleteSurveyMutation.isPending}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-text-secondary py-4">No surveys found.</p>
                    )}
                </div>
            )}

            <SurveyEditModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                survey={selectedSurvey}
            />
        </div>
    );
};

export default SurveySettings;