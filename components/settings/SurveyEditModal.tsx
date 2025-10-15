import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import { Survey } from '../../types';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';

interface SurveyEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    survey: Survey | null;
}

const SurveyEditModal: React.FC<SurveyEditModalProps> = ({ isOpen, onClose, survey }) => {
    const { createSurveyMutation, updateSurveyMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !survey;

    const initialState = useMemo(() => ({
        name: '',
        type: 'CSAT' as Survey['type'],
        question: '',
    }), []);
    
    const { formData, handleChange } = useForm(initialState, survey);

    const handleSave = () => {
        if (!formData.name.trim() || !formData.question.trim()) {
            toast.error("Name and Question are required.");
            return;
        }

        if (isNew) {
            createSurveyMutation.mutate({
                ...formData,
                organizationId: authenticatedUser!.organizationId!,
            }, {
                onSuccess: () => onClose()
            });
        } else {
            updateSurveyMutation.mutate({
                ...survey!,
                ...formData,
            }, {
                onSuccess: () => onClose()
            });
        }
    };

    const isPending = createSurveyMutation.isPending || updateSurveyMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Survey' : `Edit Survey: ${survey?.name}`} size="lg">
            <div className="space-y-4">
                <Input
                    id="survey-name"
                    label="Survey Name (for internal use)"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g., Post-Ticket CSAT"
                    required
                    disabled={isPending}
                />
                 <Select
                    id="survey-type"
                    label="Survey Type"
                    value={formData.type}
                    onChange={e => handleChange('type', e.target.value as Survey['type'])}
                    disabled={isPending}
                >
                    <option value="CSAT">CSAT (Customer Satisfaction)</option>
                    <option value="NPS">NPS (Net Promoter Score)</option>
                </Select>
                <Textarea
                    id="survey-question"
                    label="Question"
                    value={formData.question}
                    onChange={e => handleChange('question', e.target.value)}
                    rows={3}
                    required
                    disabled={isPending}
                    placeholder={formData.type === 'CSAT' ? 'e.g., How satisfied were you with our support?' : 'e.g., How likely are you to recommend us?'}
                />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Survey'}
                </Button>
            </div>
        </Modal>
    );
};

export default SurveyEditModal;