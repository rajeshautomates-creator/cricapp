"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-32">
                <h1 className="font-display text-5xl mb-8">PRIVACY POLICY</h1>
                <div className="prose prose-invert max-w-3xl mx-auto text-muted-foreground">
                    <p>Your privacy is important to us. It is CricketScore's policy to respect your privacy regarding any information we may collect from you across our website.</p>
                    <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
