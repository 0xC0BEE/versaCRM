import React from 'react';
// FIX: Corrected import to use types module for KBArticleType.
import { KBArticleType } from '../../types';

interface KBArticleProps {
    article: KBArticleType;
}

const KBArticle: React.FC<KBArticleProps> = ({ article }) => {
    return (
        <article className="prose dark:prose-invert max-w-none kb-article-content p-6">
            <h1>{article.title}</h1>
            {article.content}
        </article>
    );
};

export default KBArticle;