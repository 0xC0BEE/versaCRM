import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import { useData } from '../../contexts/DataContext';
import TaskItem from './TaskItem';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

const MyTasksPage: React.FC = () => {
    const { tasksQuery, createTaskMutation } = useData();
    const { data: tasks = [], isLoading } = tasksQuery;
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        createTaskMutation.mutate(
            {
                title: newTaskTitle,
                dueDate: new Date().toISOString(),
            },
            {
                onSuccess: () => {
                    setNewTaskTitle('');
                    toast.success('Task added!');
                },
                onError: () => {
                    toast.error('Failed to add task.');
                }
            }
        );
    };
    
    const pendingTasks = tasks.filter(t => !t.isCompleted);
    const completedTasks = tasks.filter(t => t.isCompleted);

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">My Tasks</h1>
            </div>
            <Card>
                <div className="p-6">
                    <div className="flex gap-2 mb-6">
                        <Input 
                            id="new-task"
                            placeholder="Add a new task..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                            className="flex-grow"
                        />
                        <Button onClick={handleAddTask} disabled={createTaskMutation.isPending} leftIcon={<Plus size={16} />}>
                            Add
                        </Button>
                    </div>

                    {isLoading ? (
                        <p>Loading tasks...</p>
                    ) : (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Pending ({pendingTasks.length})</h3>
                            <div className="space-y-2">
                                {pendingTasks.length > 0 ? (
                                    pendingTasks.map(task => <TaskItem key={task.id} task={task} />)
                                ) : (
                                    <p className="text-gray-500 text-sm">No pending tasks. Great job!</p>
                                )}
                            </div>
                            
                            <h3 className="text-lg font-semibold mt-8 mb-3">Completed ({completedTasks.length})</h3>
                            <div className="space-y-2">
                                {completedTasks.length > 0 ? (
                                    completedTasks.map(task => <TaskItem key={task.id} task={task} />)
                                ) : (
                                    <p className="text-gray-500 text-sm">No completed tasks yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default MyTasksPage;
