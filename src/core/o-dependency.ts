import {
  oDependency as oDependencyType,
  oParameter,
} from '@olane/o-protocol-tmp';

export class oDependency implements oDependencyType {
  address: string;
  version?: string;
  parameters?: oParameter[];

  constructor(config: oDependencyType) {
    this.address = config.address;
    this.version = config.version;
    this.parameters = config.parameters;
  }

  toJSON(): oDependencyType {
    return {
      address: this.address,
      version: this.version,
      parameters: this.parameters,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
