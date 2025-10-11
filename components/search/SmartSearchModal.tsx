


import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useData } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';
import { FilterCondition, AnyContact, Product } from '../../types';
import { Search, Loader, Bot, BookOpen } from 'lucide-react';
import Button from '../ui/Button';
import { GoogleGenAI, Type } from '@google/genai';
import toast from 'react-hot-toast';
import { kbArticles } from '../../config/kbContent';

interface SmartSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SmartSearchModal: React.FC<SmartSearchModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ report?: string; filters?: FilterCondition[]; kbArticleId?: string } | null>(null);
    
    const { contactsQuery, productsQuery } = useData();
    const { setContactFilters, setCurrentPage, setInitialKbArticleId } = useApp();

    const { data: contacts = [] } = contactsQuery;
    const { data: products = [] } = productsQuery;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            // FIX: Initialize GoogleGenAI with named apiKey parameter
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

            const contactsContext = contacts.slice(0, 5).map((c: AnyContact) => ({ id: c.id, contactName: c.contactName, email: c.email, status: c.status, leadSource: c.leadSource }));
            const productsContext = products.map((p: Product) => ({ name: p.name, category: p.category, salePrice: p.salePrice, stockLevel: p.stockLevel }));
            const kbContext = kbArticles.map(a => ({ id: a.id, title: a.title, category: a.category }));

            const prompt = `You are a helpful CRM assistant. Your task is to analyze a user's query and provide a structured JSON response.

The user's query is: "${query}"

Here is the data context you can use:
- **Knowledge Base:** A list of help articles. Use this for questions about how to use the CRM, feature explanations, or troubleshooting.
- **Contacts:** A list of contacts. Use this to filter contacts by fields: contactName, email, phone, status, leadSource.
- **Inventory:** A list of products. Use this for analytical questions about inventory.

Based on the user's query, you must decide on one of three actions:

1.  **Find KB Article:** If the query is a question that can be answered by the knowledge base (e.g., "how do I create a workflow?", "what is lead scoring?"), provide the single most relevant \`kbArticleId\`.
2.  **Filter Contacts:** If the query is asking to find or filter contacts (e.g., "show me active leads"), generate a \`filters\` array.
3.  **Generate a Report:** If the query is analytical and not covered by the above (e.g., "what is our inventory status?"), generate a text-based \`report\`.

Your response MUST be a JSON object. Only one of 'kbArticleId', 'filters', or 'report' should be populated.

Data context for your analysis:
Knowledge Base Articles: ${JSON.stringify(kbContext)}
Contacts Sample: ${JSON.stringify(contactsContext)}
Inventory Data: ${JSON.stringify(productsContext)}
`;

            // FIX: Use ai.models.generateContent with responseSchema
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            kbArticleId: { type: Type.STRING, nullable: true },
                            filters: {
                                type: Type.ARRAY,
                                nullable: true,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        field: { type: Type.STRING },
                                        operator: { type: Type.STRING },
                                        value: { type: Type.STRING },
                                    },
                                    required: ["field", "operator", "value"]
                                }
                            },
                            report: {
                                type: Type.STRING,
                                nullable: true,
                            }
                        }
                    }
                }
            });

            // FIX: Access response text via .text property
            const parsedResult = JSON.parse(response.text);
            setResult(parsedResult);

        } catch (error) {
            console.error("Smart Search AI Error:", error);
            toast.error("Sorry, I couldn't understand that request. Please try rephrasing.");
            setResult({ report: "I encountered an error trying to understand your request. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyFilter = () => {
        if (result?.filters) {
            setContactFilters(result.filters);
            setCurrentPage('Contacts');
            onClose();
        }
    };
    
    const handleViewArticle = (articleId: string) => {
        setInitialKbArticleId(articleId);
        setCurrentPage('KnowledgeBase');
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setQuery('');
                setResult(null);
                setIsLoading(false);
            }, 150);
        }
    }, [isOpen]);

    const renderResult = () => {
        if (result?.report) {
            return (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                    {result.report}
                </div>
            );
        }
        if (result?.filters && result.filters.length > 0) {
            return (
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-md space-y-2">
                    <p>I've generated a filter based on your query.</p>
                    <Button onClick={handleApplyFilter}>Apply Filter to Contacts</Button>
                </div>
            );
        }
        if (result?.kbArticleId) {
            const article = kbArticles.find(a => a.id === result.kbArticleId);
            if (article) {
                return (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md space-y-2">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">I found a knowledge base article that might help:</p>
                        <div className="p-3 bg-card-bg rounded-md">
                            <div className="flex items-center gap-3">
                                <BookOpen size={20} className="text-primary flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-text-primary">{article.title}</h4>
                                    <p className="text-xs text-text-secondary">{article.category}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center pt-2">
                           <Button onClick={() => handleViewArticle(article.id)}>View Article</Button>
                        </div>
                    </div>
                );
            }
        }
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Smart Search" size="lg">
            <form onSubmit={handleSearch}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., How do I create a workflow?"
                        className="w-full pl-10 pr-3 py-2 text-sm bg-card-bg border border-border-subtle focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                        autoFocus
                    />
                </div>
            </form>

            <div className="mt-4 min-h-[200px] max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                    <div className="text-center p-8 text-text-secondary flex flex-col items-center">
                        <Loader className="animate-spin mb-2" />
                        <p>Analyzing your request...</p>
                    </div>
                ) : !result ? (
                    <div className="text-center p-8 text-text-secondary flex flex-col items-center">
                        <Bot className="mb-2" />
                        <p>Ask a question about your contacts, inventory, or how to use the app.</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-4">
                        {renderResult()}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default SmartSearchModal;
