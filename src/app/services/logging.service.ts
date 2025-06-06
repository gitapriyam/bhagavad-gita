import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'off';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error', 'off'];
  private currentLevel: LogLevel = environment.logLevel as LogLevel;

  private shouldLog(level: LogLevel): boolean {
    return (
      this.levelOrder.indexOf(level) >=
        this.levelOrder.indexOf(this.currentLevel) &&
      this.currentLevel !== 'off'
    );
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) console.debug(...args);
  }
  info(...args: any[]): void {
    if (this.shouldLog('info')) console.info(...args);
  }
  warn(...args: any[]): void {
    if (this.shouldLog('warn')) console.warn(...args);
  }
  error(...args: any[]): void {
    if (this.shouldLog('error')) console.error(...args);
  }
}
