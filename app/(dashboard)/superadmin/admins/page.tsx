"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import SuperAdminAdmins from "@/views/superadmin/Admins";

export default function AdminsPage() {
    return (
        <ProtectedRoute requiredRole="superadmin">
            <SuperAdminAdmins />
        </ProtectedRoute>
    );
}
