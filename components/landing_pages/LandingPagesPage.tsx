import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
// FIX: Changed default import of 'Card' to a named import '{ Card }' to resolve module export error.
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Edit, Trash2, Eye, Copy, Check } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { LandingPage } from '../../types';
import LandingPageBuilderPage from './LandingPageBuilderPage';
import toast from 'react-hot-toast';

const LandingPagesPage: React.FC = () => {
    const { landingPagesQuery, deleteLandingPageMutation, updateLandingPageMutation } = useData();
    const { data: pages = [], isLoading } = landingPagesQuery;

    const [view, setView] = useState<'list' | 'builder'>('list');
    const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    const handleNew = () => {
        setSelectedPage(null);
        setView('builder');
    };

    const handleEdit = (page: LandingPage) => {
        setSelectedPage(page);
        setView('builder');
    };

    const handleDelete = (page: LandingPage) => {
        if (window.confirm(`Are you sure you want to delete the page "${page.name}"?`)) {
            deleteLandingPageMutation.mutate(page.id);
        }
    };
    
    const handleTogglePublish = (page: LandingPage) => {
        const newStatus = page.status === 'Published' ? 'Draft' : 'Published';
        updateLandingPageMutation.mutate({ ...page, status: newStatus });
    };

    const handleCopyLink = (slug: string) => {
        const url = `${window.location.origin}/#/lp/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedSlug(slug);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopiedSlug(null), 2000);
    };

    if (view === 'builder') {
        return <LandingPageBuilderPage pageToEdit={selectedPage} onClose={() => setView('list')} />;
    }

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Landing Pages</h1>
                <Button onClick={handleNew} leftIcon={<Plus size={16} />}>
                    New Landing Page
                </Button>
            </div>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading landing pages...</div>
                ) : pages.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                             <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Page Name</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                    <th scope="col" className="px-6 py-3 font-medium">URL Slug</th>
                                    <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((page: LandingPage) => (
                                    <tr key={page.id} className="border-b border-border-subtle hover:bg-hover-bg">
                                        <td className="px-6 py-4 font-medium text-text-primary">{page.name}</td>
                                        <td className="px-6 py-4">
                                            <span 
                                                className={`text-xs font-medium px-2 py-0.5 rounded-micro cursor-pointer ${page.status === 'Published' ? 'bg-success/10 text-success' : 'bg-slate-400/10 text-text-secondary'}`}
                                                onClick={() => handleTogglePublish(page)}
                                            >
                                                {page.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs flex items-center gap-2">
                                            /{page.slug}
                                            <button onClick={() => handleCopyLink(page.slug)}>
                                                {copiedSlug === page.slug ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                {page.status === 'Published' && (
                                                    <a href={`#/lp/${page.slug}`} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" variant="secondary" leftIcon={<Eye size={14} />}>View</Button>
                                                    </a>
                                                )}
                                                <Button size="sm" variant="secondary" onClick={() => handleEdit(page)} leftIcon={<Edit size={14} />}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(page)} disabled={deleteLandingPageMutation.isPending}><Trash2 size={14} /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-secondary">
                        <p>No landing pages created yet.</p>
                         <Button onClick={handleNew} leftIcon={<Plus size={16} />} className="mt-4">
                            Create First Page
                        </Button>
                    </div>
                )}
            </Card>
        </PageWrapper>
    );
};

export default LandingPagesPage;