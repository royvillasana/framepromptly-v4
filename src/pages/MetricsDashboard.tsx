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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Real-time insights into your FramePromptly performance and quality metrics
              </p>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">
        <MetricsDashboard />
      </main>
    </div>
  );
};

export default MetricsDashboardPage;