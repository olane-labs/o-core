import { Multiaddr, multiaddr } from '@olane-labs/o-config';

export class oAddress {
  constructor(
    public readonly value: string,
    public transports: Array<Multiaddr> = [],
  ) {}

  validate(): boolean {
    if (!this.value.startsWith('o://')) {
      return false;
    }
    return true;
  }

  get paths(): string {
    return this.value.replace('o://', '');
  }

  get protocol(): string {
    return this.value.replace('o://', '/o/');
  }

  toString(): string {
    return this.value;
  }

  toMultiaddr(): Multiaddr {
    return multiaddr(this.protocol);
  }

  static fromMultiaddr(ma: Multiaddr): oAddress {
    return new oAddress(ma.toString().replace('/o/', 'o://'));
  }
}
