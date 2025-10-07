import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';
import { FilterCondition, AnyContact, Product } from '../../types';
import { Search, Loader, Bot } from 'lucide-react';
import Button from '../ui/Button';
import { GoogleGenAI, Type } from '@google/genai';
import toast from 'react-hot-toast';

interface SmartSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SmartSearchModal: React.FC<SmartSearchModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ report?: string; filters?: FilterCondition[] } | null>(null);
    
    const { contactsQuery, productsQuery } = useData();
    const { setContactFilters, setCurrentPage } = useApp();

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

            const prompt = `You are a helpful CRM assistant. Your task is to analyze a user's query and provide a structured JSON response.

The user's query is: "${query}"

Here is the data context you can use:
- **Contacts:** A list of contacts is available. You can filter them by fields: contactName, email, phone, status, leadSource. The available operators are: is, is_not, contains, does_not_contain.
- **Inventory:** A list of products is available with fields: name, category, salePrice, stockLevel.

Based on the user's query, you must decide on one of two actions:

1.  **Filter Contacts:** If the query is asking to find or filter contacts (e.g., "show me active leads", "find clients from the web source"), generate a \`filters\` array.
2.  **Generate a Report:** If the query is analytical and asks for a summary or status about something other than filtering contacts (e.g., "what is our inventory status?", "which items are running low?", "summarize sales"), generate a text-based \`report\`. The report should be a clear, concise answer to the user's question, formatted with markdown for readability (e.g., use bullet points).

Your response MUST be a JSON object matching this schema. Only one of 'filters' or 'report' should be populated.

Data context for your analysis:
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
    
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setQuery('');
                setResult(null);
                setIsLoading(false);
            }, 150);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Smart Search" size="lg">
            <form onSubmit={handleSearch}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., Show me active leads, or What is our inventory status?"
                        className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm"
                        autoFocus
                    />
                </div>
            </form>

            <div className="mt-4 min-h-[200px] max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                        <Loader className="animate-spin mb-2" />
                        <p>Analyzing your request...</p>
                    </div>
                ) : !result ? (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                        <Bot className="mb-2" />
                        <p>Ask a question about your contacts or inventory.</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-4">
                        {result.report && (
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                {result.report}
                            </div>
                        )}
                        {result.filters && result.filters.length > 0 && (
                            <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-md space-y-2">
                                <p>I've generated a filter based on your query.</p>
                                <Button onClick={handleApplyFilter}>Apply Filter to Contacts</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default SmartSearchModal;