import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
import TaskItem from './TaskItem';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
// FIX: Corrected the import path for types to be a valid relative path.
import { Task } from '../../types';
import { addDays } from 'date-fns';
import toast from 'react-hot-toast';

const MyTasksPage: React.FC = () => {
    const { tasksQuery, createTaskMutation } = useData();
    const { data: tasks = [], isLoading } = tasksQuery;
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) {
            toast.error("Task title cannot be empty.");
            return;
        }

        createTaskMutation.mutate({
            title: newTaskTitle,
            dueDate: addDays(new Date(), 1).toISOString(),
        }, {
            onSuccess: () => {
                setNewTaskTitle('');
            }
        });
    };
    
    const { pendingTasks, completedTasks } = useMemo(() => {
        const pending = tasks.filter((task: Task) => !task.isCompleted).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const completed = tasks.filter((task: Task) => task.isCompleted).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        return { pendingTasks: pending, completedTasks: completed };
    }, [tasks]);

    return (
        <PageWrapper>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">My Tasks</h1>
            <Card>
                <div className="p-4 border-b dark:border-dark-border">
                    <form onSubmit={handleAddTask} className="flex gap-2">
                        <Input 
                            id="new-task"
                            placeholder="Add a new task..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="flex-grow"
                            disabled={createTaskMutation.isPending}
                            inputSize="lg"
                        />
                        <Button size="lg" type="submit" leftIcon={<Plus size={16} />} disabled={createTaskMutation.isPending || !newTaskTitle.trim()}>
                            Add
                        </Button>
                    </form>
                </div>
                {isLoading ? (
                    <div className="p-8 text-center">Loading tasks...</div>
                ) : (
                    <div className="p-4 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Pending ({pendingTasks.length})</h3>
                            <div className="space-y-2">
                                {pendingTasks.length > 0 ? (
                                    pendingTasks.map((task: Task) => <TaskItem key={task.id} task={task} />)
                                ) : (
                                    <p className="text-sm text-gray-500 p-3">No pending tasks. Well done!</p>
                                )}
                            </div>
                        </div>

                        {completedTasks.length > 0 && (
                            <div className="pt-4 border-t dark:border-dark-border">
                                <h3 className="font-semibold mb-2">Completed ({completedTasks.length})</h3>
                                <div className="space-y-2">
                                    {completedTasks.map((task: Task) => <TaskItem key={task.id} task={task} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </PageWrapper>
    );
};

export default MyTasksPage;