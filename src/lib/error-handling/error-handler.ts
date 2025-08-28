/**
 * @fileoverview Centralized Error Handler
 * Main error handling service with logging, monitoring, and recovery mechanisms
 */

import { toast } from 'sonner';
import {
  BaseFramePromptlyError,
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
  isFramePromptlyError,
  isRetryableError,
  isCriticalError,
  SystemError
} from './error-types';

export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableTelemetry: boolean;
  enableUserNotifications: boolean;
  enableRetryMechanism: boolean;
  maxRetryAttempts: number;
  retryDelayMs: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  telemetryEndpoint?: string;
}

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  error: BaseFramePromptlyError | Error;
  context: ErrorContext;
  handled: boolean;
  recovered: boolean;
  retryAttempts: number;
  telemetrySent: boolean;
  userNotified: boolean;
}

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error, attemptCount: number) => boolean;
}

export interface RecoveryStrategy {
  category: ErrorCategory;
  handler: (error: BaseFramePromptlyError, context: ErrorContext) => Promise<any>;
  fallback?: (error: BaseFramePromptlyError, context: ErrorContext) => Promise<any>;
}

/**
 * Centralized Error Handler Service
 */
export class ErrorHandlerService {
  private config: ErrorHandlerConfig;
  private errorLog: Map<string, ErrorLogEntry> = new Map();
  private recoveryStrategies: Map<ErrorCategory, RecoveryStrategy> = new Map();
  private telemetryBuffer: ErrorLogEntry[] = [];
  private telemetryFlushInterval?: NodeJS.Timeout;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableTelemetry: true,
      enableUserNotifications: true,
      enableRetryMechanism: true,
      maxRetryAttempts: 3,
      retryDelayMs: 1000,
      logLevel: 'error',
      ...config
    };

    this.initializeRecoveryStrategies();
    this.initializeTelemetry();
  }

  /**
   * Main error handling method
   */
  async handleError(
    error: Error | BaseFramePromptlyError | null | undefined,
    context: Partial<ErrorContext> = {},
    options: {
      silent?: boolean;
      skipRecovery?: boolean;
      skipTelemetry?: boolean;
    } = {}
  ): Promise<{
    handled: boolean;
    recovered: boolean;
    recoveredValue?: any;
    userMessage?: string;
  }> {
    const fullContext: ErrorContext = {
      timestamp: new Date(),
      ...context
    };

    // Convert to FramePromptly error if needed
    const framePromptlyError = this.normalizeError(error, fullContext);
    
    // Create error log entry
    const logEntry = this.createLogEntry(framePromptlyError, fullContext);
    
    try {
      // Log the error
      if (this.config.enableLogging) {
        this.logError(framePromptlyError, fullContext);
      }

      // Store in error log
      this.errorLog.set(logEntry.id, logEntry);

      // Send telemetry (async, non-blocking)
      if (this.config.enableTelemetry && !options.skipTelemetry) {
        this.sendTelemetryAsync(logEntry);
      }

      // Attempt recovery
      let recovered = false;
      let recoveredValue: any = undefined;
      
      if (!options.skipRecovery && framePromptlyError.metadata.recoverable) {
        const recoveryResult = await this.attemptRecovery(framePromptlyError, fullContext);
        recovered = recoveryResult.success;
        recoveredValue = recoveryResult.value;
        logEntry.recovered = recovered;
      }

      // Notify user if needed
      let userMessage: string | undefined;
      if (this.config.enableUserNotifications && !options.silent) {
        userMessage = await this.notifyUser(framePromptlyError, recovered);
        logEntry.userNotified = true;
      }

      logEntry.handled = true;
      
      return {
        handled: true,
        recovered,
        recoveredValue,
        userMessage
      };
    } catch (handlerError) {
      console.error('Error handler failed:', handlerError);
      
      // Fallback notification
      if (!options.silent) {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      return {
        handled: false,
        recovered: false
      };
    }
  }

  /**
   * Execute operation with automatic error handling and retry
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: Partial<ErrorContext>,
    retryOptions: RetryOptions = {}
  ): Promise<T> {
    const options = {
      maxAttempts: this.config.maxRetryAttempts,
      delayMs: this.config.retryDelayMs,
      backoffMultiplier: 2,
      shouldRetry: (error: Error, attemptCount: number) => {
        return isRetryableError(error) && attemptCount < (options.maxAttempts || 3);
      },
      ...retryOptions
    };

    let lastError: Error;
    let attemptCount = 0;

    while (attemptCount < options.maxAttempts!) {
      try {
        attemptCount++;
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Handle the error
        await this.handleError(lastError, {
          ...context,
          additionalData: { attemptCount, maxAttempts: options.maxAttempts }
        });

        // Check if we should retry
        if (attemptCount < options.maxAttempts! && options.shouldRetry!(lastError, attemptCount)) {
          const delay = options.delayMs! * Math.pow(options.backoffMultiplier!, attemptCount - 1);
          await this.delay(delay);
          continue;
        }
        
        break;
      }
    }

    throw lastError!;
  }

  /**
   * Register recovery strategy for error category
   */
  registerRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.category, strategy);
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recoveryRate: number;
    criticalErrors: number;
  } {
    const entries = Array.from(this.errorLog.values());
    
    const errorsByCategory = entries.reduce((acc, entry) => {
      if (isFramePromptlyError(entry.error)) {
        const category = entry.error.metadata.category;
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const errorsBySeverity = entries.reduce((acc, entry) => {
      if (isFramePromptlyError(entry.error)) {
        const severity = entry.error.metadata.severity;
        acc[severity] = (acc[severity] || 0) + 1;
      }
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const recoveredCount = entries.filter(e => e.recovered).length;
    const criticalErrors = entries.filter(e => 
      isFramePromptlyError(e.error) && e.error.metadata.severity === ErrorSeverity.CRITICAL
    ).length;

    return {
      totalErrors: entries.length,
      errorsByCategory,
      errorsBySeverity,
      recoveryRate: entries.length > 0 ? recoveredCount / entries.length : 0,
      criticalErrors
    };
  }

  /**
   * Clear error log (useful for testing)
   */
  clearErrorLog(): void {
    this.errorLog.clear();
    this.telemetryBuffer = [];
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 50): ErrorLogEntry[] {
    return Array.from(this.errorLog.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Private methods

  private normalizeError(error: Error | BaseFramePromptlyError | null | undefined, context: ErrorContext): BaseFramePromptlyError {
    if (isFramePromptlyError(error)) {
      return error;
    }

    // Handle null or undefined errors
    if (!error) {
      return new SystemError('Unknown error occurred', context, 'unknown', new Error('Null or undefined error'));
    }

    // Convert generic errors to FramePromptly errors
    const errorMessage = error.message || error.toString() || 'Unknown error occurred';
    return new SystemError(errorMessage, context, 'unknown', error);
  }

  private createLogEntry(error: BaseFramePromptlyError, context: ErrorContext): ErrorLogEntry {
    return {
      id: this.generateErrorId(),
      timestamp: new Date(),
      error,
      context,
      handled: false,
      recovered: false,
      retryAttempts: 0,
      telemetrySent: false,
      userNotified: false
    };
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(error: BaseFramePromptlyError, context: ErrorContext): void {
    // Skip logging generic script errors that aren't actionable
    const isGenericScriptError = context.additionalData?.isGenericScriptError;
    if (isGenericScriptError) {
      return;
    }

    const logLevel = this.getLogLevelForSeverity(error.metadata.severity);
    const logMessage = `[${error.metadata.category}:${error.metadata.code}] ${error.message}`;
    const logData = {
      category: error.metadata.category,
      severity: error.metadata.severity,
      code: error.metadata.code,
      context,
      stack: error.stackTrace
    };

    switch (logLevel) {
      case 'error':
        console.error(logMessage, logData);
        break;
      case 'warn':
        console.warn(logMessage, logData);
        break;
      case 'info':
        console.info(logMessage, logData);
        break;
      case 'debug':
        console.debug(logMessage, logData);
        break;
    }
  }

  private getLogLevelForSeverity(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'error';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'error';
    }
  }

  private async sendTelemetryAsync(logEntry: ErrorLogEntry): Promise<void> {
    if (!this.config.enableTelemetry) return;

    try {
      this.telemetryBuffer.push(logEntry);
      logEntry.telemetrySent = true;

      // Flush immediately for critical errors
      if (isFramePromptlyError(logEntry.error) && isCriticalError(logEntry.error)) {
        await this.flushTelemetry();
      }
    } catch (error) {
      console.error('Failed to send telemetry:', error);
    }
  }

  private async flushTelemetry(): Promise<void> {
    if (!this.config.telemetryEndpoint || this.telemetryBuffer.length === 0) {
      return;
    }

    try {
      const telemetryData = this.telemetryBuffer.map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp.toISOString(),
        error: {
          name: entry.error.name,
          message: entry.error.message,
          category: isFramePromptlyError(entry.error) ? entry.error.metadata.category : 'unknown',
          severity: isFramePromptlyError(entry.error) ? entry.error.metadata.severity : ErrorSeverity.MEDIUM,
          code: isFramePromptlyError(entry.error) ? entry.error.metadata.code : 'UNKNOWN_ERROR'
        },
        context: entry.context,
        handled: entry.handled,
        recovered: entry.recovered
      }));

      await fetch(this.config.telemetryEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          errors: telemetryData,
          timestamp: new Date().toISOString()
        })
      });

      this.telemetryBuffer = [];
    } catch (error) {
      console.error('Failed to flush telemetry:', error);
    }
  }

  private async attemptRecovery(
    error: BaseFramePromptlyError,
    context: ErrorContext
  ): Promise<{ success: boolean; value?: any }> {
    const strategy = this.recoveryStrategies.get(error.metadata.category);
    
    if (!strategy) {
      return { success: false };
    }

    try {
      const value = await strategy.handler(error, context);
      return { success: true, value };
    } catch (recoveryError) {
      console.warn('Primary recovery failed, attempting fallback:', recoveryError);
      
      if (strategy.fallback) {
        try {
          const value = await strategy.fallback(error, context);
          return { success: true, value };
        } catch (fallbackError) {
          console.error('Fallback recovery failed:', fallbackError);
        }
      }
      
      return { success: false };
    }
  }

  private async notifyUser(error: BaseFramePromptlyError, recovered: boolean): Promise<string> {
    const message = recovered 
      ? 'Issue resolved automatically' 
      : error.getUserFriendlyMessage();

    const severity = error.metadata.severity;
    
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        toast.error(message, {
          duration: 10000,
          action: {
            label: 'Report Issue',
            onClick: () => this.reportIssue(error)
          }
        });
        break;
      case ErrorSeverity.HIGH:
        toast.error(message, { duration: 5000 });
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(message, { duration: 3000 });
        break;
      case ErrorSeverity.LOW:
        toast.info(message, { duration: 2000 });
        break;
    }

    return message;
  }

  private reportIssue(error: BaseFramePromptlyError): void {
    // Could open a support modal or redirect to support page
    console.log('Issue reporting for error:', error.metadata.code);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private initializeRecoveryStrategies(): void {
    // Context Processing Recovery
    this.registerRecoveryStrategy({
      category: ErrorCategory.CONTEXT_PROCESSING,
      handler: async (error, context) => {
        // Attempt to recover by using cached context or simplified processing
        console.log('Attempting context processing recovery');
        return { fallbackContext: 'Basic context without advanced processing' };
      },
      fallback: async (error, context) => {
        return { fallbackContext: 'Minimal context' };
      }
    });

    // Template Processing Recovery
    this.registerRecoveryStrategy({
      category: ErrorCategory.TEMPLATE_PROCESSING,
      handler: async (error, context) => {
        console.log('Attempting template processing recovery');
        return { fallbackTemplate: 'Generate a basic prompt for the selected UX tool.' };
      }
    });

    // Database Recovery
    this.registerRecoveryStrategy({
      category: ErrorCategory.DATABASE,
      handler: async (error, context) => {
        console.log('Attempting database recovery');
        // Could implement retry with exponential backoff
        return { cached: true, data: null };
      }
    });

    // Network Recovery
    this.registerRecoveryStrategy({
      category: ErrorCategory.NETWORK,
      handler: async (error, context) => {
        console.log('Attempting network recovery');
        // Could implement retry with different endpoint
        return { offline: true, cached: true };
      }
    });
  }

  private initializeTelemetry(): void {
    if (!this.config.enableTelemetry) return;

    // Periodic telemetry flush
    this.telemetryFlushInterval = setInterval(() => {
      this.flushTelemetry();
    }, 30000); // Flush every 30 seconds

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushTelemetry();
      });
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.telemetryFlushInterval) {
      clearInterval(this.telemetryFlushInterval);
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandlerService({
  enableLogging: process.env.NODE_ENV === 'development',
  enableTelemetry: process.env.NODE_ENV === 'production',
  enableUserNotifications: true,
  enableRetryMechanism: true,
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
});

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Filter out generic "Script error" messages that aren't actionable
    // These often occur from CORS issues or browser extension interference
    const isGenericScriptError = (
      event.message === 'Script error.' || 
      event.message === '' ||
      (event.lineno === 0 && event.colno === 0 && !event.error)
    );

    // Skip logging generic script errors in development
    if (isGenericScriptError && process.env.NODE_ENV === 'development') {
      return;
    }

    errorHandler.handleError(event.error || new Error(`Script error at ${event.filename}:${event.lineno}:${event.colno}`), {
      timestamp: new Date(),
      additionalData: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message,
        isGenericScriptError
      }
    }, { 
      silent: isGenericScriptError // Don't show toast for generic errors
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Handle cases where reason might be null or not an Error
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(event.reason ? String(event.reason) : 'Unhandled promise rejection');
      
    errorHandler.handleError(error, {
      timestamp: new Date(),
      additionalData: {
        type: 'unhandledPromiseRejection',
        reason: event.reason
      }
    });
  });
}