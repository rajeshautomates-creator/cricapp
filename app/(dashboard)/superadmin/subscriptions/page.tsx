"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import SuperAdminSubscriptions from "@/views/superadmin/Subscriptions";

export default function SubscriptionsPage() {
    return (
        <ProtectedRoute requiredRole="superadmin">
            <SuperAdminSubscriptions />
        </ProtectedRoute>
    );
}
