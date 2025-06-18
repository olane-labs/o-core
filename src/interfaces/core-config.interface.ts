import { Libp2pConfig } from '@olane/o-config';
import { oAddress } from '../o-address';
import { NodeType } from './node-type.enum';

export interface CoreConfig {
  type?: NodeType;
  address: oAddress;
  persist?: boolean;
  seed?: string;
  name?: string;
  network?: Libp2pConfig;
}
