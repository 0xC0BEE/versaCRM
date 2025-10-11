import React, { useMemo, useState } from 'react';
import { KBArticleType } from '../../types';
import { ChevronDown } from 'lucide-react';

interface KBSidebarProps {
    articles: KBArticleType[];
    selectedArticleId: string;
    setSelectedArticleId: (id: string) => void;
}

const KBSidebar: React.FC<KBSidebarProps> = ({ articles, selectedArticleId, setSelectedArticleId }) => {

    const articlesByCategory = useMemo(() => {
        return articles.reduce((acc: Record<string, KBArticleType[]>, article) => {
            if (!acc[article.category]) {
                acc[article.category] = [];
            }
            acc[article.category].push(article);
            return acc;
        }, {} as Record<string, KBArticleType[]>);
    }, [articles]);

    // Initialize all categories to be open by default
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => 
        Object.keys(articlesByCategory).reduce((acc: Record<string, boolean>, category) => {
            acc[category] = true;
            return acc;
        }, {})
    );

    const toggleCategory = (category: string) => {
        setOpenCategories(prev => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    return (
        <div className="p-4">
            {Object.keys(articlesByCategory).map((category) => {
                const categoryArticles = articlesByCategory[category];
                return (
                    <div key={category} className="mb-2">
                        <button 
                            onClick={() => toggleCategory(category)}
                            className="w-full flex justify-between items-center text-left text-xs font-semibold uppercase text-text-secondary tracking-wider mb-2 px-2 py-1 rounded-md hover:bg-hover-bg hover:text-text-primary transition-colors"
                        >
                            <span>{category}</span>
                            <ChevronDown 
                                size={16} 
                                className={`transition-transform duration-200 ${openCategories[category] ? 'rotate-180' : ''}`} 
                            />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openCategories[category] ? 'max-h-screen' : 'max-h-0'}`}>
                            <ul className="space-y-1 border-l border-border-subtle ml-2 pl-2">
                                {categoryArticles.map(article => (
                                    <li key={article.id}>
                                        <button
                                            onClick={() => setSelectedArticleId(article.id)}
                                            className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${
                                                selectedArticleId === article.id
                                                    ? 'bg-primary/10 text-primary font-semibold'
                                                    : 'text-text-secondary hover:bg-hover-bg'
                                            }`}
                                        >
                                            {article.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KBSidebar;
