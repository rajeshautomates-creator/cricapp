"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import CreateTournament from "@/views/CreateTournament";

export default function CreateTournamentPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateTournament />
    </ProtectedRoute>
  );
}
