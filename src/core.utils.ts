import { ConfigError } from '../../o-error/node/config.error';
import { ServiceNodeConfig } from '../service';
import { oAddress } from './o-address';

export class NodeUtils {
  public static validateNodeConfig(config: ServiceNodeConfig) {
    if (!config.address) {
      throw new ConfigError('Node address is required');
    }
  }

  public static encapsulateNode(
    parentAddress: oAddress,
    childAddress: oAddress,
  ): oAddress {
    return new oAddress(parentAddress.toString() + '/' + childAddress.paths);
  }
}
