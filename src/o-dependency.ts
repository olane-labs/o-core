import { oAddress } from './o-address';

export class oDependency {
  private output: any;
  constructor(
    readonly address: oAddress,
    readonly inputSchema?: any,
    readonly outputSchema?: any,
  ) {}
}
