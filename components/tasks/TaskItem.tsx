import React from 'react';
import { Task } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface TaskItemProps {
    task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
    const { updateTaskMutation, deleteTaskMutation } = useData();

    const handleToggle = () => {
        updateTaskMutation.mutate(
            { ...task, isCompleted: !task.isCompleted },
            {
                onSuccess: () => toast.success(`Task ${task.isCompleted ? 'marked as pending' : 'completed'}!`),
                onError: () => toast.error('Failed to update task.'),
            }
        );
    };
    
    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
            deleteTaskMutation.mutate(task.id, {
                onSuccess: () => toast.success('Task deleted.'),
                onError: () => toast.error('Failed to delete task.'),
            });
        }
    };

    return (
        <div className={`flex items-center p-3 rounded-md transition-colors ${task.isCompleted ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-dark-card border dark:border-dark-border'}`}>
            <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={handleToggle}
                className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="ml-3 flex-grow">
                <p className={`text-sm font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                </p>
                <p className="text-xs text-gray-500">
                    Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                </p>
            </div>
            <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-500"
                disabled={deleteTaskMutation.isPending}
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
};

export default TaskItem;
