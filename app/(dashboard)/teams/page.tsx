"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Teams from "@/views/Teams";

export default function TeamsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Teams />
    </ProtectedRoute>
  );
}
