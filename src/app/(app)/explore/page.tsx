'use client';

import { Search, Hash, TrendingUp } from 'lucide-react';

export default function ExplorePage() {
    return (
        <div className="w-full max-w-[600px] border-r border-border/40 min-h-screen">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-border/40 px-4 py-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search The Commons"
                        className="w-full bg-muted/50 border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            <div className="p-4">
                <h2 className="text-xl font-bold mb-6 italic font-serif">Trending for you</h2>
                <div className="space-y-6">
                    {[
                        { tag: '#StudentLiving', posts: '1.2k posts' },
                        { tag: '#CampusLife', posts: '856 posts' },
                        { tag: '#LodgerVibes', posts: '432 posts' },
                        { tag: '#MarketDay', posts: '211 posts' }
                    ].map((item) => (
                        <div key={item.tag} className="flex justify-between items-start hover:bg-black/5 p-3 rounded-2xl transition-all cursor-pointer">
                            <div>
                                <div className="text-sm text-muted-foreground">Trending in Nigeria</div>
                                <div className="font-bold text-lg">{item.tag}</div>
                                <div className="text-sm text-muted-foreground">{item.posts}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
