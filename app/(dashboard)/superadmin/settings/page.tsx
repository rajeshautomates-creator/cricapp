"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import SuperAdminSettings from "@/views/superadmin/Settings";

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole="superadmin">
      <SuperAdminSettings />
    </ProtectedRoute>
  );
}
