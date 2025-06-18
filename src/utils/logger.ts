import debug, { Debugger } from 'debug';

export class Logger {
  private log: Debugger;

  constructor(private readonly name: string) {
    this.log = debug('o-protocol:' + name);
  }

  debug(...args: any[]) {
    this.log('debug', ...args);
  }

  info(...args: any[]) {
    this.log('info', ...args);
  }

  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  error(...args: any[]) {
    this.log('error', ...args);
  }
}
