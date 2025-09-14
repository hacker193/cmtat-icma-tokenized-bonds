/**
 * Enhanced logging system for chart components with development tools
 * Provides performance monitoring, error tracking, and debugging capabilities
 */

import { ChartValidationError, ChartDataError } from './chartValidation';
import { ErrorType, ErrorSeverity, classifyError } from './errorRecovery';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
  chartName?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  dataProcessingTime: number;
  validationTime: number;
  totalTime: number;
  dataSize: number;
  errorCount: number;
  timestamp: string;
}

export interface ChartDiagnostics {
  componentName: string;
  dataHealth: {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    dataSize: number;
    lastUpdate: string;
  };
  performance: {
    averageRenderTime: number;
    slowestRender: number;
    fastestRender: number;
    totalRenders: number;
  };
  errors: {
    recent: LogEntry[];
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

class ChartLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private performanceMetrics: Map<string, PerformanceMetrics[]> = new Map();
  private sessionId: string;
  private isProduction: boolean;
  private enabledCategories: Set<string> = new Set();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === 'production';

    // Enable all categories in development
    if (!this.isProduction) {
      this.enabledCategories = new Set(['chart', 'validation', 'performance', 'error', 'debug']);
    } else {
      this.enabledCategories = new Set(['error', 'performance']);
    }

    // Setup performance observer
    this.setupPerformanceObserver();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name.startsWith('chart-')) {
              this.logPerformanceEntry(entry);
            }
          });
        });
        observer.observe({ entryTypes: ['measure', 'mark'] });
      } catch (error) {
        console.warn('Performance Observer not available:', error);
      }
    }
  }

  private logPerformanceEntry(entry: PerformanceEntry) {
    this.log(LogLevel.DEBUG, 'performance', `${entry.name}: ${entry.duration}ms`, {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime
    });
  }

  private shouldLog(level: LogLevel, category: string): boolean {
    // Always log errors and critical issues
    if (level >= LogLevel.ERROR) {
      return true;
    }

    // Check if category is enabled
    if (!this.enabledCategories.has(category)) {
      return false;
    }

    // In production, only log warnings and above
    if (this.isProduction && level < LogLevel.WARN) {
      return false;
    }

    return true;
  }

  log(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    chartName?: string,
    error?: Error
  ): void {
    if (!this.shouldLog(level, category)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      error,
      chartName,
      sessionId: this.sessionId,
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        viewport: typeof window !== 'undefined'
          ? `${window.innerWidth}x${window.innerHeight}`
          : 'unknown'
      }
    };

    this.logs.push(logEntry);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (!this.isProduction) {
      this.consoleOutput(logEntry);
    }

    // Send critical errors to external service
    if (level >= LogLevel.CRITICAL) {
      this.sendToExternalService(logEntry);
    }
  }

  private consoleOutput(entry: LogEntry): void {
    const prefix = `[${entry.category.toUpperCase()}] ${entry.chartName || 'Chart'}:`;
    const style = this.getConsoleStyle(entry.level);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${prefix}`, style, entry.message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(`%c${prefix}`, style, entry.message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(`%c${prefix}`, style, entry.message, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(`%c${prefix}`, style, entry.message, entry.error || entry.data);
        break;
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: #666; font-weight: normal;';
      case LogLevel.INFO:
        return 'color: #0066cc; font-weight: bold;';
      case LogLevel.WARN:
        return 'color: #ff8c00; font-weight: bold;';
      case LogLevel.ERROR:
        return 'color: #cc0000; font-weight: bold;';
      case LogLevel.CRITICAL:
        return 'color: white; background-color: #cc0000; font-weight: bold; padding: 2px 4px;';
      default:
        return '';
    }
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // This would integrate with your error reporting service
      // For now, we'll just log to console
      console.error('Critical error reported:', entry);

      // Example integration with a service like Sentry, LogRocket, etc.
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.error('Failed to send error to external service:', error);
    }
  }

  // Convenience methods for different log levels
  debug(category: string, message: string, data?: any, chartName?: string): void {
    this.log(LogLevel.DEBUG, category, message, data, chartName);
  }

  info(category: string, message: string, data?: any, chartName?: string): void {
    this.log(LogLevel.INFO, category, message, data, chartName);
  }

  warn(category: string, message: string, data?: any, chartName?: string): void {
    this.log(LogLevel.WARN, category, message, data, chartName);
  }

  error(category: string, message: string, error?: Error, chartName?: string): void {
    this.log(LogLevel.ERROR, category, message, undefined, chartName, error);
  }

  critical(category: string, message: string, error?: Error, chartName?: string): void {
    this.log(LogLevel.CRITICAL, category, message, undefined, chartName, error);
  }

  // Performance tracking methods
  startPerformanceMeasure(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }

  endPerformanceMeasure(name: string, chartName?: string): number {
    if (typeof performance !== 'undefined') {
      try {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);

        const measure = performance.getEntriesByName(name, 'measure')[0];
        if (measure) {
          this.debug('performance', `${name} completed in ${measure.duration.toFixed(2)}ms`, {
            duration: measure.duration,
            startTime: measure.startTime
          }, chartName);

          return measure.duration;
        }
      } catch (error) {
        this.warn('performance', 'Failed to measure performance', error, chartName);
      }
    }
    return 0;
  }

  recordPerformanceMetrics(metrics: PerformanceMetrics): void {
    const existing = this.performanceMetrics.get(metrics.componentName) || [];
    existing.push(metrics);

    // Keep only last 100 metrics per component
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }

    this.performanceMetrics.set(metrics.componentName, existing);

    this.debug('performance', 'Performance metrics recorded', metrics, metrics.componentName);
  }

  // Validation logging
  logValidationResult(
    chartName: string,
    dataType: string,
    isValid: boolean,
    errors: ChartValidationError[],
    warnings: string[],
    processingTime: number
  ): void {
    const level = isValid ? (warnings.length > 0 ? LogLevel.WARN : LogLevel.INFO) : LogLevel.ERROR;

    this.log(level, 'validation',
      `${dataType} validation ${isValid ? 'passed' : 'failed'} in ${processingTime.toFixed(2)}ms`,
      {
        dataType,
        isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
        errors: errors.map(e => ({ field: e.field, type: e.errorType, message: e.message })),
        warnings,
        processingTime
      },
      chartName
    );
  }

  // Error categorization and logging
  logChartError(
    chartName: string,
    error: Error,
    context: {
      operation?: string;
      dataSize?: number;
      userAction?: string;
      additionalInfo?: any;
    } = {}
  ): void {
    const metadata = classifyError(error);

    this.log(
      metadata.severity === ErrorSeverity.CRITICAL ? LogLevel.CRITICAL : LogLevel.ERROR,
      'error',
      `Chart error in ${context.operation || 'unknown operation'}: ${error.message}`,
      {
        errorType: metadata.type,
        severity: metadata.severity,
        isRecoverable: metadata.isRecoverable,
        retryable: metadata.retryable,
        stack: error.stack,
        context
      },
      chartName,
      error
    );
  }

  // Data health monitoring
  logDataHealth(
    chartName: string,
    dataType: string,
    metrics: {
      size: number;
      processingTime: number;
      validationErrors: number;
      warnings: number;
      cacheHit?: boolean;
      dataAge?: number;
    }
  ): void {
    this.info('data-health',
      `${dataType} health check completed`,
      {
        dataType,
        ...metrics
      },
      chartName
    );
  }

  // Query and analysis methods
  getLogs(
    filters: {
      level?: LogLevel;
      category?: string;
      chartName?: string;
      since?: Date;
      limit?: number;
    } = {}
  ): LogEntry[] {
    let filteredLogs = this.logs;

    if (filters.level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= filters.level!);
    }

    if (filters.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category);
    }

    if (filters.chartName) {
      filteredLogs = filteredLogs.filter(log => log.chartName === filters.chartName);
    }

    if (filters.since) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) >= filters.since!
      );
    }

    const limit = filters.limit || 100;
    return filteredLogs.slice(-limit);
  }

  getChartDiagnostics(chartName: string): ChartDiagnostics {
    const chartLogs = this.logs.filter(log => log.chartName === chartName);
    const chartMetrics = this.performanceMetrics.get(chartName) || [];

    const errorLogs = chartLogs.filter(log => log.level >= LogLevel.ERROR);
    const validationLogs = chartLogs.filter(log => log.category === 'validation');

    // Calculate error statistics
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    errorLogs.forEach(log => {
      if (log.error) {
        const metadata = classifyError(log.error);
        errorsByType[metadata.type] = (errorsByType[metadata.type] || 0) + 1;
        errorsBySeverity[metadata.severity] = (errorsBySeverity[metadata.severity] || 0) + 1;
      }
    });

    // Calculate performance statistics
    const renderTimes = chartMetrics.map(m => m.renderTime);
    const avgRenderTime = renderTimes.length > 0
      ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
      : 0;

    // Get latest validation data
    const latestValidation = validationLogs[validationLogs.length - 1];
    const validationData = latestValidation?.data || {};

    return {
      componentName: chartName,
      dataHealth: {
        isValid: validationData.isValid !== false,
        errorCount: validationData.errorCount || 0,
        warningCount: validationData.warningCount || 0,
        dataSize: validationData.dataSize || 0,
        lastUpdate: latestValidation?.timestamp || 'unknown'
      },
      performance: {
        averageRenderTime: avgRenderTime,
        slowestRender: Math.max(...renderTimes, 0),
        fastestRender: Math.min(...renderTimes, 0),
        totalRenders: chartMetrics.length
      },
      errors: {
        recent: errorLogs.slice(-10),
        byType: errorsByType,
        bySeverity: errorsBySeverity
      }
    };
  }

  // Export logs for analysis
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'category', 'chartName', 'message'];
      const csvData = this.logs.map(log => [
        log.timestamp,
        LogLevel[log.level],
        log.category,
        log.chartName || '',
        log.message.replace(/"/g, '""') // Escape quotes
      ]);

      return [headers, ...csvData].map(row =>
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
    }

    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    this.performanceMetrics.clear();
  }

  // Enable/disable categories
  enableCategory(category: string): void {
    this.enabledCategories.add(category);
  }

  disableCategory(category: string): void {
    this.enabledCategories.delete(category);
  }

  // Get system status
  getSystemStatus() {
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;
    const recentLogs = this.logs.filter(log =>
      new Date(log.timestamp).getTime() > lastHour
    );

    return {
      sessionId: this.sessionId,
      totalLogs: this.logs.length,
      recentLogs: recentLogs.length,
      errorRate: recentLogs.filter(log => log.level >= LogLevel.ERROR).length / Math.max(recentLogs.length, 1),
      enabledCategories: Array.from(this.enabledCategories),
      memoryUsage: {
        logs: this.logs.length,
        performanceMetrics: Array.from(this.performanceMetrics.values()).flat().length
      }
    };
  }
}

// Singleton instance
export const chartLogger = new ChartLogger();

// Development tools - only available in development
export const devTools = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? {
  // Attach logger to window for console access
  attachToWindow() {
    if (typeof window !== 'undefined') {
      (window as any).chartLogger = chartLogger;
      console.info('Chart logger attached to window.chartLogger');
    }
  },

  // Performance profiler
  profileChart(chartName: string) {
    const startTime = performance.now();
    chartLogger.startPerformanceMeasure(`profile-${chartName}`);

    return {
      end: () => {
        const duration = chartLogger.endPerformanceMeasure(`profile-${chartName}`, chartName);
        console.info(`${chartName} profile completed in ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  },

  // Memory usage tracker
  trackMemory(chartName: string) {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      chartLogger.debug('memory', 'Memory usage tracked', {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }, chartName);
    }
  },

  // Generate debug report
  generateDebugReport(chartName?: string) {
    const report = {
      timestamp: new Date().toISOString(),
      systemStatus: chartLogger.getSystemStatus(),
      diagnostics: chartName ? chartLogger.getChartDiagnostics(chartName) : null,
      recentErrors: chartLogger.getLogs({ level: LogLevel.ERROR, limit: 20 }),
      performanceMetrics: chartName ? chartLogger['performanceMetrics'].get(chartName) || [] : null
    };

    console.group('Chart Debug Report');
    console.log('System Status:', report.systemStatus);
    if (report.diagnostics) {
      console.log('Chart Diagnostics:', report.diagnostics);
    }
    console.log('Recent Errors:', report.recentErrors);
    console.groupEnd();

    return report;
  }
} : {};

export default chartLogger;