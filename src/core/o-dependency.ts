import { oDependency as oDependencyType } from '../core/protocol';

export class oDependency implements oDependencyType {
  address: string;
  version: string;
  parameters: { [key: string]: unknown };

  constructor(config: oDependencyType) {
    this.address = config.address;
    this.version = config.version;
    this.parameters = config.parameters;
  }
}
