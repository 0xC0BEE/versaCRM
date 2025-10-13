import React from 'react';
import { Project, ProjectPhase } from '../../types';
import ProjectCard from './ProjectCard';

interface ProjectColumnProps {
    phase: ProjectPhase;
    projects: Project[];
    onCardClick: (project: Project) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, projectId: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, phaseId: string) => void;
}

const ProjectColumn: React.FC<ProjectColumnProps> = ({ phase, projects, onCardClick, onDragStart, onDrop }) => {
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div 
            className="w-72 flex-shrink-0 bg-hover-bg rounded-lg p-3"
            onDrop={(e) => onDrop(e, phase.id)}
            onDragOver={handleDragOver}
        >
            <div className="px-1 mb-3">
                <h3 className="font-semibold text-text-primary">{phase.name} ({projects.length})</h3>
            </div>
            <div className="space-y-3 h-full overflow-y-auto">
                {projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onDragStart={onDragStart}
                        onClick={onCardClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProjectColumn;