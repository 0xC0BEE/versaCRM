import React, { useMemo } from 'react';
import { Project, ProjectPhase, AnyContact, User } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

interface ProjectEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({ isOpen, onClose, project }) => {
    const { 
        contactsQuery, 
        teamMembersQuery, 
        projectPhasesQuery, 
        createProjectMutation,
        updateProjectMutation,
        deleteProjectMutation
    } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !project;

    const { data: contacts = [] } = contactsQuery;
    const { data: teamMembers = [] } = teamMembersQuery;
    const { data: projectPhases = [] } = projectPhasesQuery;

    const initialState = useMemo(() => ({
        name: '',
        contactId: '',
        phaseId: (projectPhases as ProjectPhase[])[0]?.id || '',
        assignedToId: '',
    }), [projectPhases]);
    
    // FIX: Create a memoized dependency to safely handle the optional `assignedToId` property on the `project` prop, ensuring compatibility with the `useForm` hook.
    const formDependency = useMemo(() => {
        if (!project) return null;
        return {
            ...initialState,
            ...project,
            assignedToId: project.assignedToId || '',
        };
    }, [project, initialState]);

    const { formData, handleChange } = useForm(initialState, formDependency);
    
    const handleSave = () => {
        if (!formData.name.trim() || !formData.contactId) {
            toast.error("Project Name and Contact are required.");
            return;
        }

        const projectData = {
            ...formData,
            organizationId: authenticatedUser!.organizationId!,
        };

        if (isNew) {
            createProjectMutation.mutate(projectData as any, { onSuccess: onClose });
        } else {
            updateProjectMutation.mutate({ ...project!, ...projectData }, { onSuccess: onClose });
        }
    };

    const handleDelete = () => {
        if (project && window.confirm(`Are you sure you want to delete the project "${project.name}"?`)) {
            deleteProjectMutation.mutate(project.id, { onSuccess: onClose });
        }
    };
    
    const isPending = createProjectMutation.isPending || updateProjectMutation.isPending || deleteProjectMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Project' : `Edit Project: ${project?.name}`}>
            <div className="space-y-4">
                <Input id="project-name" label="Project Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required disabled={isPending} />
                <Select id="project-contact" label="Contact" value={formData.contactId} onChange={e => handleChange('contactId', e.target.value)} required disabled={isPending}>
                    <option value="">Select a contact...</option>
                    {(contacts as AnyContact[]).map(c => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                </Select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select id="project-phase" label="Phase" value={formData.phaseId} onChange={e => handleChange('phaseId', e.target.value)} required disabled={isPending}>
                        {(projectPhases as ProjectPhase[]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                    <Select id="project-assignee" label="Assigned To" value={formData.assignedToId} onChange={e => handleChange('assignedToId', e.target.value)} disabled={isPending}>
                        <option value="">Unassigned</option>
                        {(teamMembers as User[]).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </Select>
                </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>
                    {!isNew && (
                        <Button variant="danger" onClick={handleDelete} disabled={isPending} leftIcon={<Trash2 size={16} />}>
                            {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Project'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ProjectEditModal;
