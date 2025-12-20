"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import CreateAdmin from "@/views/superadmin/CreateAdmin";

export default function CreateAdminPage() {
  return (
    <ProtectedRoute requiredRole="superadmin">
      <CreateAdmin />
    </ProtectedRoute>
  );
}
