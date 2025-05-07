type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  info(message: string, data?: any, context?: string) {
    const entry = this.formatLog('info', message, data, context);
    this.addLog(entry);
    console.log(`[INFO] ${message}`, data || '');
  }

  warn(message: string, data?: any, context?: string) {
    const entry = this.formatLog('warn', message, data, context);
    this.addLog(entry);
    console.warn(`[WARN] ${message}`, data || '');
  }

  error(message: string, data?: any, context?: string) {
    const entry = this.formatLog('error', message, data, context);
    this.addLog(entry);
    console.error(`[ERROR] ${message}`, data || '');
  }

  debug(message: string, data?: any, context?: string) {
    const entry = this.formatLog('debug', message, data, context);
    this.addLog(entry);
    console.debug(`[DEBUG] ${message}`, data || '');
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
