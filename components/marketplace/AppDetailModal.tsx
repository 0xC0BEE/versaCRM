import React from 'react';
import { AppMarketplaceItem, InstalledApp } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import { ExternalLink, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AppDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    app: AppMarketplaceItem;
    installedApp: InstalledApp | undefined;
}

const AppDetailModal: React.FC<AppDetailModalProps> = ({ isOpen, onClose, app, installedApp }) => {
    const { installAppMutation, uninstallAppMutation } = useData();
    const isInstalled = !!installedApp;

    const handleInstall = () => {
        installAppMutation.mutate(app.id, {
            onSuccess: () => toast.success(`${app.name} installed successfully!`)
        });
    };

    const handleUninstall = () => {
        if (window.confirm(`Are you sure you want to uninstall ${app.name}?`)) {
            uninstallAppMutation.mutate(installedApp!.id, {
                onSuccess: () => toast.success(`${app.name} uninstalled.`)
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={app.name} size="2xl">
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0 sm:w-1/3">
                    <img src={app.logo} alt={`${app.name} logo`} className="w-24 h-24 mb-4" />
                    <p className="text-sm"><strong>Developer:</strong> {app.developer}</p>
                    <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        Visit Website <ExternalLink size={14} />
                    </a>
                </div>
                <div className="flex-grow">
                    <p className="text-sm text-text-secondary leading-relaxed">{app.longDescription}</p>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle flex justify-end items-center gap-3">
                {isInstalled ? (
                    <>
                         <span className="text-sm text-success flex items-center gap-1"><CheckCircle size={16}/> Installed</span>
                        <Button variant="secondary" onClick={() => toast("Configuration not implemented.")}>Configure</Button>
                        <Button variant="danger" onClick={handleUninstall} disabled={uninstallAppMutation.isPending}>
                            {uninstallAppMutation.isPending ? 'Uninstalling...' : 'Uninstall'}
                        </Button>
                    </>
                ) : (
                    <Button onClick={handleInstall} disabled={installAppMutation.isPending}>
                        {installAppMutation.isPending ? 'Installing...' : 'Install App'}
                    </Button>
                )}
            </div>
        </Modal>
    );
};

export default AppDetailModal;