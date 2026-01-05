'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="prose prose-lg md:prose-xl prose-headings:font-serif prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-loose prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
