"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-32">
                <h1 className="font-display text-5xl mb-8">REFUND POLICY</h1>
                <div className="prose prose-invert max-w-3xl mx-auto text-muted-foreground">
                    <p>We want you to be satisfied with our service. If you have any issues with your subscription, please contact us within 7 days for a full refund.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
