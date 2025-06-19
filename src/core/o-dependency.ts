import { oDependency as oDependencyType } from '@olane/o-protocol/schema/v1.0.0/schema';

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
