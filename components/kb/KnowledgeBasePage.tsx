import React, { useState, useEffect } from 'react';
import PageWrapper from '../layout/PageWrapper';
// FIX: Changed default import of 'Card' to a named import '{ Card }' to resolve module export error.
import { Card } from '../ui/Card';
import KBSidebar from './KBSidebar';
import KBArticle from './KBArticle';
import { kbArticles } from '../../config/kbContent';
import { useApp } from '../../contexts/AppContext';

const KnowledgeBasePage: React.FC = () => {
    const { initialKbArticleId, setInitialKbArticleId } = useApp();
    const [selectedArticleId, setSelectedArticleId] = useState<string>('getting-started');
    
    useEffect(() => {
      if (initialKbArticleId) {
        setSelectedArticleId(initialKbArticleId);
        setInitialKbArticleId(null); // Reset after use
      }
    }, [initialKbArticleId, setInitialKbArticleId]);

    const selectedArticle = kbArticles.find(a => a.id === selectedArticleId);

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Help & Knowledge Base</h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <Card className="p-0">
                       <KBSidebar 
                            articles={kbArticles} 
                            selectedArticleId={selectedArticleId}
                            setSelectedArticleId={setSelectedArticleId}
                       />
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Card>
                        {selectedArticle ? (
                            <KBArticle article={selectedArticle} />
                        ) : (
                            <p>Select an article to read.</p>
                        )}
                    </Card>
                </div>
            </div>
        </PageWrapper>
    );
};

export default KnowledgeBasePage;