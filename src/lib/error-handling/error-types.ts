/**
 * @fileoverview Error Types and Classes
 * Centralized error type definitions for comprehensive error handling
 */

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  DATABASE = 'database',
  CONTEXT_PROCESSING = 'context_processing',
  TEMPLATE_PROCESSING = 'template_processing',
  VARIABLE_PROCESSING = 'variable_processing',
  WORKFLOW_CONTINUITY = 'workflow_continuity',
  PROMPT_GENERATION = 'prompt_generation',
  KNOWLEDGE_BASE = 'knowledge_base',
  ACCESSIBILITY = 'accessibility',
  SYSTEM = 'system',
  EXTERNAL_SERVICE = 'external_service'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  projectId?: string;
  sessionId?: string;
  frameworkId?: string;
  stageId?: string;
  toolId?: string;
  templateId?: string;
  timestamp: Date;
  requestId?: string;
  userAgent?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorMetadata {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string;
  context: ErrorContext;
  recoverable: boolean;
  retryable: boolean;
  userFriendly: boolean;
  telemetryData?: Record<string, any>;
}

/**
 * Base Error Class for FramePromptly
 */
export abstract class BaseFramePromptlyError extends Error {
  public readonly metadata: ErrorMetadata;
  public readonly originalError?: Error;
  public readonly stackTrace: string;

  constructor(
    message: string,
    metadata: ErrorMetadata,
    originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.metadata = metadata;
    this.originalError = originalError;
    this.stackTrace = this.stack || '';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      metadata: this.metadata,
      stackTrace: this.stackTrace,
      originalError: this.originalError?.message
    };
  }

  getUserFriendlyMessage(): string {
    if (this.metadata.userFriendly) {
      return this.message;
    }
    return this.getGenericMessage();
  }

  abstract getGenericMessage(): string;
}

/**
 * Validation Errors
 */
export class ValidationError extends BaseFramePromptlyError {
  constructor(
    message: string,
    context: ErrorContext,
    fieldName?: string,
    originalError?: Error
  ) {
    super(message, {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      code: 'VALIDATION_FAILED',
      context,
      recoverable: true,
      retryable: false,
      userFriendly: true,
      telemetryData: { fieldName }
    }, originalError);
  }

  getGenericMessage(): string {
    return 'Please check your input and try again.';
  }
}

export class VariableValidationError extends ValidationError {
  constructor(
    variableId: string,
    message: string,
    context: ErrorContext,
    originalError?: Error
  ) {
    super(`Variable '${variableId}': ${message}`, context, variableId, originalError);
    this.metadata.code = 'VARIABLE_VALIDATION_FAILED';
  }
}

export class TemplateValidationError extends ValidationError {
  constructor(
    templateId: string,
    message: string,
    context: ErrorContext,
    originalError?: Error
  ) {
    super(`Template '${templateId}': ${message}`, context, templateId, originalError);
    this.metadata.code = 'TEMPLATE_VALIDATION_FAILED';
  }
}

/**
 * Context Processing Errors
 */
export class ContextProcessingError extends BaseFramePromptlyError {
  constructor(
    message: string,
    context: ErrorContext,
    processingStage?: string,
    originalError?: Error
  ) {
    super(message, {
      category: ErrorCategory.CONTEXT_PROCESSING,
      severity: ErrorSeverity.HIGH,
      code: 'CONTEXT_PROCESSING_FAILED',
      context,
      recoverable: true,
      retryable: true,
      userFriendly: false,
      telemetryData: { processingStage }
    }, originalError);
  }

  getGenericMessage(): string {
    return 'We encountered an issue processing your request context. Please try again.';
  }
}

export class KnowledgeBaseError extends ContextProcessingError {
  constructor(
    message: string,
    context: ErrorContext,
    knowledgeEntryId?: string,
    originalError?: Error
  ) {
    super(message, context, 'knowledge_base', originalError);
    this.metadata.code = 'KNOWLEDGE_BASE_ERROR';
    this.metadata.telemetryData = { knowledgeEntryId };
  }
}

export class WorkflowContinuityError extends ContextProcessingError {
  constructor(
    message: string,
    context: ErrorContext,
    sessionId?: string,
    originalError?: Error
  ) {
    super(message, context, 'workflow_continuity', originalError);
    this.metadata.code = 'WORKFLOW_CONTINUITY_ERROR';
    this.metadata.telemetryData = { sessionId };
  }
}

/**
 * Template Processing Errors
 */
export class TemplateProcessingError extends BaseFramePromptlyError {
  constructor(
    message: string,
    context: ErrorContext,
    templateId?: string,
    originalError?: Error
  ) {
    super(message, {
      category: ErrorCategory.TEMPLATE_PROCESSING,
      severity: ErrorSeverity.HIGH,
      code: 'TEMPLATE_PROCESSING_FAILED',
      context,
      recoverable: true,
      retryable: true,
      userFriendly: false,
      telemetryData: { templateId }
    }, originalError);
  }

  getGenericMessage(): string {
    return 'We encountered an issue processing the template. Please try again.';
  }
}

export class TemplateNotFoundError extends TemplateProcessingError {
  constructor(
    templateId: string,
    context: ErrorContext
  ) {
    super(`Template not found: ${templateId}`, context, templateId);
    this.metadata.code = 'TEMPLATE_NOT_FOUND';
    this.metadata.severity = ErrorSeverity.MEDIUM;
    this.metadata.userFriendly = true;
  }

  getUserFriendlyMessage(): string {
    return 'The requested template is not available. Please select a different tool or contact support.';
  }
}

/**
 * Prompt Generation Errors
 */
export class PromptGenerationError extends BaseFramePromptlyError {
  constructor(
    message: string,
    context: ErrorContext,
    generationStage?: string,
    originalError?: Error
  ) {
    super(message, {
      category: ErrorCategory.PROMPT_GENERATION,
      severity: ErrorSeverity.HIGH,
      code: 'PROMPT_GENERATION_FAILED',
      context,
      recoverable: true,
      retryable: true,
      userFriendly: false,
      telemetryData: { generationStage }
    }, originalError);
  }

  getGenericMessage(): string {
    return 'We encountered an issue generating your prompt. Please try again.';
  }
}

export class EnhancedPromptGenerationError extends PromptGenerationError {
  constructor(
    message: string,
    context: ErrorContext,
    enhancementType?: string,
    originalError?: Error
  ) {
    super(message, context, 'enhanced_generation', originalError);
    this.metadata.code = 'ENHANCED_PROMPT_GENERATION_FAILED';
    this.metadata.telemetryData = { enhancementType };
  }
}

/**
 * Database Errors
 */
export class DatabaseError extends BaseFramePromptlyError {
  constructor(
    message: string,
    context: ErrorContext,
    operation?: string,
    originalError?: Error
  ) {
    super(message, {
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
      code: 'DATABASE_ERROR',
      context,
      recoverable: true,
      retryable: true,
      userFriendly: false,
      telemetryData: { operation }
    }, originalError);
  }

  getGenericMessage(): string {
    return 'We encountered a temporary issue. Please try again in a moment.';
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(
    context: ErrorContext,
    originalError?: Error
  ) {
    super('Database connection failed', context, 'connection', originalError);
    this.metadata.code = 'DATABASE_CONNECTION_FAILED';
    this.metadata.severity = ErrorSeverity.CRITICAL;
  }
}

/**
 * Network Errors
 */
export class NetworkError extends BaseFramePromptlyError {
  constructor(
    message: string,
    context: ErrorContext,
    statusCode?: number,
    originalError?: Error
  ) {
    super(message, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      code: 'NETWORK_ERROR',
      context,
      recoverable: true,
      retryable: true,
      userFriendly: false,
      telemetryData: { statusCode }
    }, originalError);
  }

  getGenericMessage(): string {
    return 'Network connection issue. Please check your connection and try again.';
  }
}

export class ExternalServiceError extends NetworkError {
  constructor(
    serviceName: string,
    message: string,
    context: ErrorContext,
    statusCode?: number,
    originalError?: Error
  ) {
    super(`${serviceName}: ${message}`, context, statusCode, originalError);
    this.metadata.code = 'EXTERNAL_SERVICE_ERROR';
    this.metadata.category = ErrorCategory.EXTERNAL_SERVICE;
    this.metadata.telemetryData = { serviceName, statusCode };
  }
}

/**
 * Authentication & Authorization Errors
 */
export class AuthenticationError extends BaseFramePromptlyError {
  constructor(
    message: string,
    context: ErrorContext,
    originalError?: Error
  ) {
    super(message, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      code: 'AUTHENTICATION_FAILED',
      context,
      recoverable: false,
      retryable: false,
      userFriendly: true
    }, originalError);
  }

  getGenericMessage(): string {
    return 'Please log in to continue.';
  }
}

export class AuthorizationError extends BaseFramePromptlyError {
  constructor(
    resource: string,
    context: ErrorContext,
    originalError?: Error
  ) {
    super(`Access denied to resource: ${resource}`, {
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.MEDIUM,
      code: 'AUTHORIZATION_FAILED',
      context,
      recoverable: false,
      retryable: false,
      userFriendly: true,
      telemetryData: { resource }
    }, originalError);
  }

  getGenericMessage(): string {
    return 'You do not have permission to perform this action.';
  }
}

/**
 * Accessibility Errors
 */
export class AccessibilityError extends BaseFramePromptlyError {
  constructor(
    message: string,
    context: ErrorContext,
    accessibilityRule?: string,
    originalError?: Error
  ) {
    super(message, {
      category: ErrorCategory.ACCESSIBILITY,
      severity: ErrorSeverity.MEDIUM,
      code: 'ACCESSIBILITY_VIOLATION',
      context,
      recoverable: true,
      retryable: false,
      userFriendly: true,
      telemetryData: { accessibilityRule }
    }, originalError);
  }

  getGenericMessage(): string {
    return 'This content may not be accessible to all users. Please review accessibility guidelines.';
  }
}

/**
 * System Errors
 */
export class SystemError extends BaseFramePromptlyError {
  constructor(
    message: string,
    context: ErrorContext,
    component?: string,
    originalError?: Error
  ) {
    super(message, {
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.CRITICAL,
      code: 'SYSTEM_ERROR',
      context,
      recoverable: false,
      retryable: true,
      userFriendly: false,
      telemetryData: { component }
    }, originalError);
  }

  getGenericMessage(): string {
    return 'A system error occurred. Our team has been notified. Please try again later.';
  }
}

/**
 * Error Factory Functions
 */
export const createValidationError = (
  message: string,
  context: ErrorContext,
  fieldName?: string,
  originalError?: Error
): ValidationError => new ValidationError(message, context, fieldName, originalError);

export const createContextProcessingError = (
  message: string,
  context: ErrorContext,
  processingStage?: string,
  originalError?: Error
): ContextProcessingError => new ContextProcessingError(message, context, processingStage, originalError);

export const createTemplateProcessingError = (
  message: string,
  context: ErrorContext,
  templateId?: string,
  originalError?: Error
): TemplateProcessingError => new TemplateProcessingError(message, context, templateId, originalError);

export const createPromptGenerationError = (
  message: string,
  context: ErrorContext,
  generationStage?: string,
  originalError?: Error
): PromptGenerationError => new PromptGenerationError(message, context, generationStage, originalError);

export const createDatabaseError = (
  message: string,
  context: ErrorContext,
  operation?: string,
  originalError?: Error
): DatabaseError => new DatabaseError(message, context, operation, originalError);

export const createNetworkError = (
  message: string,
  context: ErrorContext,
  statusCode?: number,
  originalError?: Error
): NetworkError => new NetworkError(message, context, statusCode, originalError);

/**
 * Error Type Guards
 */
export const isFramePromptlyError = (error: any): error is BaseFramePromptlyError => {
  return error instanceof BaseFramePromptlyError;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isContextProcessingError = (error: any): error is ContextProcessingError => {
  return error instanceof ContextProcessingError;
};

export const isTemplateProcessingError = (error: any): error is TemplateProcessingError => {
  return error instanceof TemplateProcessingError;
};

export const isPromptGenerationError = (error: any): error is PromptGenerationError => {
  return error instanceof PromptGenerationError;
};

export const isDatabaseError = (error: any): error is DatabaseError => {
  return error instanceof DatabaseError;
};

export const isNetworkError = (error: any): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isRetryableError = (error: any): boolean => {
  return isFramePromptlyError(error) && error.metadata.retryable;
};

export const isCriticalError = (error: any): boolean => {
  return isFramePromptlyError(error) && error.metadata.severity === ErrorSeverity.CRITICAL;
};