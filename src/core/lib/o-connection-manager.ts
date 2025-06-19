import { oAddress } from '../o-address';
import { Logger } from '../utils/logger';
import { oConnection } from './o-connection';
import { oConnectionManagerConfig } from '../interfaces/connection-manager.config';
import { Libp2p } from '@olane/o-config';

export class oConnectionManager {
  private cache: Map<string, oConnection> = new Map();
  private logger: Logger;
  private p2pNode: Libp2p;

  constructor(config: oConnectionManagerConfig) {
    this.logger = config.logger;
    this.p2pNode = config.p2pNode;
  }

  /**
   * Connect to a given address
   * @param address - The address to connect to
   * @returns The connection object
   */
  async connect(address: oAddress): Promise<oConnection> {
    this.logger.debug(
      'Received connect request for address: ' +
        address.protocol +
        ' on transports: ' +
        address.transports.map((t) => t.toString()).join(', '),
    );

    // check if we already have a connection to this address
    if (this.isCached(address)) {
      const cachedConnection = this.getCachedConnection(address);
      if (cachedConnection) {
        this.logger.debug(
          'Using cached connection for address: ' + address.toString(),
        );
        return cachedConnection;
      } else {
        // cached item is not valid, remove it
        this.cache.delete(address.toString());
      }
    }

    this.logger.debug('No cached connection found, creating new one');

    // first time setup connection
    const p2pConnection = await this.p2pNode.dial(address.transports);
    const connection = new oConnection({
      address: address,
      p2pConnection: p2pConnection,
      // onHandshake: this.performHandshake.bind(this),
    });
    this.cache.set(address.toString(), connection);
    return connection;
  }

  isCached(address: oAddress): boolean {
    return this.cache.has(address.toString());
  }

  getCachedConnection(address: oAddress): oConnection | null {
    const key = address.toString();
    try {
      const connection = this.cache.get(key);
      if (!connection) {
        throw new Error('Connection not found in cache');
      }
      connection.validate();
      return connection;
    } catch (error) {
      this.cache.delete(key);
      this.logger.error('Error getting cached connection:', error);
    }
    return null;
  }
}
