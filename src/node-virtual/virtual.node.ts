import { CoreConfig } from '../core';
import { oNode } from '../node';
import { v4 as uuidv4 } from 'uuid';

export class oVirtualNode extends oNode {
  constructor(config: CoreConfig) {
    super(config);
  }

  /**
   * Virtual nodes are only used for local communication, so we need to configure
   * the transports to be in-memory.
   * @returns The transports for the virtual node
   */
  configureTransports(): any[] {
    return [`/memory/${uuidv4()}`];
  }
}
