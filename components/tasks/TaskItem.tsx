import React from 'react';
// FIX: Corrected import path for types.
import { Task } from '../../types';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import { Trash2 } from 'lucide-react';
import { format, isPast } from 'date-fns';

interface TaskItemProps {
    task: Task;
    animationDelay?: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, animationDelay = 0 }) => {
    const { updateTaskMutation, deleteTaskMutation } = useData();

    const handleToggleComplete = () => {
        updateTaskMutation.mutate({ ...task, isCompleted: !task.isCompleted });
    };

    const handleDelete = () => {
        // This now correctly triggers a confirmation before deleting.
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
                <p className={`text-sm ${isOverdue ? 'text-error' : 'text-text-secondary'}`}>
                    Due {format(new Date(task.dueDate), 'MMM d')}
                </p>
            </div>
            <button 
                onClick={handleDelete} 
                className="p-1 text-text-secondary hover:text-error rounded-full hover:bg-hover-bg disabled:opacity-50"
                disabled={deleteTaskMutation.isPending}
                aria-label={`Delete task: ${task.title}`}
            >
                {/* FIX: Added pointer-events-none to ensure the button's onClick is always captured. */}
                <Trash2 size={16} className="pointer-events-none" />
            </button>
        </div>
    );
};

export default TaskItem;
