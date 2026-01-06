'use client';

import { Share2, Link as LinkIcon, Twitter, Linkedin, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SocialShareProps {
    title: string;
}

export function SocialShare({ title }: SocialShareProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform: 'twitter' | 'linkedin') => {
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        };
        window.open(urls[platform], '_blank', 'width=600,height=400');
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleCopyLink}
                className="p-2.5 rounded-full bg-white border border-border hover:border-primary hover:text-primary transition-all group relative"
                title="Copy link"
            >
                {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                {copied && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap">
                        COPIED!
                    </span>
                )}
            </button>
            <button
                onClick={() => handleShare('twitter')}
                className="p-2.5 rounded-full bg-white border border-border hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all"
                title="Share on Twitter"
            >
                <Twitter className="h-4 w-4" />
            </button>
            <button
                onClick={() => handleShare('linkedin')}
                className="p-2.5 rounded-full bg-white border border-border hover:border-[#0077b5] hover:text-[#0077b5] transition-all"
                title="Share on LinkedIn"
            >
                <Linkedin className="h-4 w-4" />
            </button>
        </div>
    );
}
