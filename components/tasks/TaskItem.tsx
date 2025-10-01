import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { Task } from '../../types';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
import { Trash2 } from 'lucide-react';
import { format, isPast } from 'date-fns';

interface TaskItemProps {
    task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
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
        <div className={`flex items-center p-3 rounded-md transition-colors duration-200 ${task.isCompleted ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-dark-card border dark:border-dark-border'}`}>
            <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={handleToggleComplete}
                className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={updateTaskMutation.isPending}
            />
            <div className="ml-3 flex-grow">
                <p className={`text-sm font-medium ${task.isCompleted ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                </p>
                <p className={`text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    Due {format(new Date(task.dueDate), 'MMM d')}
                </p>
            </div>
            <button 
                onClick={handleDelete} 
                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
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