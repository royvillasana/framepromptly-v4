/**
 * @fileoverview Analytics Provider Component
 * Global provider for real-time analytics tracking across the app
 */

import React, { useEffect } from 'react';
import { useRealTimeAnalytics } from '@/hooks/use-real-time-analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { trackFeatureUsage } = useRealTimeAnalytics(false); // Don't auto-refresh in provider

  // Track app initialization
  useEffect(() => {
    trackFeatureUsage('app_initialized');
  }, [trackFeatureUsage]);

  return <>{children}</>;
};