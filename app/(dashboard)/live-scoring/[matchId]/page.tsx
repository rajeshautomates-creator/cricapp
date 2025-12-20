"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import LiveScoring from "@/views/LiveScoring";

export default function LiveScoringMatchPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <LiveScoring />
    </ProtectedRoute>
  );
}
