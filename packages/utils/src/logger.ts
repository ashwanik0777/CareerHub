export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  meta?: Record<string, any>;
}

export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private format(level: LogLevel, message: string, meta?: Record<string, any>): string {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    if (meta) {
      payload.meta = meta;
    }
    // Return structured JSON string for production, or clean terminal log for dev
    const proc = (globalThis as any).process;
    const isProd = proc && proc.env?.NODE_ENV === 'production';
    if (isProd) {
      return JSON.stringify({ service: this.serviceName, ...payload });
    }
    const metaStr = meta ? ` | meta: ${JSON.stringify(meta)}` : '';
    return `[${payload.timestamp}] [${level}] [${this.serviceName}] ${message}${metaStr}`;
  }

  public debug(message: string, meta?: Record<string, any>): void {
    const proc = (globalThis as any).process;
    const isDev = !proc || proc.env?.NODE_ENV !== 'production' || proc.env?.DEBUG === 'true';
    if (isDev) {
      console.log(this.format('DEBUG', message, meta));
    }
  }

  public info(message: string, meta?: Record<string, any>): void {
    console.info(this.format('INFO', message, meta));
  }

  public warn(message: string, meta?: Record<string, any>): void {
    console.warn(this.format('WARN', message, meta));
  }

  public error(message: string, error?: Error | unknown, meta?: Record<string, any>): void {
    const errMeta = error instanceof Error 
      ? { errorName: error.name, errorMessage: error.message, errorStack: error.stack, ...meta }
      : { rawError: String(error), ...meta };
    console.error(this.format('ERROR', message, errMeta));
  }
}

export const logger = new Logger('App');
