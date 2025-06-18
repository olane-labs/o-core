import { Libp2p, Multiaddr, PeerId } from '@olane-labs/o-config';
import { CoreConfig } from './interfaces/core-config.interface';
import { NodeState } from './interfaces/state.enum';
import { oAddress } from './o-address';
import { RegistrationParams } from '../tool/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import { NodeUtils } from './core.utils';
import { Logger } from './utils/logger';

/**
 * oUrl = protocol service addressing
 * transports = libp2p transport addresses
 */
export abstract class oCoreNode {
  public p2pNode: Libp2p;
  protected logger: Logger;
  protected tools: oCoreNode[] = [];
  protected emitter: EventEmitter;
  // protected bus: oMessageBus;
  public address: oAddress;
  public peerId: PeerId;
  public state: NodeState = NodeState.STOPPED;
  public errors: Error[] = [];

  constructor(protected readonly config: CoreConfig) {
    this.logger = new Logger(
      this.constructor.name + (config.name ? `:${config.name}` : ''),
    );
    if (config) {
      this.address = config.address || new oAddress('o://node');
    }
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(Infinity);
    if (config.p2pNode) {
      this.p2pNode = config.p2pNode;
    }
  }

  get nodeConfig(): any {
    return {
      address: {
        protocol: this.address.protocol,
        value: this.address.value,
      },
      type: this.config.type,
      peerId: this.peerId?.toString(),
    };
  }

  protected async saveToDisk() {
    // create a config file in the .olane folder
    this.logger.debug('Saving node config to disk for PeerId: ' + this.peerId);
    if (!this.peerId) {
      throw new Error('Peer ID is required to save node config to disk');
    }
    const configFolder = path.join(
      process.cwd(),
      '.olane',
      this.config.type as string,
      this.peerId.toString(),
    );

    try {
      await mkdir(configFolder, { recursive: true });
      await writeFile(
        path.join(configFolder, 'config.json'),
        JSON.stringify(this.nodeConfig, null, 2),
      );
      this.logger.debug('Node config saved to disk');
    } catch (error) {
      this.logger.error({
        message: 'Failed to save node config to disk',
        error,
      });
      throw error;
    }
  }

  abstract initialize(parent?: oCoreNode): Promise<void>;

  protected async teardown(): Promise<void> {
    this.logger.debug('Tearing down node...');
    this.emitter.removeAllListeners();
    this.tools.forEach((tool) => {
      tool.stop();
    });
  }

  protected async startTools(): Promise<void> {
    this.logger.debug('Starting tools...');
    await Promise.all(
      this.tools.map(async (tool) => {
        this.logger.debug('Starting tool: ' + tool.address.toString());
        await tool.start(this);
      }),
    );
  }

  public toolAddress(address: oAddress): oAddress {
    const toolAddress = NodeUtils.encapsulateNode(this.address, address);
    return toolAddress;
  }

  async use(address: oAddress, data: any): Promise<void> {
    const tool = this.getTool(address);
    // await tool.run(data);
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener);
  }

  public async register(dto?: any): Promise<void> {
    this.logger.debug('Registering node...');
    // this.use(this.address, this.nodeConfig);
    // this.emitter.emit('register', this.nodeConfig);
  }

  public async start(parent?: oCoreNode): Promise<void> {
    if (this.state !== NodeState.STOPPED) {
      this.logger.warn('Node is not stopped, skipping start');
      return;
    }
    this.state = NodeState.STARTING;
    this.p2pNode = this.p2pNode || parent?.p2pNode;
    try {
      await this.initialize(parent);
      await this.startTools();
      await this.register();
      this.state = NodeState.RUNNING;
    } catch (error) {
      this.logger.error(error);
      this.errors.push(error as Error);
      this.state = NodeState.ERROR;
    }
  }
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
  // public async restart(): Promise<void> {
  //   this.logger.debug('Restart node called...');
  //   try {
  //     await this.stop();
  //     await this.start();
  //     this.logger.debug('Node restarted!');
  //   } catch (error) {
  //     this.errors.push(error as Error);
  //     this.state = NodeState.ERROR;
  //     this.logger.error('Node failed to restart', error);
  //   }
  // }

  /**
   * Handle a registration request from a child node
   * @param params - The registration parameters
   * @returns A promise that resolves when the registration is handled
   */
  abstract handleRegistration(params: RegistrationParams): Promise<void>;

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
}
