import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { useData } from '../../contexts/DataContext';
import { Project, ProjectPhase } from '../../types';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import ProjectColumn from './ProjectColumn';
import ProjectEditModal from './ProjectEditModal';
import ProjectWorkspace from './ProjectWorkspace';
import { useApp } from '../../contexts/AppContext';

const ProjectsPage: React.FC = () => {
    const { projectsQuery, projectPhasesQuery, updateProjectMutation } = useData();
    const { initialRecordLink, setInitialRecordLink } = useApp();
    const { data: projects = [], isLoading: projectsLoading } = projectsQuery;
    const { data: phases = [], isLoading: phasesLoading } = projectPhasesQuery;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);

    const sortedPhases = useMemo(() => {
        return (phases as ProjectPhase[]).sort((a, b) => a.order - b.order);
    }, [phases]);
    
    useEffect(() => {
        if (initialRecordLink?.page === 'Projects' && initialRecordLink.recordId) {
            setViewingProjectId(initialRecordLink.recordId);
            setInitialRecordLink(null);
        }
    }, [initialRecordLink, setInitialRecordLink]);

    const handleAdd = () => {
        setIsCreateModalOpen(true);
    };

    const handleCardClick = (project: Project) => {
        setViewingProjectId(project.id);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, projectId: string) => {
        e.dataTransfer.setData('projectId', projectId);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, phaseId: string) => {
        e.preventDefault();
        const projectId = e.dataTransfer.getData('projectId');
        const projectToMove = (projects as Project[]).find(p => p.id === projectId);
        if (projectToMove && projectToMove.phaseId !== phaseId) {
            updateProjectMutation.mutate({ ...projectToMove, phaseId });
        }
    };

    const isLoading = projectsLoading || phasesLoading;

    if (viewingProjectId) {
        return <ProjectWorkspace projectId={viewingProjectId} onBack={() => setViewingProjectId(null)} />;
    }

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Projects</h1>
                <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                    New Project
                </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:overflow-x-auto pb-4">
                {isLoading ? (
                    <p>Loading projects...</p>
                ) : (
                    sortedPhases.map(phase => (
                        <ProjectColumn
                            key={phase.id}
                            phase={phase}
                            projects={(projects as Project[]).filter(p => p.phaseId === phase.id)}
                            onCardClick={handleCardClick}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                        />
                    ))
                )}
            </div>

            <ProjectEditModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                project={null}
            />
        </PageWrapper>
    );
};

export default ProjectsPage;