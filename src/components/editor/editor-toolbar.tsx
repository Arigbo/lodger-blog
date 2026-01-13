'use client';

import {
    Bold, Italic, Strikethrough, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Quote, Code,
    Heading1, Heading2, Link as LinkIcon, Image as ImageIcon,
    Type, Undo, Redo, Minus, Upload, Link as LinkIconSmall, ChevronDown
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { uploadImage } from '@/lib/storage-utils';

interface EditorToolbarProps {
    editor: Editor;
    uploadPathPrefix?: string;
}

export function EditorToolbar({ editor, uploadPathPrefix }: EditorToolbarProps) {
    const [activeDropdown, setActiveDropdown] = useState<'family' | 'size' | null>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    if (!editor) {
        return null;
    }

    // Helper to check if a font family is active (loose match for fallbacks)
    const isFontActive = (fontValue: string) => {
        if (!fontValue) return false;
        const currentFont = editor.getAttributes('textStyle').fontFamily || '';
        if (fontValue === '' && !currentFont) return true; // Default
        // Check if the primary font name exists in the current font string
        const primaryFont = fontValue.split(',')[0].trim().replace(/['"]/g, '');
        return currentFont.includes(primaryFont);
    };

    const currentFontSize = editor.getAttributes('textStyle').fontSize || 'Auto';
    const currentFontFamilyName = () => {
        const font = editor.getAttributes('textStyle').fontFamily;
        if (!font) return 'Font';
        if (font.includes('inter')) return 'Inter';
        if (font.includes('outfit')) return 'Outfit';
        if (font.includes('playfair')) return 'Playfair';
        if (font.includes('space-grotesk')) return 'Space';
        if (font.includes('monospace')) return 'Mono';
        if (font.includes('serif')) return 'Serif';
        return 'Font';
    };

    const toggleDropdown = (e: React.MouseEvent, type: 'family' | 'size') => {
        e.stopPropagation(); // Prevent window click from closing it immediately
        setActiveDropdown(activeDropdown === type ? null : type);
    };

    return (
        <div className="sticky top-20 z-40 mb-10 mx-auto w-fit bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 transition-all duration-300 flex-wrap max-w-full justify-center" onClick={(e) => e.stopPropagation()}>

            {/* Font Family Dropdown */}
            <div className="relative">
                <button
                    onClick={(e) => toggleDropdown(e, 'family')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors min-w-[90px] justify-between ${activeDropdown === 'family' ? 'bg-white/10' : 'hover:bg-white/10'}`}
                >
                    <span className="text-white text-xs font-bold uppercase tracking-widest truncate">
                        {currentFontFamilyName()}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${activeDropdown === 'family' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'family' && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                        {[
                            { name: 'Default', value: '' },
                            { name: 'Inter (Body)', value: 'var(--font-inter), sans-serif' },
                            { name: 'Outfit (Sans)', value: 'var(--font-outfit), sans-serif' },
                            { name: 'Playfair (Serif)', value: 'var(--font-playfair), serif' },
                            { name: 'Space Grotesk', value: 'var(--font-space-grotesk), sans-serif' },
                            { name: 'Monospace', value: 'monospace' },
                        ].map((font) => (
                            <button
                                key={font.name}
                                onClick={() => {
                                    if (font.value) {
                                        editor.chain().focus().setFontFamily(font.value).run();
                                    } else {
                                        editor.chain().focus().unsetFontFamily().run();
                                    }
                                    setActiveDropdown(null);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-bold text-white hover:bg-white/20 rounded-lg transition-colors flex items-center justify-between ${isFontActive(font.value) ? 'bg-white/10 text-white' : 'text-white/70'}`}
                                style={{ fontFamily: font.value || 'inherit' }}
                            >
                                {font.name}
                                {isFontActive(font.value) && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-px h-5 bg-white/10" />

            {/* Font Size Dropdown */}
            <div className="relative">
                <button
                    onClick={(e) => toggleDropdown(e, 'size')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors min-w-[70px] justify-between ${activeDropdown === 'size' ? 'bg-white/10' : 'hover:bg-white/10'}`}
                >
                    <span className="text-white text-xs font-bold uppercase tracking-widest text-center truncate">
                        {currentFontSize}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${activeDropdown === 'size' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'size' && (
                    <div className="absolute top-full left-0 mt-2 w-24 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar">
                        {['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px', '72px'].map((size) => (
                            <button
                                key={size}
                                onClick={() => {
                                    editor.chain().focus().setFontSize(size).run();
                                    setActiveDropdown(null);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-bold text-white hover:bg-white/20 rounded-lg transition-colors flex items-center justify-between ${editor.isActive('textStyle', { fontSize: size }) ? 'bg-white/10 text-white' : 'text-white/70'}`}
                            >
                                {size}
                                {editor.isActive('textStyle', { fontSize: size }) && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                editor.chain().focus().unsetFontSize().run();
                                setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-white/50 hover:bg-white/20 hover:text-white rounded-lg transition-colors border-t border-white/10 mt-1"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>

            <div className="w-px h-5 bg-white/10" />

            {/* Formatting Group */}
            <div className="flex items-center gap-0.5">
                <ToolButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={<Bold className="w-4 h-4" />}
                    tooltip="Bold"
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={<Italic className="w-4 h-4" />}
                    tooltip="Italic"
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    icon={<UnderlineIcon className="w-4 h-4" />}
                    tooltip="Underline"
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    icon={<Strikethrough className="w-4 h-4" />}
                    tooltip="Strikethrough"
                />
            </div>

            <div className="w-px h-5 bg-white/10" />

            {/* Alignment Group */}
            <div className="flex items-center gap-0.5">
                <ToolButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    icon={<AlignLeft className="w-4 h-4" />}
                    tooltip="Align Left"
                />
                <ToolButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    icon={<AlignCenter className="w-4 h-4" />}
                    tooltip="Align Center"
                />
                <ToolButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    icon={<AlignRight className="w-4 h-4" />}
                    tooltip="Align Right"
                />
            </div>

            <div className="w-px h-5 bg-white/10" />

            {/* Heading Group */}
            <div className="flex items-center gap-0.5">
                <ToolButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    icon={<Heading1 className="w-4 h-4" />}
                    tooltip="Heading 1"
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    icon={<Heading2 className="w-4 h-4" />}
                    tooltip="Heading 2"
                />
            </div>

            <div className="w-px h-5 bg-white/10" />

            {/* List Group */}
            <div className="flex items-center gap-0.5">
                <ToolButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={<List className="w-4 h-4" />}
                    tooltip="Bullet List"
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={<ListOrdered className="w-4 h-4" />}
                    tooltip="Numbered List"
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    icon={<Quote className="w-4 h-4" />}
                    tooltip="Quote"
                />
            </div>

            <div className="w-px h-5 bg-white/10" />

            {/* Global Group */}
            <div className="flex items-center gap-0.5">
                <ToolButton
                    onClick={() => {
                        const url = window.prompt('URL')
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run()
                        }
                    }}
                    isActive={editor.isActive('link')}
                    icon={<LinkIcon className="w-4 h-4" />}
                    tooltip="Link"
                />

                <ImageTool editor={editor} uploadPathPrefix={uploadPathPrefix} />

                <ToolButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    icon={<Minus className="w-4 h-4" />}
                    tooltip="Horizontal Rule"
                />
            </div>

        </div>
    );
}

function ImageTool({ editor, uploadPathPrefix }: { editor: any, uploadPathPrefix?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = () => setIsOpen(false);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Use specific path if provided, otherwise default to blog-images
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const path = uploadPathPrefix
                ? `${uploadPathPrefix}/${Date.now()}-${sanitizedName}`
                : `blog-images/${Date.now()}-${sanitizedName}`;

            const url = await uploadImage(file, path);

            editor.chain().focus().setImage({ src: url }).run();
            setIsOpen(false);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleUrlInput = () => {
        const url = window.prompt('Image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <ToolButton
                onClick={() => setIsOpen(!isOpen)}
                isActive={isOpen}
                icon={<ImageIcon className="w-4 h-4" />}
                tooltip="Image"
            />

            {isOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-2 flex flex-col gap-1 min-w-[140px] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-colors w-full text-left"
                        disabled={uploading}
                    >
                        <Upload className="w-3 h-3" />
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />

                    <button
                        onClick={handleUrlInput}
                        className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-colors w-full text-left"
                    >
                        <LinkIconSmall className="w-3 h-3" />
                        Enter URL
                    </button>
                </div>
            )}

        </div>
    )
}

function ToolButton({ icon, onClick, tooltip, isActive }: { icon: React.ReactNode, onClick: () => void, tooltip: string, isActive?: boolean }) {
    return (
        <button
            onClick={(e) => { e.preventDefault(); onClick(); }}
            title={tooltip}
            className={`p-2 rounded-lg transition-all active:scale-95 duration-75 ${isActive
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] transform scale-105'
                : 'text-white/70 hover:bg-white/10 hover:text-white hover:scale-105'
                }`}
        >
            {icon}
        </button>
    )
}
