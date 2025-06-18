import {
  bootstrap,
  createNode,
  FsDatastore,
  Libp2pConfig,
} from '@olane/o-config';
import { CoreConfig, CoreUtils, NodeState, oCoreNode } from '../core';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class oNode extends oCoreNode {
  constructor(config: CoreConfig) {
    super(config);
  }

  validate(): void {
    if (this.p2pNode && this.state !== NodeState.STOPPED) {
      throw new Error('Node is not in a valid state to be initialized');
    }
  }

  /**
   * Configure the libp2p node
   * @returns The libp2p config
   */
  async configure(): Promise<Libp2pConfig> {
    const params: Libp2pConfig = {
      ...this.networkConfig,
      transports: [
        `/memory/${uuidv4()}`, // ensure we allow for local in-memory communication
        ...(this.config.network?.transports || []),
      ],
    };

    // if the seed is provided, use it to generate the private key
    if (this.config.seed) {
      const privateKey = await CoreUtils.generatePrivateKey(this.config.seed);
      params.privateKey = privateKey;
    }

    // if config.persist is true, use the datastore
    if (this.config.persist) {
      params.datastore = new FsDatastore(
        path.join(process.cwd(), '.olane', 'datastore'),
      );
    }

    // if config.bootstrapTransports is provided, use it to bootstrap the node
    if (this.config.leaderTransports) {
      params.peerDiscovery = [
        bootstrap({
          list: this.config.leaderTransports,
        }),
      ];
    }
    return params;
  }

  async initialize(): Promise<void> {
    this.logger.debug('Initializing node...');
    this.validate();

    const params = await this.configure();
    this.p2pNode = await createNode(params);
  }

  async use(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async register(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
