'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="prose prose-lg md:prose-xl prose-headings:font-serif prose-headings:font-black prose-headings:tracking-tight prose-p:text-muted-foreground/90 prose-p:leading-relaxed prose-p:font-medium prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-img:rounded-[2rem] prose-img:shadow-xl prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:text-primary/80 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:p-8 prose-blockquote:rounded-r-2xl prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    rehypeRaw,
                    [rehypeSanitize, {
                        ...defaultSchema,
                        attributes: {
                            ...defaultSchema.attributes,
                            div: [['style'], ...(defaultSchema.attributes?.div || [])],
                            span: [['style'], ...(defaultSchema.attributes?.span || [])],
                            p: [['style'], ...(defaultSchema.attributes?.p || [])]
                        }
                    }]
                ]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
