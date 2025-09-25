// Sistema de Logging Frontend - Barbershop Pro
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE'
}

export interface FrontendLogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  action: string;
  message: string;
  user_id?: string;
  barbershop_id?: string;
  data?: any;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  performance?: {
    duration_ms: number;
    memory_usage?: number;
  };
  url?: string;
  user_agent?: string;
  session_id?: string;
  request_id?: string;
}

class FrontendLogger {
  private isDevelopment: boolean;
  private sessionId: string;
  private apiBase: string;
  private maxStorageEntries = 1000;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.sessionId = this.generateSessionId();
    this.apiBase = import.meta.env.VITE_API_BASE || '/api';
    this.cleanupOldLogs();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStorageKey(component: string): string {
    return `logs_${component}`;
  }

  private formatLogEntry(entry: FrontendLogEntry): FrontendLogEntry {
    return {
      ...entry,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      user_agent: navigator.userAgent,
      session_id: this.sessionId
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;

    const levelPriority = {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3,
      [LogLevel.TRACE]: 4
    };

    const minLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || LogLevel.INFO;
    return levelPriority[level] <= levelPriority[minLevel];
  }

  private saveToLocalStorage(component: string, entry: FrontendLogEntry) {
    try {
      const storageKey = this.getStorageKey(component);
      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');

      existingLogs.push(entry);

      // Manter apenas os últimos logs para evitar excesso de armazenamento
      if (existingLogs.length > this.maxStorageEntries) {
        existingLogs.splice(0, existingLogs.length - this.maxStorageEntries);
      }

      localStorage.setItem(storageKey, JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Erro ao salvar log no localStorage:', error);
    }
  }

  private sendToBackend(entry: FrontendLogEntry) {
    // Enviar logs críticos para o backend em produção
    if (!this.isDevelopment && entry.level === LogLevel.ERROR) {
      fetch(`${this.apiBase}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      }).catch(error => {
        console.error('Erro ao enviar log para backend:', error);
      });
    }
  }

  private cleanupOldLogs() {
    // Limpar logs antigos (mais de 7 dias)
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('logs_')) {
        try {
          const logs = JSON.parse(localStorage.getItem(key) || '[]');
          const filteredLogs = logs.filter((log: FrontendLogEntry) =>
            new Date(log.timestamp).getTime() > oneWeekAgo
          );
          localStorage.setItem(key, JSON.stringify(filteredLogs));
        } catch (error) {
          console.error('Erro ao limpar logs antigos:', error);
        }
      }
    });
  }

  public log(entry: Partial<FrontendLogEntry>) {
    const logEntry: FrontendLogEntry = {
      timestamp: new Date().toISOString(),
      level: entry.level || LogLevel.INFO,
      component: entry.component || 'unknown',
      action: entry.action || 'unknown',
      message: entry.message || '',
      ...entry
    };

    if (!this.shouldLog(logEntry.level)) return;

    const formattedEntry = this.formatLogEntry(logEntry);

    // Console output
    if (this.isDevelopment) {
      const color = this.getColorForLevel(logEntry.level);
      console.log(
        `%c[${logEntry.level}] ${logEntry.component}:${logEntry.action} - ${logEntry.message}`,
        `color: ${color}; font-weight: bold;`,
        logEntry.data || ''
      );
    }

    // Salvar no localStorage
    this.saveToLocalStorage(logEntry.component, formattedEntry);

    // Enviar para backend se necessário
    this.sendToBackend(formattedEntry);
  }

  private getColorForLevel(level: LogLevel): string {
    const colors = {
      [LogLevel.ERROR]: '#ff4444',
      [LogLevel.WARN]: '#ffaa00',
      [LogLevel.INFO]: '#0088ff',
      [LogLevel.DEBUG]: '#00aa88',
      [LogLevel.TRACE]: '#888888'
    };
    return colors[level] || '#888888';
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
        memory_usage: (performance as any).memory?.usedJSHeapSize
      }
    });
  }

  // Log de auditoria
  public audit(component: string, action: string, data?: any) {
    this.log({
      level: LogLevel.INFO,
      component,
      action: `audit_${action}`,
      message: `Ação de auditoria: ${action}`,
      data
    });
  }

  // Funções utilitárias para recuperar logs
  public getComponentLogs(component: string): FrontendLogEntry[] {
    try {
      return JSON.parse(localStorage.getItem(this.getStorageKey(component)) || '[]');
    } catch (error) {
      console.error('Erro ao recuperar logs do componente:', error);
      return [];
    }
  }

  public getAllLogs(): Record<string, FrontendLogEntry[]> {
    const allLogs: Record<string, FrontendLogEntry[]> = {};

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('logs_')) {
        const component = key.replace('logs_', '');
        allLogs[component] = this.getComponentLogs(component);
      }
    });

    return allLogs;
  }

  public exportLogs(): string {
    return JSON.stringify(this.getAllLogs(), null, 2);
  }

  public clearLogs(component?: string) {
    if (component) {
      localStorage.removeItem(this.getStorageKey(component));
    } else {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('logs_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  // Configurar contexto global (usuário, barbearia)
  public setContext(userId?: string, barbershopId?: string) {
    this.user_id = userId;
    this.barbershop_id = barbershopId;
  }

  private user_id?: string;
  private barbershop_id?: string;

  // Wrapper para API calls com logging automático
  public async apiCall<T>(
    component: string,
    action: string,
    apiFunction: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();

    this.info(component, `${action}_start`, `Iniciando ${action}`);

    try {
      const result = await apiFunction();
      const duration = Date.now() - start;

      this.info(component, `${action}_success`, `${action} concluído com sucesso`, {
        duration_ms: duration
      });

      if (duration > 2000) {
        this.warn(component, `${action}_slow`, `API call lenta detectada: ${duration}ms`, {
          duration_ms: duration
        });
      }

      return result;
    } catch (error: any) {
      const duration = Date.now() - start;

      this.error(component, `${action}_error`, `Erro em ${action}: ${error.message}`, error, {
        duration_ms: duration
      });

      throw error;
    }
  }
}

// Instância singleton
export const logger = new FrontendLogger();

// Hook React para logging
export const useLogger = (component: string) => {
  return {
    error: (action: string, message: string, error?: Error, data?: any) =>
      logger.error(component, action, message, error, data),
    warn: (action: string, message: string, data?: any) =>
      logger.warn(component, action, message, data),
    info: (action: string, message: string, data?: any) =>
      logger.info(component, action, message, data),
    debug: (action: string, message: string, data?: any) =>
      logger.debug(component, action, message, data),
    performance: (action: string, duration_ms: number, data?: any) =>
      logger.performance(component, action, duration_ms, data),
    audit: (action: string, data?: any) =>
      logger.audit(component, action, data),
    apiCall: <T>(action: string, apiFunction: () => Promise<T>) =>
      logger.apiCall(component, action, apiFunction)
  };
};