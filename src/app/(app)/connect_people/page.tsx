'use client';

import { motion } from 'framer-motion';
import { Users, Heart, Share2, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ConnectPeoplePage() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-black uppercase tracking-widest"
                    >
                        <Users className="w-4 h-4" />
                        Community
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-serif font-black tracking-tight"
                    >
                        Connect with<br /><span className="text-primary italic">your Tribe.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground max-w-2xl mx-auto italic"
                    >
                        "The Commons is more than just a blog. it's a bridge between dreamers and doers."
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
                    {[
                        {
                            title: "Join local lodgers",
                            desc: "Find students and travelers in your city and share experiences.",
                            icon: Heart,
                            color: "bg-pink-500"
                        },
                        {
                            title: "Share your story",
                            desc: "Write about your journey and inspire others in our community.",
                            icon: Share2,
                            color: "bg-blue-500"
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="p-10 rounded-[3rem] bg-white border border-black/5 hover:border-black/10 hover:shadow-2xl hover:shadow-black/5 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${item.color}/10 flex items-center justify-center mb-6`}>
                                <item.icon className={`w-6 h-6 text-white fill-current`} style={{ color: item.color.replace('bg-', '') }} />
                            </div>
                            <h3 className="text-2xl font-serif font-black mb-4">{item.title}</h3>
                            <p className="text-muted-foreground italic mb-8">"{item.desc}"</p>
                            <Link href="/writer/new" className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-primary group-hover:gap-4 transition-all">
                                Get Started <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
