/**
 * @fileoverview Template Caching Service
 * High-performance template caching with optimization, preprocessing, and validation
 */

import { EnhancedToolPromptTemplate, PromptVariable } from '@/lib/tool-templates-enhanced';
import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';
import { ProcessedTemplate } from '@/lib/enhanced-variable-handler';
import { errorHandler } from '@/lib/error-handling/error-handler';
import { 
  TemplateProcessingError, 
  TemplateValidationError,
  SystemError 
} from '@/lib/error-handling/error-types';

// Simple browser-compatible LRU Cache implementation
interface CacheOptions {
  max: number;
  ttl: number;
  maxSize?: number;
  sizeCalculation?: (entry: any) => number;
  dispose?: (entry: any, key: string) => void;
}

class SimpleLRUCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number; size: number }>();
  private options: CacheOptions;

  constructor(options: CacheOptions) {
    this.options = options;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.timestamp > this.options.ttl) {
      this.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }

  set(key: K, value: V): void {
    const size = this.options.sizeCalculation ? this.options.sizeCalculation(value) : 1;
    const entry = { value, timestamp: Date.now(), size };

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Check if we need to evict
    while (this.cache.size >= this.options.max) {
      const firstKey = this.cache.keys().next().value;
      const firstEntry = this.cache.get(firstKey);
      this.cache.delete(firstKey);
      
      if (this.options.dispose && firstEntry) {
        this.options.dispose(firstEntry.value, firstKey as string);
      }
    }

    this.cache.set(key, entry);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  values(): IterableIterator<{ value: V; timestamp: number; size: number }> {
    return this.cache.values();
  }

  entries(): IterableIterator<[K, { value: V; timestamp: number; size: number }]> {
    return this.cache.entries();
  }

  purgeStale(): void {
    const now = Date.now();
    for (const [key, cacheItem] of this.cache.entries()) {
      if (now - cacheItem.timestamp > this.options.ttl) {
        this.delete(key);
      }
    }
  }
}

export interface CacheEntry {
  template: EnhancedToolPromptTemplate;
  metadata: CacheMetadata;
  processedVersions: Map<string, ProcessedCacheEntry>; // Hash of inputs -> processed template
  validationResult: ValidationResult;
  optimizations: TemplateOptimizations;
}

export interface ProcessedCacheEntry {
  processedTemplate: ProcessedTemplate;
  inputHash: string;
  timestamp: Date;
  hitCount: number;
  lastAccessed: Date;
}

export interface CacheMetadata {
  id: string;
  version: string;
  createdAt: Date;
  lastModified: Date;
  lastAccessed: Date;
  hitCount: number;
  size: number; // in bytes
  preprocessingTime: number; // in ms
  validationTime: number; // in ms
  dependencies: string[]; // IDs of dependent templates or resources
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
  lastValidated: Date;
}

export interface ValidationError {
  type: 'syntax' | 'semantic' | 'accessibility' | 'variable' | 'dependency';
  message: string;
  severity: 'error' | 'warning' | 'info';
  location?: { line: number; column: number };
  suggestion?: string;
}

export interface ValidationWarning extends Omit<ValidationError, 'severity'> {
  severity: 'warning' | 'info';
}

export interface TemplateOptimizations {
  hasStaticContent: boolean;
  staticContentRatio: number;
  variableComplexity: 'low' | 'medium' | 'high';
  estimatedProcessingTime: number; // in ms
  recommendedCacheStrategy: 'aggressive' | 'standard' | 'minimal';
  compressionRatio?: number;
  minifiedVersion?: string;
}

export interface CacheConfiguration {
  maxEntries: number;
  maxAge: number; // in ms
  maxSize: number; // in bytes
  enableCompression: boolean;
  enablePreprocessing: boolean;
  enableValidation: boolean;
  validationInterval: number; // in ms
  optimizationLevel: 'none' | 'basic' | 'aggressive';
  persistToDisk: boolean;
  metricsEnabled: boolean;
}

export interface CacheStatistics {
  totalEntries: number;
  totalSize: number; // in bytes
  hitRate: number;
  missRate: number;
  averageProcessingTime: number; // in ms
  compressionRatio: number;
  validationSuccessRate: number;
  mostAccessedTemplates: { templateId: string; hits: number }[];
  leastAccessedTemplates: { templateId: string; hits: number }[];
  memoryUsage: {
    templates: number;
    processedVersions: number;
    metadata: number;
    total: number;
  };
}

/**
 * High-Performance Template Cache Service
 */
export class TemplateCacheService {
  private cache: SimpleLRUCache<string, CacheEntry>;
  private processedCache: SimpleLRUCache<string, ProcessedCacheEntry>;
  private config: CacheConfiguration;
  private statistics: CacheStatistics;
  private validationInterval?: number;
  private compressionEnabled: boolean = false;

  constructor(config: Partial<CacheConfiguration> = {}) {
    this.config = {
      maxEntries: 500,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 50 * 1024 * 1024, // 50MB
      enableCompression: true,
      enablePreprocessing: true,
      enableValidation: true,
      validationInterval: 60 * 60 * 1000, // 1 hour
      optimizationLevel: 'basic',
      persistToDisk: false,
      metricsEnabled: true,
      ...config
    };

    this.cache = new SimpleLRUCache({
      max: this.config.maxEntries,
      ttl: this.config.maxAge,
      maxSize: this.config.maxSize,
      sizeCalculation: (entry) => this.calculateEntrySize(entry),
      dispose: (entry, key) => this.onCacheEntryDisposed(entry, key)
    });

    this.processedCache = new SimpleLRUCache({
      max: this.config.maxEntries * 5, // Allow more processed versions
      ttl: this.config.maxAge / 2, // Shorter TTL for processed versions
      dispose: (entry, key) => this.onProcessedEntryDisposed(entry, key)
    });

    this.statistics = this.initializeStatistics();
    this.initializeService();
  }

  /**
   * Get template from cache or create new cache entry
   */
  async getTemplate(
    templateId: string,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<EnhancedToolPromptTemplate | null> {
    const cacheKey = this.generateCacheKey(templateId, framework.id, stage.id, tool.id);

    try {
      const entry = this.cache.get(cacheKey);
      
      if (entry) {
        // Update access statistics
        entry.metadata.lastAccessed = new Date();
        entry.metadata.hitCount++;
        this.updateHitStatistics(true);
        
        // Validate if needed
        if (this.shouldRevalidate(entry)) {
          await this.validateTemplate(entry);
        }

        return entry.template;
      }

      this.updateHitStatistics(false);
      return null;
    } catch (error) {
      await errorHandler.handleError(error, {
        templateId,
        frameworkId: framework.id,
        stageId: stage.id,
        toolId: tool.id
      });
      return null;
    }
  }

  /**
   * Store template in cache with optimization and validation
   */
  async storeTemplate(
    templateId: string,
    template: EnhancedToolPromptTemplate,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<boolean> {
    const cacheKey = this.generateCacheKey(templateId, framework.id, stage.id, tool.id);

    try {
      const startTime = performance.now();

      // Validate template
      const validationResult = await this.validateTemplate({ template } as CacheEntry);
      
      if (!validationResult.isValid && validationResult.errors.some(e => e.severity === 'error')) {
        throw new TemplateValidationError(
          templateId,
          `Template validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`,
          { templateId }
        );
      }

      // Apply optimizations
      const optimizations = await this.analyzeAndOptimizeTemplate(template);

      // Create cache entry
      const entry: CacheEntry = {
        template: this.config.enablePreprocessing ? await this.preprocessTemplate(template) : template,
        metadata: {
          id: templateId,
          version: this.generateVersion(template),
          createdAt: new Date(),
          lastModified: new Date(),
          lastAccessed: new Date(),
          hitCount: 0,
          size: this.calculateTemplateSize(template),
          preprocessingTime: performance.now() - startTime,
          validationTime: validationResult.lastValidated.getTime() - startTime,
          dependencies: this.extractDependencies(template)
        },
        processedVersions: new Map(),
        validationResult,
        optimizations
      };

      // Store in cache
      this.cache.set(cacheKey, entry);

      // Update statistics
      this.updateStatistics();

      return true;
    } catch (error) {
      await errorHandler.handleError(error, {
        templateId,
        frameworkId: framework.id,
        stageId: stage.id,
        toolId: tool.id
      });
      return false;
    }
  }

  /**
   * Get processed template from cache
   */
  async getProcessedTemplate(
    templateId: string,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool,
    userInputs: Record<string, any>
  ): Promise<ProcessedTemplate | null> {
    const cacheKey = this.generateCacheKey(templateId, framework.id, stage.id, tool.id);
    const inputHash = this.hashInputs(userInputs);
    const processedKey = `${cacheKey}:${inputHash}`;

    try {
      const processedEntry = this.processedCache.get(processedKey);
      
      if (processedEntry) {
        processedEntry.hitCount++;
        processedEntry.lastAccessed = new Date();
        return processedEntry.processedTemplate;
      }

      return null;
    } catch (error) {
      await errorHandler.handleError(error, {
        templateId,
        inputHash
      });
      return null;
    }
  }

  /**
   * Store processed template in cache
   */
  async storeProcessedTemplate(
    templateId: string,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool,
    userInputs: Record<string, any>,
    processedTemplate: ProcessedTemplate
  ): Promise<boolean> {
    const cacheKey = this.generateCacheKey(templateId, framework.id, stage.id, tool.id);
    const inputHash = this.hashInputs(userInputs);
    const processedKey = `${cacheKey}:${inputHash}`;

    try {
      const processedEntry: ProcessedCacheEntry = {
        processedTemplate,
        inputHash,
        timestamp: new Date(),
        hitCount: 0,
        lastAccessed: new Date()
      };

      this.processedCache.set(processedKey, processedEntry);

      // Also update the main cache entry
      const mainEntry = this.cache.get(cacheKey);
      if (mainEntry) {
        mainEntry.processedVersions.set(inputHash, processedEntry);
      }

      return true;
    } catch (error) {
      await errorHandler.handleError(error, {
        templateId,
        inputHash
      });
      return false;
    }
  }

  /**
   * Invalidate cache entries
   */
  async invalidate(
    templateId?: string,
    frameworkId?: string,
    stageId?: string,
    toolId?: string
  ): Promise<void> {
    try {
      if (!templateId && !frameworkId && !stageId && !toolId) {
        // Clear all caches
        this.cache.clear();
        this.processedCache.clear();
        this.statistics = this.initializeStatistics();
        return;
      }

      const keysToDelete: string[] = [];
      const processedKeysToDelete: string[] = [];

      // Find matching cache keys
      for (const key of this.cache.keys()) {
        if (this.matchesCriteria(key, templateId, frameworkId, stageId, toolId)) {
          keysToDelete.push(key);
        }
      }

      for (const key of this.processedCache.keys()) {
        if (this.matchesCriteria(key, templateId, frameworkId, stageId, toolId)) {
          processedKeysToDelete.push(key);
        }
      }

      // Delete matching entries
      keysToDelete.forEach(key => this.cache.delete(key));
      processedKeysToDelete.forEach(key => this.processedCache.delete(key));

      this.updateStatistics();
    } catch (error) {
      await errorHandler.handleError(error, {
        templateId,
        frameworkId,
        stageId,
        toolId
      });
    }
  }

  /**
   * Get cache statistics
   */
  getStatistics(): CacheStatistics {
    return { ...this.statistics };
  }

  /**
   * Optimize cache performance
   */
  async optimizeCache(): Promise<void> {
    try {
      const startTime = performance.now();

      // Remove expired entries
      this.cache.purgeStale();
      this.processedCache.purgeStale();

      // Revalidate entries that need validation
      const entriesToValidate: Array<[string, CacheEntry]> = [];
      for (const [key, cacheItem] of this.cache.entries()) {
        if (this.shouldRevalidate(cacheItem.value)) {
          entriesToValidate.push([key, cacheItem.value]);
        }
      }

      // Validate in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < entriesToValidate.length; i += batchSize) {
        const batch = entriesToValidate.slice(i, i + batchSize);
        await Promise.all(
          batch.map(([key, entry]) => this.validateTemplate(entry))
        );
      }

      // Update statistics
      this.updateStatistics();

      const optimizationTime = performance.now() - startTime;
      console.log(`Cache optimization completed in ${optimizationTime.toFixed(2)}ms`);
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'cache_optimization' }
      });
    }
  }

  /**
   * Preload frequently used templates
   */
  async preloadTemplates(templateIds: string[]): Promise<void> {
    try {
      // This would typically load templates from a template service
      console.log(`Preloading ${templateIds.length} templates...`);
      
      // For now, this is a placeholder for the actual preloading logic
      // In a real implementation, this would fetch templates from the template service
      // and populate the cache proactively
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'template_preloading', templateCount: templateIds.length }
      });
    }
  }

  /**
   * Export cache data for persistence
   */
  exportCacheData(): any {
    const cacheData = {
      templates: Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]),
      processedTemplates: Array.from(this.processedCache.entries()).map(([key, item]) => [key, item.value]),
      statistics: this.statistics,
      timestamp: new Date().toISOString()
    };

    return cacheData;
  }

  /**
   * Import cache data from persistence
   */
  async importCacheData(data: any): Promise<boolean> {
    try {
      if (!data || !Array.isArray(data.templates)) {
        throw new Error('Invalid cache data format');
      }

      // Clear existing cache
      this.cache.clear();
      this.processedCache.clear();

      // Import templates
      for (const [key, entry] of data.templates) {
        this.cache.set(key, entry);
      }

      // Import processed templates
      if (Array.isArray(data.processedTemplates)) {
        for (const [key, entry] of data.processedTemplates) {
          this.processedCache.set(key, entry);
        }
      }

      // Import statistics
      if (data.statistics) {
        this.statistics = { ...this.statistics, ...data.statistics };
      }

      console.log(`Imported cache data with ${data.templates.length} templates`);
      return true;
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'cache_import' }
      });
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }
    
    this.cache.clear();
    this.processedCache.clear();
  }

  // Private helper methods

  private initializeService(): void {
    // Set up periodic validation if enabled
    if (this.config.enableValidation && this.config.validationInterval > 0) {
      this.validationInterval = setInterval(() => {
        this.performPeriodicValidation();
      }, this.config.validationInterval);
    }

    console.log('Template Cache Service initialized with config:', this.config);
  }

  private initializeStatistics(): CacheStatistics {
    return {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      averageProcessingTime: 0,
      compressionRatio: 0,
      validationSuccessRate: 0,
      mostAccessedTemplates: [],
      leastAccessedTemplates: [],
      memoryUsage: {
        templates: 0,
        processedVersions: 0,
        metadata: 0,
        total: 0
      }
    };
  }

  private async validateTemplate(entry: CacheEntry): Promise<ValidationResult> {
    const startTime = performance.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      const { template } = entry;

      // Syntax validation
      if (!template.template || typeof template.template !== 'string') {
        errors.push({
          type: 'syntax',
          message: 'Template content is missing or invalid',
          severity: 'error'
        });
      }

      // Variable validation
      if (template.variables) {
        template.variables.forEach((variable, index) => {
          if (!variable.id || !variable.name) {
            errors.push({
              type: 'variable',
              message: `Variable at index ${index} is missing required fields`,
              severity: 'error'
            });
          }

          if (variable.required && !variable.defaultValue && !variable.validation) {
            warnings.push({
              type: 'variable',
              message: `Required variable '${variable.id}' has no validation or default value`,
              severity: 'warning'
            });
          }
        });
      }

      // Accessibility validation
      if (template.accessibilityInstructions) {
        if (template.accessibilityInstructions.length === 0) {
          warnings.push({
            type: 'accessibility',
            message: 'No accessibility instructions provided',
            severity: 'warning'
          });
        }
      }

      // Semantic validation
      const templateContent = template.template.toLowerCase();
      const accessibilityKeywords = ['accessible', 'screen reader', 'keyboard', 'aria', 'wcag'];
      const hasAccessibilityContent = accessibilityKeywords.some(keyword => 
        templateContent.includes(keyword)
      );

      if (!hasAccessibilityContent) {
        warnings.push({
          type: 'semantic',
          message: 'Template may lack accessibility considerations',
          severity: 'info'
        });
      }

      const validationTime = performance.now() - startTime;
      const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        score,
        lastValidated: new Date()
      };

      entry.validationResult = result;
      entry.metadata.validationTime = validationTime;

      return result;
    } catch (error) {
      throw new TemplateValidationError(
        entry.metadata.id,
        `Template validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { templateId: entry.metadata.id }
      );
    }
  }

  private async analyzeAndOptimizeTemplate(template: EnhancedToolPromptTemplate): Promise<TemplateOptimizations> {
    const templateContent = template.template;
    const staticContentMatches = templateContent.match(/[^{]*(?=\{|$)/g) || [];
    const variableMatches = templateContent.match(/\{[^}]+\}/g) || [];
    
    const staticContentLength = staticContentMatches.join('').length;
    const totalLength = templateContent.length;
    const staticContentRatio = totalLength > 0 ? staticContentLength / totalLength : 0;

    const variableComplexity = this.assessVariableComplexity(template.variables || []);
    const estimatedProcessingTime = this.estimateProcessingTime(template);

    let recommendedCacheStrategy: 'aggressive' | 'standard' | 'minimal' = 'standard';
    if (staticContentRatio > 0.8 && variableComplexity === 'low') {
      recommendedCacheStrategy = 'aggressive';
    } else if (staticContentRatio < 0.3 || variableComplexity === 'high') {
      recommendedCacheStrategy = 'minimal';
    }

    return {
      hasStaticContent: staticContentRatio > 0.1,
      staticContentRatio,
      variableComplexity,
      estimatedProcessingTime,
      recommendedCacheStrategy
    };
  }

  private async preprocessTemplate(template: EnhancedToolPromptTemplate): Promise<EnhancedToolPromptTemplate> {
    // Create a copy to avoid mutating the original
    const preprocessed = JSON.parse(JSON.stringify(template));

    // Trim whitespace and normalize line endings
    preprocessed.template = preprocessed.template
      .replace(/\r\n/g, '\n')
      .replace(/\s+$/gm, '')
      .trim();

    // Optimize variable references
    if (preprocessed.variables) {
      preprocessed.variables = preprocessed.variables.map(variable => ({
        ...variable,
        description: variable.description?.trim(),
        placeholder: variable.placeholder?.trim()
      }));
    }

    return preprocessed;
  }

  private assessVariableComplexity(variables: PromptVariable[]): 'low' | 'medium' | 'high' {
    if (variables.length === 0) return 'low';
    if (variables.length > 10) return 'high';
    
    const hasComplexValidation = variables.some(v => 
      v.validation && (v.validation.pattern || v.validation.customValidator)
    );
    
    const hasDependencies = variables.some(v => 
      v.dependencies && v.dependencies.length > 0
    );

    if (hasComplexValidation || hasDependencies) return 'high';
    if (variables.length > 5) return 'medium';
    
    return 'low';
  }

  private estimateProcessingTime(template: EnhancedToolPromptTemplate): number {
    const baseTime = 10; // Base processing time in ms
    const variableTime = (template.variables?.length || 0) * 2;
    const contentComplexity = Math.floor(template.template.length / 100);
    
    return baseTime + variableTime + contentComplexity;
  }

  private generateCacheKey(templateId: string, frameworkId: string, stageId: string, toolId: string): string {
    return `${templateId}:${frameworkId}:${stageId}:${toolId}`;
  }

  private generateVersion(template: EnhancedToolPromptTemplate): string {
    const content = JSON.stringify(template);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private hashInputs(inputs: Record<string, any>): string {
    const content = JSON.stringify(inputs, Object.keys(inputs).sort());
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private calculateEntrySize(entry: CacheEntry): number {
    return JSON.stringify(entry).length * 2; // Rough estimate in bytes (UTF-16)
  }

  private calculateTemplateSize(template: EnhancedToolPromptTemplate): number {
    return JSON.stringify(template).length * 2;
  }

  private extractDependencies(template: EnhancedToolPromptTemplate): string[] {
    const dependencies: string[] = [];
    
    // Extract variable dependencies
    template.variables?.forEach(variable => {
      if (variable.dependencies) {
        dependencies.push(...variable.dependencies);
      }
    });

    return [...new Set(dependencies)]; // Remove duplicates
  }

  private shouldRevalidate(entry: CacheEntry): boolean {
    if (!this.config.enableValidation) return false;
    
    const timeSinceLastValidation = Date.now() - entry.validationResult.lastValidated.getTime();
    return timeSinceLastValidation > this.config.validationInterval;
  }

  private matchesCriteria(
    key: string,
    templateId?: string,
    frameworkId?: string,
    stageId?: string,
    toolId?: string
  ): boolean {
    const parts = key.split(':');
    
    if (templateId && parts[0] !== templateId) return false;
    if (frameworkId && parts[1] !== frameworkId) return false;
    if (stageId && parts[2] !== stageId) return false;
    if (toolId && parts[3] !== toolId) return false;
    
    return true;
  }

  private updateHitStatistics(hit: boolean): void {
    if (!this.config.metricsEnabled) return;
    
    const total = this.statistics.hitRate + this.statistics.missRate;
    if (hit) {
      this.statistics.hitRate = (this.statistics.hitRate * total + 1) / (total + 1);
    } else {
      this.statistics.missRate = (this.statistics.missRate * total + 1) / (total + 1);
    }
  }

  private updateStatistics(): void {
    if (!this.config.metricsEnabled) return;

    this.statistics.totalEntries = this.cache.size;
    this.statistics.totalSize = Array.from(this.cache.values())
      .reduce((sum, cacheItem) => sum + cacheItem.value.metadata.size, 0);

    // Update memory usage
    this.statistics.memoryUsage.templates = this.cache.size;
    this.statistics.memoryUsage.processedVersions = this.processedCache.size;
    this.statistics.memoryUsage.total = this.statistics.memoryUsage.templates + 
                                       this.statistics.memoryUsage.processedVersions;
  }

  private onCacheEntryDisposed(entry: CacheEntry, key: string): void {
    // Clean up processed versions for this template
    for (const [processedKey, processedItem] of this.processedCache.entries()) {
      if (processedKey.startsWith(key)) {
        this.processedCache.delete(processedKey);
      }
    }
  }

  private onProcessedEntryDisposed(entry: ProcessedCacheEntry, key: string): void {
    // Nothing special needed for processed entry disposal
  }

  private async performPeriodicValidation(): Promise<void> {
    try {
      const entriesToValidate = Array.from(this.cache.values())
        .filter(cacheItem => this.shouldRevalidate(cacheItem.value))
        .slice(0, 50); // Limit to avoid overwhelming the system

      for (const cacheItem of entriesToValidate) {
        await this.validateTemplate(cacheItem.value);
      }

      console.log(`Periodic validation completed for ${entriesToValidate.length} entries`);
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'periodic_validation' }
      });
    }
  }
}

// Export singleton instance
export const templateCacheService = new TemplateCacheService({
  maxEntries: 1000,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 100 * 1024 * 1024, // 100MB
  enableCompression: true,
  enablePreprocessing: true,
  enableValidation: true,
  validationInterval: 2 * 60 * 60 * 1000, // 2 hours
  optimizationLevel: 'basic',
  persistToDisk: false,
  metricsEnabled: true
});