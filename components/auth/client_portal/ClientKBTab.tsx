import React, { useState, useMemo } from 'react';
import { kbArticles } from '../../../config/kbContent';
import { KBArticleType } from '../../../types';
import Input from '../../ui/Input';
import { Search, ChevronLeft } from 'lucide-react';
import KBArticle from '../../kb/KBArticle';

const ClientKBTab: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<KBArticleType | null>(null);

    const filteredArticles = useMemo(() => {
        if (!searchQuery.trim()) {
            return kbArticles;
        }
        return kbArticles.filter(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // FIX: The initial value of `reduce` was not typed, causing incorrect type inference for the result.
    // By adding an explicit type to the constant, we ensure `articlesByCategory` is correctly typed.
    const articlesByCategory: Record<string, KBArticleType[]> = useMemo(() => {
        return filteredArticles.reduce((acc: Record<string, KBArticleType[]>, article) => {
            const category = article.category;
            (acc[category] = acc[category] || []).push(article);
            return acc;
        }, {} as Record<string, KBArticleType[]>);
    }, [filteredArticles]);

    if (selectedArticle) {
        return (
            <div>
                <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary mb-4 p-1 rounded-md hover:bg-hover-bg">
                    <ChevronLeft size={16} />
                    Back to Help Center
                </button>
                <div className="border-t border-border-subtle pt-4">
                    <KBArticle article={selectedArticle} />
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Help Center</h3>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <Input
                    id="kb-search"
                    label=""
                    placeholder="Search for articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="!pl-10"
                />
            </div>

            {Object.keys(articlesByCategory).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(articlesByCategory).map(([category, articles]) => (
                        <div key={category}>
                            <h4 className="font-semibold text-text-primary mb-2 pb-2 border-b border-border-subtle">{category}</h4>
                            <ul className="space-y-1">
                                {articles.map(article => (
                                    <li key={article.id}>
                                        <button onClick={() => setSelectedArticle(article)} className="text-primary hover:underline text-sm text-left p-1">
                                            {article.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-text-secondary py-8">No articles found matching your search.</p>
            )}
        </div>
    );
};

export default ClientKBTab;