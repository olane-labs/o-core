import { Libp2p } from '@olane-labs/o-config';
import { oAddress } from '../o-address';
import { NodeType } from './node-type.enum';

export interface CoreConfig {
  type?: NodeType;
  address: oAddress;
  persist?: boolean;
  seed?: string;
  name?: string;
  p2pNode?: Libp2p;
}
