"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import SuperAdminTournaments from "@/views/superadmin/Tournaments";

export default function TournamentsPage() {
    return (
        <ProtectedRoute requiredRole="superadmin">
            <SuperAdminTournaments />
        </ProtectedRoute>
    );
}
