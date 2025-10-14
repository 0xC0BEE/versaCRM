import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { Project, ProjectPhase } from '../../../types';
import { FolderKanban, ChevronRight } from 'lucide-react';
import ClientProjectDetailView from './ClientProjectDetailView';

const ClientProjectsTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const { projectsQuery, projectPhasesQuery } = useData();
    const { data: allProjects = [], isLoading: projectsLoading } = projectsQuery;
    const { data: phases = [], isLoading: phasesLoading } = projectPhasesQuery;

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const myProjects = allProjects.filter((p: Project) => p.contactId === authenticatedUser?.contactId);
    const phaseMap = new Map((phases as ProjectPhase[]).map(p => [p.id, p.name]));
    const isLoading = projectsLoading || phasesLoading;

    if (selectedProjectId) {
        const selectedProject = myProjects.find((p: Project) => p.id === selectedProjectId);
        if (selectedProject) {
            return (
                <ClientProjectDetailView
                    project={selectedProject}
                    phaseName={phaseMap.get(selectedProject.phaseId) || 'Unknown'}
                    onBack={() => setSelectedProjectId(null)}
                />
            );
        }
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Your Projects</h3>
            {isLoading ? (
                <p>Loading projects...</p>
            ) : myProjects.length > 0 ? (
                <div className="divide-y divide-border-subtle border border-border-subtle rounded-lg">
                    {myProjects.map((project: Project) => (
                        <div
                            key={project.id}
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-hover-bg"
                            onClick={() => setSelectedProjectId(project.id)}
                        >
                            <div className="flex items-center gap-4">
                                <FolderKanban className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-medium text-text-primary">{project.name}</p>
                                    <p className="text-xs text-text-secondary">
                                        Current Stage: {phaseMap.get(project.phaseId) || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-text-secondary" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-text-secondary">
                    <FolderKanban className="mx-auto h-12 w-12 text-text-secondary/50" />
                    <p className="mt-2">You don't have any active projects with us right now.</p>
                </div>
            )}
        </div>
    );
};

export default ClientProjectsTab;
