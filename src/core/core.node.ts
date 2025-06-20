import {
  defaultLibp2pConfig,
  Libp2p,
  Libp2pConfig,
  PeerId,
} from '@olane/o-config';
import { CoreConfig } from './interfaces/core-config.interface';
import { NodeState } from './interfaces/state.enum';
import { oAddress } from './o-address';
import { Logger } from './utils/logger';
import { CoreUtils } from './utils/core.utils';
import { NodeType } from './interfaces/node-type.enum';
import { oConnectionManager } from './lib/o-connection-manager';
import { oResponse } from './lib/o-response';
import { oConnection } from './lib/o-connection';
import { oDependency } from './o-dependency';
import { oHandshakeResponse, oProtocolMethods } from '@olane/o-protocol-tmp';
import { ConnectionSendParams } from './interfaces/connection-send-params.interface';

export abstract class oCoreNode {
  public p2pNode: Libp2p;
  public logger: Logger;
  public networkConfig: Libp2pConfig;
  public address: oAddress;
  public peerId: PeerId;
  public state: NodeState = NodeState.STOPPED;
  public errors: Error[] = [];
  public connectionManager: oConnectionManager;

  constructor(readonly config: CoreConfig) {
    this.logger = new Logger(
      this.constructor.name + (config.name ? `:${config.name}` : ''),
    );
    this.address = config.address || new oAddress('o://node');
    this.networkConfig = config.network || defaultLibp2pConfig;
  }

  get type() {
    return this.config.type || NodeType.UNKNOWN;
  }

  async initialize(): Promise<void> {}

  async handleDependencies(dependencies: oDependency[]): Promise<oResponse[]> {
    const response: oResponse[] = [];
    for (const dependency of dependencies) {
      const result = await this.use(new oAddress(dependency.address), {
        _connectionId: 'unknown',
        ...dependency.parameters,
      });
      response.push(result);
    }
    return response;
  }

  async handleHandshake(handshake: oResponse): Promise<oResponse[]> {
    const response: oResponse[] = [];

    // check if the response is a handshake response
    if (handshake.result._requestMethod === oProtocolMethods.HANDSHAKE) {
      const handshakeResponse = handshake as oHandshakeResponse;
      const result = handshakeResponse.result;

      // handle dependencies
      if (result.dependencies) {
        this.logger.debug(
          'Handshake response received',
          handshake.result.dependencies,
        );
        const dependencies = await this.handleDependencies(
          result.dependencies.map((dependency) => new oDependency(dependency)),
        );
        response.push(...dependencies);
      }
    }

    return response;
  }

  async use(address: oAddress, data: ConnectionSendParams): Promise<oResponse> {
    this.logger.debug('Using address: ' + address.toString());
    const connection = await this.connect(address);
    // start the handshake
    const handshake = await connection.start();
    await this.handleHandshake(handshake);
    return connection.send(data);
  }

  async register(dto?: any): Promise<void> {
    this.logger.debug('Registering node...');
  }

  async connect(address: oAddress): Promise<oConnection> {
    const connection = await this.connectionManager.connect(address);
    if (!connection) {
      throw new Error('Connection failed');
    }
    return connection;
  }

  public async teardown(): Promise<void> {
    this.logger.debug('Tearing down node...');
  }

  /**
   * Start the node
   * @param parent - The parent node
   */
  public async start(): Promise<void> {
    if (this.state !== NodeState.STOPPED) {
      this.logger.warn('Node is not stopped, skipping start');
      return;
    }
    this.state = NodeState.STARTING;
    this.p2pNode = this.p2pNode;
    try {
      await this.initialize();
      // initialize connection manager
      this.connectionManager = new oConnectionManager({
        logger: this.logger,
        p2pNode: this.p2pNode,
      });
      await this.register();
      this.state = NodeState.RUNNING;
    } catch (error) {
      this.logger.error(error);
      this.errors.push(error as Error);
      this.state = NodeState.ERROR;
    }
  }

  /**
   * Stop the node
   */
  public async stop(): Promise<void> {
    this.logger.debug('Stop node called...');
    this.state = NodeState.STOPPING;
    try {
      await this.teardown();
      this.state = NodeState.STOPPED;
      this.logger.debug('Node stopped!');
    } catch (error) {
      this.errors.push(error as Error);
      this.state = NodeState.ERROR;
      this.logger.error('Node failed to stop', error);
    }
  }

  /**
   * Generate the tool address for an encapsulated node
   * @param address - The address of the tool
   * @returns The tool address
   */
  public toolAddress(address: oAddress): oAddress {
    const toolAddress = CoreUtils.encapsulateNode(this.address, address);
    return toolAddress;
  }
}
