"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-32">
                <h1 className="font-display text-5xl mb-8">TERMS OF SERVICE</h1>
                <div className="prose prose-invert max-w-3xl mx-auto text-muted-foreground">
                    <p>By accessing the website at ckt.rajeshautomates.in, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
