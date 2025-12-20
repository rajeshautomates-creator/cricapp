"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <BookOpen className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl mb-6 bg-gradient-primary bg-clip-text text-transparent">
                        OUR BLOG
                    </h1>
                    <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                        Stay tuned for the latest news, updates, and expert tips from the world of cricket. We're working on some exciting content for you!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-card border border-border rounded-3xl p-8 opacity-50">
                                <div className="h-48 bg-secondary rounded-2xl mb-6 animate-pulse" />
                                <div className="h-8 bg-secondary rounded w-3/4 mb-4 animate-pulse" />
                                <div className="h-4 bg-secondary rounded w-full mb-2 animate-pulse" />
                                <div className="h-4 bg-secondary rounded w-2/3 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
