"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-32 text-center">
                <h1 className="font-display text-5xl mb-6">ABOUT US</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    CricketScore is the ultimate platform for cricket enthusiasts, providing real-time updates and professional tournament management tools.
                </p>
            </main>
            <Footer />
        </div>
    );
}
