"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Players from "@/views/Players";

export default function PlayersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Players />
    </ProtectedRoute>
  );
}
