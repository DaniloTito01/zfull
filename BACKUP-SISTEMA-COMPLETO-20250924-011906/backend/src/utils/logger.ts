// Sistema de Logging Avançado para Barbershop Pro
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  action: string;
  user_id?: string;
  barbershop_id?: string;
  message: string;
  data?: any;
  request_id?: string;
  session_id?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  performance?: {
    duration_ms: number;
    memory_usage?: number;
  };
}

class Logger {
  private logDir: string;
  private isProduction: boolean;

  constructor() {
    this.logDir = process.env.LOG_DIR || '/tmp/logs';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.ensureLogDirectories();
  }

  private ensureLogDirectories() {
    const dirs = [
      'backend/api',
      'backend/database',
      'backend/auth',
      'backend/middleware',
      'backend/routes',
      'backend/utils',
      'errors',
      'performance',
      'audit',
      'system'
    ];

    dirs.forEach(dir => {
      const fullPath = join(this.logDir, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString()
    }) + '\\n';
  }

  private getLogFileName(component: string, level?: LogLevel): string {
    const date = new Date().toISOString().split('T')[0];
    const suffix = level === LogLevel.ERROR ? '-error' : level === LogLevel.DEBUG ? '-debug' : '';
    return `${date}-${component}${suffix}.log`;
  }

  private writeToFile(component: string, entry: LogEntry) {
    try {
      const fileName = this.getLogFileName(component, entry.level);
      const logPath = join(this.logDir, 'backend', this.getComponentPath(component), fileName);

      appendFileSync(logPath, this.formatLogEntry(entry));

      // Se for erro, também salva no diretório de erros centralizado
      if (entry.level === LogLevel.ERROR) {
        const errorPath = join(this.logDir, 'errors', fileName);
        appendFileSync(errorPath, this.formatLogEntry(entry));
      }
    } catch (error) {
      console.error('Erro ao escrever log:', error);
    }
  }

  private getComponentPath(component: string): string {
    const componentMap: Record<string, string> = {
      'api': 'api',
      'database': 'database',
      'auth': 'auth',
      'middleware': 'middleware',
      'routes': 'routes',
      'utils': 'utils',
      'barbershops': 'api',
      'barbers': 'api',
      'clients': 'api',
      'appointments': 'api',
      'services': 'api',
      'products': 'api',
      'sales': 'api'
    };
    return componentMap[component] || 'api';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isProduction) return true;

    const levelPriority = {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3,
      [LogLevel.TRACE]: 4
    };

    const minLevel = process.env.LOG_LEVEL || LogLevel.INFO;
    return levelPriority[level] <= levelPriority[minLevel as LogLevel];
  }

  public log(entry: Partial<LogEntry>) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: entry.level || LogLevel.INFO,
      component: entry.component || 'unknown',
      action: entry.action || 'unknown',
      message: entry.message || '',
      ...entry
    };

    if (!this.shouldLog(logEntry.level)) return;

    // Console output para desenvolvimento
    if (!this.isProduction) {
      const color = this.getColorForLevel(logEntry.level);
      console.log(
        `\\x1b[${color}m[${logEntry.level}] ${logEntry.component}:${logEntry.action} - ${logEntry.message}\\x1b[0m`,
        logEntry.data ? logEntry.data : ''
      );
    }

    // Escrever em arquivo
    this.writeToFile(logEntry.component, logEntry);
  }

  private getColorForLevel(level: LogLevel): number {
    const colors = {
      [LogLevel.ERROR]: 31, // Red
      [LogLevel.WARN]: 33,  // Yellow
      [LogLevel.INFO]: 32,  // Green
      [LogLevel.DEBUG]: 36, // Cyan
      [LogLevel.TRACE]: 37  // White
    };
    return colors[level] || 37;
  }

  // Métodos de conveniência
  public error(component: string, action: string, message: string, error?: Error, data?: any) {
    this.log({
      level: LogLevel.ERROR,
      component,
      action,
      message,
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }

  public warn(component: string, action: string, message: string, data?: any) {
    this.log({
      level: LogLevel.WARN,
      component,
      action,
      message,
      data
    });
  }

  public info(component: string, action: string, message: string, data?: any) {
    this.log({
      level: LogLevel.INFO,
      component,
      action,
      message,
      data
    });
  }

  public debug(component: string, action: string, message: string, data?: any) {
    this.log({
      level: LogLevel.DEBUG,
      component,
      action,
      message,
      data
    });
  }

  public trace(component: string, action: string, message: string, data?: any) {
    this.log({
      level: LogLevel.TRACE,
      component,
      action,
      message,
      data
    });
  }

  // Log de performance
  public performance(component: string, action: string, duration_ms: number, data?: any) {
    this.log({
      level: LogLevel.INFO,
      component,
      action: `${action}_performance`,
      message: `${action} executado em ${duration_ms}ms`,
      data,
      performance: {
        duration_ms,
        memory_usage: process.memoryUsage().heapUsed
      }
    });

    // Salvar também em logs de performance
    const perfPath = join(this.logDir, 'performance', this.getLogFileName('performance'));
    try {
      appendFileSync(perfPath, this.formatLogEntry({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        component,
        action,
        message: `Performance: ${duration_ms}ms`,
        performance: { duration_ms }
      }));
    } catch (error) {
      console.error('Erro ao escrever log de performance:', error);
    }
  }

  // Log de auditoria
  public audit(component: string, action: string, user_id: string, barbershop_id?: string, data?: any) {
    const auditEntry = {
      level: LogLevel.INFO,
      component,
      action: `audit_${action}`,
      message: `Ação de auditoria: ${action}`,
      user_id,
      barbershop_id,
      data
    };

    this.log(auditEntry);

    // Salvar também em logs de auditoria
    const auditPath = join(this.logDir, 'audit', this.getLogFileName('audit'));
    try {
      appendFileSync(auditPath, this.formatLogEntry({
        ...auditEntry,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao escrever log de auditoria:', error);
    }
  }
}

// Instância singleton
export const logger = new Logger();

// Middleware para Express
export const loggerMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  req.requestId = requestId;
  req.logger = logger;

  // Log da requisição
  logger.info('middleware', 'request_start', `${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    user_agent: req.get('User-Agent'),
    ip: req.ip,
    request_id: requestId
  });

  // Hook para log da resposta
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - start;

    logger.info('middleware', 'request_end', `${req.method} ${req.path} - ${res.statusCode}`, {
      method: req.method,
      path: req.path,
      status_code: res.statusCode,
      duration_ms: duration,
      request_id: requestId,
      response_size: Buffer.byteLength(data, 'utf8')
    });

    if (duration > 1000) {
      logger.warn('middleware', 'slow_request', `Requisição lenta: ${duration}ms`, {
        method: req.method,
        path: req.path,
        duration_ms: duration,
        request_id: requestId
      });
    }

    return originalSend.call(this, data);
  };

  next();
};