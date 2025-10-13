import React, { useMemo } from 'react';
import { Project, AnyContact } from '../../types';
import { useData } from '../../contexts/DataContext';
import { FolderKanban } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, projectId: string) => void;
    onClick: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDragStart, onClick }) => {
    const { contactsQuery } = useData();
    const { data: contacts = [] } = contactsQuery;

    const contactName = useMemo(() => {
        const contact = (contacts as AnyContact[]).find(c => c.id === project.contactId);
        return contact ? contact.contactName : 'Unknown Contact';
    }, [contacts, project.contactId]);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, project.id)}
            onClick={() => onClick(project)}
            className="p-3 bg-card-bg rounded-lg border border-border-subtle shadow-sm-new cursor-pointer hover:shadow-md-new hover:border-primary/50 transition-all mb-3"
        >
            <h4 className="font-semibold text-sm text-text-primary truncate">{project.name}</h4>
            <p className="text-xs text-text-secondary mt-1">{contactName}</p>
            <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-text-secondary">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                </p>
                <FolderKanban size={14} className="text-text-secondary" />
            </div>
        </div>
    );
};

export default ProjectCard;