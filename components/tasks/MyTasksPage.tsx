
import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import TaskItem from './TaskItem';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
// FIX: Corrected import path for types.
import { Task, User } from '../../types';
import { addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const MyTasksPage: React.FC = () => {
    const { authenticatedUser, hasPermission } = useAuth();
    const { tasksQuery, createTaskMutation, teamMembersQuery } = useData();
    const { data: tasks = [], isLoading: tasksLoading } = tasksQuery;
    const { data: teamMembers = [], isLoading: membersLoading } = teamMembersQuery;
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const canViewAll = hasPermission('contacts:read:all');
    const pageTitle = canViewAll ? 'All Tasks' : 'My Tasks';
    const isLoading = tasksLoading || membersLoading;

    const userMap = useMemo(() => {
        return (teamMembers as User[]).reduce((acc, user) => {
            acc[user.id] = user.name;
            return acc;
        }, {} as Record<string, string>);
    }, [teamMembers]);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) {
            toast.error("Task title cannot be empty.");
            return;
        }

        createTaskMutation.mutate({
            title: newTaskTitle,
            dueDate: addDays(new Date(), 1).toISOString(),
            userId: authenticatedUser!.id,
            organizationId: authenticatedUser!.organizationId!,
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
            <h1 className="text-2xl font-semibold text-text-heading mb-6">{pageTitle}</h1>
            <Card>
                <div className="p-4 border-b border-border-subtle">
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
                            <h3 className="font-semibold text-text-primary mb-2">Pending ({pendingTasks.length})</h3>
                            <div className="space-y-2">
                                {pendingTasks.length > 0 ? (
                                    pendingTasks.map((task: Task, index) => (
                                        <TaskItem 
                                            key={task.id} 
                                            task={task} 
                                            animationDelay={index * 50}
                                            assigneeName={canViewAll ? userMap[task.userId] : undefined}
                                        />
                                    ))
                                ) : (
                                    <p className="text-sm text-text-secondary p-3">No pending tasks. Well done!</p>
                                )}
                            </div>
                        </div>

                        {completedTasks.length > 0 && (
                            <div className="pt-4 border-t border-border-subtle">
                                <h3 className="font-semibold text-text-primary mb-2">Completed ({completedTasks.length})</h3>
                                <div className="space-y-2">
                                    {completedTasks.map((task: Task, index) => (
                                        <TaskItem 
                                            key={task.id} 
                                            task={task} 
                                            animationDelay={index * 50} 
                                            assigneeName={canViewAll ? userMap[task.userId] : undefined}
                                        />
                                    ))}
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