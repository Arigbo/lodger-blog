'use client';

import { motion } from 'framer-motion';
import { Info, Sparkles, Shield, Coffee } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-4xl mx-auto space-y-20">
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-black uppercase tracking-widest"
                    >
                        <Info className="w-4 h-4" />
                        Our Story
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-serif font-black tracking-tight"
                    >
                        We build<br /><span className="text-primary italic">Better Stays.</span>
                    </motion.h1>
                </div>

                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 30 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-xl prose-serif mx-auto italic text-muted-foreground"
                    >
                        <p>
                            "The Commons was born from a simple idea: that finding a place to live should be as inspiring as the life you plan to live there."
                        </p>
                        <p>
                            We believe in transparency, community, and the power of shared stories. Whether you're a student looking for your first studio or a landlord building a legacy, we're here to make the connection seamless.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
                        {[
                            { title: "Premium Design", icon: Sparkles, desc: "Aesthetics aren't just for show. They're for soul." },
                            { title: "Safe Haven", icon: Shield, desc: "Security built into every interaction, every time." },
                            { title: "Human First", icon: Coffee, desc: "Real support from real people who actually care." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="text-center space-y-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-serif font-black text-xl">{item.title}</h3>
                                <p className="text-sm text-muted-foreground italic font-medium px-4">"{item.desc}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
