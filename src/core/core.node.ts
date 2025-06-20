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
import { oRequest } from './lib/o-request';
import { oResponse } from './lib/o-response';
import { oConnection } from './lib/o-connection';

export abstract class oCoreNode {
  public p2pNode: Libp2p;
  protected logger: Logger;
  protected tools: oCoreNode[] = [];
  protected networkConfig: Libp2pConfig;
  public address: oAddress;
  public peerId: PeerId;
  public state: NodeState = NodeState.STOPPED;
  public errors: Error[] = [];
  protected connectionManager: oConnectionManager;

  constructor(protected readonly config: CoreConfig) {
    this.logger = new Logger(
      this.constructor.name + (config.name ? `:${config.name}` : ''),
    );
    this.address = config.address || new oAddress('o://node');
    this.networkConfig = config.network || defaultLibp2pConfig;
  }

  get type() {
    return this.config.type || NodeType.UNKNOWN;
  }

  abstract initialize(parent?: oCoreNode): Promise<void>;

  async use(address: oAddress, data: oRequest): Promise<oResponse> {
    this.logger.debug('Using address: ' + address.toString());
    const connection = await this.connect(address);
    return connection.send(data);
  }

  abstract register(dto?: any): Promise<void>;

  async connect(address: oAddress): Promise<oConnection> {
    const connection = await this.connectionManager.connect(address);
    if (!connection) {
      throw new Error('Connection not found');
    }
    return connection;
  }

  protected async teardown(): Promise<void> {
    this.logger.debug('Tearing down node...');
    this.tools.forEach((tool) => {
      tool.stop();
    });
  }

  protected async startTools(): Promise<void> {
    this.logger.debug('Starting tools...');
    await Promise.all(
      this.tools.map(async (tool) => {
        this.logger.debug('Starting tool: ' + tool.address.toString());
        await tool.start();
      }),
    );
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
      // continue with startup
      await this.startTools();
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
   * Add a tool to the node
   * @param tool - The tool to add
   */
  addTool(tool: oCoreNode) {
    if (this.tools.find((t) => t.address === tool.address)) {
      throw new Error(
        `Tool with protocol ${tool.address.value} already exists`,
      );
    }
    this.tools.push(tool);
  }

  getTool(address: oAddress): oCoreNode {
    const toolAddress = this.toolAddress(address);
    const tool = this.tools.find(
      (t) => t.config.address?.toString() === address?.toString(),
    );
    if (!tool) {
      throw new Error(`Tool with protocol ${toolAddress.toString()} not found`);
    }
    return tool;
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
