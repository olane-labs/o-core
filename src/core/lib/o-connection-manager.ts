import { oAddress } from '../o-address';
import { Logger } from '../utils/logger';
import { oConnection } from './o-connection';
import { oConnectionManagerConfig } from '../interfaces/connection-manager.config';

export class oConnectionManager {
  private cache: Map<string, oConnection> = new Map();
  private logger: Logger;

  constructor(config: oConnectionManagerConfig) {
    this.logger = config.logger;
  }

  isCached(address: oAddress): boolean {
    return this.cache.has(address.toString());
  }

  getCachedConnection(address: oAddress): oConnection | null {
    try {
      const connection = this.cache.get(address.toString());
      if (!connection) {
        throw new Error('Connection not found in cache');
      }
      connection.validate();
      return connection;
    } catch (error) {
      const connection = this.cache.get(address.toString());
      this.logger.error('Error getting cached connection:', error);
    }
    return null;
  }
}
