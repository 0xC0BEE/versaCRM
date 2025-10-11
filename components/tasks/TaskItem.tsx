import React, { useMemo } from 'react';
import { Task, CustomObjectDefinition, CustomObjectRecord } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Trash2, Edit, Link } from 'lucide-react';
import { format, isPast } from 'date-fns';
import Button from '../ui/Button';

interface TaskItemProps {
    task: Task;
    animationDelay?: number;
    assigneeName?: string;
    onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, animationDelay = 0, assigneeName, onEdit }) => {
    const { updateTaskMutation, deleteTaskMutation, customObjectDefsQuery } = useData();
    const { data: customObjectDefs = [] } = customObjectDefsQuery;
    
    // Fetch records for the specific definition needed for this task
    const { data: relatedRecords = [] } = useData().customObjectRecordsQuery(task.relatedObjectDefId || null);

    const relatedObjectName = useMemo(() => {
        if (!task.relatedObjectDefId || !task.relatedObjectRecordId) return null;

        const definition = (customObjectDefs as CustomObjectDefinition[]).find(d => d.id === task.relatedObjectDefId);
        if (!definition || definition.fields.length === 0) return null;

        const record = (relatedRecords as CustomObjectRecord[]).find(r => r.id === task.relatedObjectRecordId);
        if (!record) return null;

        const primaryFieldId = definition.fields[0].id;
        return record.fields[primaryFieldId] || 'Unnamed Record';

    }, [task, customObjectDefs, relatedRecords]);

    const handleToggleComplete = () => {
        updateTaskMutation.mutate({ ...task, isCompleted: !task.isCompleted });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            deleteTaskMutation.mutate(task.id);
        }
    };

    const isOverdue = !task.isCompleted && isPast(new Date(task.dueDate));

    return (
        <div 
            className={`flex items-center p-3 rounded-md transition-colors duration-200 animate-fade-in-up ${task.isCompleted ? 'bg-hover-bg' : 'bg-card-bg border border-border-subtle'}`}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={handleToggleComplete}
                className="h-5 w-5 rounded border-border-subtle text-primary focus:ring-primary"
                disabled={updateTaskMutation.isPending}
            />
            <div className="ml-3 flex-grow">
                <p className={`text-sm font-medium ${task.isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                    {task.title}
                </p>
                <div className="flex items-center gap-2 text-xs">
                    <p className={`${isOverdue ? 'text-error' : 'text-text-secondary'}`}>
                        Due {format(new Date(task.dueDate), 'MMM d')}
                    </p>
                    {assigneeName && (
                        <>
                            <span className="text-text-secondary/50">•</span>
                            <p className="text-text-secondary">{assigneeName}</p>
                        </>
                    )}
                    {relatedObjectName && (
                         <>
                            <span className="text-text-secondary/50">•</span>
                            <p className="text-text-secondary flex items-center gap-1"><Link size={12} /> {relatedObjectName}</p>
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task)}>
                     <Edit size={16} className="text-text-secondary hover:text-primary" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handleDelete} 
                    disabled={deleteTaskMutation.isPending}
                    aria-label={`Delete task: ${task.title}`}
                >
                    <Trash2 size={16} className="text-text-secondary hover:text-error" />
                </Button>
            </div>
        </div>
    );
};

export default TaskItem;
