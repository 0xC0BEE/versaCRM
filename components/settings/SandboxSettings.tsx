import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Sandbox } from '../../types';
import Button from '../ui/Button';
import { Plus, FlaskConical, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SandboxSettings: React.FC = () => {
    const { sandboxesQuery, createSandboxMutation, refreshSandboxMutation, deleteSandboxMutation } = useData();
    const { authenticatedUser } = useAuth();
    const { currentEnvironment } = useApp();
    const { data: sandboxes = [], isLoading } = sandboxesQuery;
    const [sandboxName, setSandboxName] = useState('');

    useEffect(() => {
        if (createSandboxMutation.isSuccess) {
            setSandboxName('');
            createSandboxMutation.reset(); // Reset mutation state for the next creation
        }
    }, [createSandboxMutation.isSuccess, createSandboxMutation.reset]);

    const handleCreate = () => {
        if (!sandboxName.trim()) {
            toast.error("Please provide a name for the sandbox.");
            return;
        }
        createSandboxMutation.mutate({ orgId: authenticatedUser!.organizationId, name: sandboxName });
    };

    const handleRefresh = (sandboxId: string) => {
        if (window.confirm("Are you sure you want to refresh this sandbox? All changes in the sandbox will be lost and replaced with current production data.")) {
            refreshSandboxMutation.mutate(sandboxId);
        }
    };
    
    const handleDelete = (sandboxId: string) => {
        if (currentEnvironment === sandboxId) {
            toast.error("Cannot delete the currently active sandbox. Please switch to Production first.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this sandbox? This action cannot be undone.")) {
            deleteSandboxMutation.mutate(sandboxId);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold">Sandbox Environments</h3>
            <p className="text-sm text-text-secondary mb-4">
                Create isolated environments to test configurations and automations without affecting your live data.
            </p>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm mb-4 flex items-start gap-2">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                <p>
                    Creating a sandbox copies your current production data. This process can be slow in a real application. Switching environments will cause the app to reload.
                </p>
            </div>

            <div className="p-4 border border-border-subtle rounded-lg bg-card-bg/50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={sandboxName}
                        onChange={(e) => setSandboxName(e.target.value)}
                        placeholder="New sandbox name (e.g., 'UAT Testing')"
                        className="flex-grow bg-card-bg border border-border-subtle rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button onClick={handleCreate} leftIcon={<Plus size={16} />} disabled={createSandboxMutation.isPending}>
                        {createSandboxMutation.isPending ? 'Creating...' : 'Create Sandbox'}
                    </Button>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm text-text-secondary mt-4">Available Sandboxes</h4>
                {isLoading ? <p>Loading sandboxes...</p> : sandboxes.map((sb: Sandbox) => (
                    <div key={sb.id} className="p-3 border border-border-subtle rounded-md flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FlaskConical className="text-text-secondary" />
                            <div>
                                <p className="font-medium">{sb.name}</p>
                                <p className="text-xs text-text-secondary">
                                    Created on {format(new Date(sb.createdAt), 'PP')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleRefresh(sb.id)}
                                disabled={refreshSandboxMutation.isPending && refreshSandboxMutation.variables === sb.id}
                                leftIcon={<RefreshCw size={14} className={refreshSandboxMutation.isPending && refreshSandboxMutation.variables === sb.id ? 'animate-spin' : ''} />}
                            >
                                {refreshSandboxMutation.isPending && refreshSandboxMutation.variables === sb.id ? 'Refreshing...' : 'Refresh'}
                            </Button>
                             <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(sb.id)}
                                disabled={deleteSandboxMutation.isPending && deleteSandboxMutation.variables === sb.id}
                                leftIcon={<Trash2 size={14} />}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
                {sandboxes.length === 0 && !isLoading && (
                    <p className="text-sm text-text-secondary py-4">No sandbox environments have been created.</p>
                )}
            </div>
        </div>
    );
};

export default SandboxSettings;