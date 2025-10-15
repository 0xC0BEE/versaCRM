import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ApiKey } from '../../types';
import Button from '../ui/Button';
import { Plus, Trash2, KeyRound, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import NewApiKeyModal from './NewApiKeyModal';
import { useApp } from '../../contexts/AppContext';

const ApiKeysSettings: React.FC = () => {
    const { apiKeysQuery, createApiKeyMutation, deleteApiKeyMutation } = useData();
    const { authenticatedUser } = useAuth();
    const { setCurrentPage } = useApp();
    const { data: apiKeys = [], isLoading } = apiKeysQuery;
    const [newKey, setNewKey] = useState<{ key: ApiKey, secret: string } | null>(null);
    const [keyName, setKeyName] = useState('');

    const handleGenerateKey = () => {
        if (!keyName.trim()) {
            toast.error("Please provide a name for the API key.");
            return;
        }
        createApiKeyMutation.mutate({ orgId: authenticatedUser!.organizationId, name: keyName }, {
            onSuccess: (result: { key: ApiKey, secret: string }) => {
                setNewKey(result);
                setKeyName('');
            }
        });
    };

    const handleDeleteKey = (key: ApiKey) => {
        if (window.confirm(`Are you sure you want to revoke the key "${key.name}"? This action cannot be undone.`)) {
            deleteApiKeyMutation.mutate(key.id);
        }
    };

    return (
        <>
            <div>
                <h3 className="text-lg font-semibold">API Keys</h3>
                <p className="text-sm text-text-secondary mb-4">Manage API keys to integrate with third-party services.</p>
                
                <div className="p-4 border border-border-subtle rounded-lg bg-card-bg/50">
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                            placeholder="New key name (e.g., 'Zapier Integration')"
                            className="flex-grow bg-card-bg border border-border-subtle rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button onClick={handleGenerateKey} leftIcon={<Plus size={16} />} disabled={createApiKeyMutation.isPending}>
                            {createApiKeyMutation.isPending ? 'Generating...' : 'Generate New Key'}
                        </Button>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    {isLoading ? <p>Loading API keys...</p> : (apiKeys as ApiKey[]).map(key => (
                        <div key={key.id} className="p-3 border border-border-subtle rounded-md flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <KeyRound className="text-text-secondary" />
                                <div>
                                    <p className="font-medium">{key.name}</p>
                                    <p className="text-xs text-text-secondary font-mono">
                                        {key.keyPrefix}************ 
                                        <span className="ml-4">Created on {format(new Date(key.createdAt), 'PP')}</span>
                                    </p>
                                </div>
                            </div>
                            <Button size="sm" variant="danger" onClick={() => handleDeleteKey(key)} disabled={deleteApiKeyMutation.isPending}>
                                <Trash2 size={14} /> <span className="ml-2">Revoke</span>
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <Button variant="secondary" onClick={() => setCurrentPage('ApiDocs')}>
                        View API Documentation <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </div>

            {newKey && (
                <NewApiKeyModal
                    isOpen={!!newKey}
                    onClose={() => setNewKey(null)}
                    apiKey={newKey.secret}
                    keyName={newKey.key.name}
                />
            )}
        </>
    );
};

export default ApiKeysSettings;