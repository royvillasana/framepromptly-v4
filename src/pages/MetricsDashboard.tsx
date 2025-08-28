/**
 * @fileoverview Metrics Dashboard Page
 * Page wrapper for the metrics dashboard with navigation and layout
 */

import React from 'react';
import { Navigation } from '@/components/ui/navigation';
import MetricsDashboard from '@/components/metrics/metrics-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';

const MetricsDashboardPage: React.FC = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <MetricsDashboard />
      </main>
    </div>
  );
};

export default MetricsDashboardPage;