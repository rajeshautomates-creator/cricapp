"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-32 text-center">
                <h1 className="font-display text-5xl mb-6">CONTACT US</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Have questions or need support? Reach out to us at <a href="mailto:support@rajeshautomates.in" className="text-primary hover:underline">support@rajeshautomates.in</a>
                </p>
            </main>
            <Footer />
        </div>
    );
}
