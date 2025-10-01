import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { EmailTemplate } from '../../types';
import EmailTemplateEditModal from './EmailTemplateEditModal';

const EmailTemplates: React.FC = () => {
    const { emailTemplatesQuery, deleteEmailTemplateMutation } = useData();
    const { data: templates = [], isLoading } = emailTemplatesQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

    const handleEdit = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedTemplate(null);
        setIsModalOpen(true);
    };

    const handleDelete = (templateId: string) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            deleteEmailTemplateMutation.mutate(templateId);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Email Templates</h3>
                    <p className="text-sm text-gray-500">Manage templates for automated and manual emails.</p>
                </div>
                <Button size="sm" onClick={handleAdd} leftIcon={<Plus size={14} />}>
                    New Template
                </Button>
            </div>

            {isLoading ? (
                <p>Loading templates...</p>
            ) : (
                <div className="space-y-3">
                    {templates.length > 0 ? (
                        templates.map((template: EmailTemplate) => (
                            <div key={template.id} className="p-3 border dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{template.name}</p>
                                    <p className="text-xs text-gray-500">Subject: {template.subject}</p>
                                </div>
                                <div className="space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(template)} leftIcon={<Edit size={14} />}>Edit</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(template.id)} leftIcon={<Trash2 size={14} />} disabled={deleteEmailTemplateMutation.isPending}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 py-4">No email templates found.</p>
                    )}
                </div>
            )}

            <EmailTemplateEditModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                template={selectedTemplate}
            />
        </div>
    );
};

export default EmailTemplates;
