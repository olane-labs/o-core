import {
  generateKeyPairFromSeed,
  createEd25519PeerId,
} from '@olane-labs/o-config';
import { createHash } from 'crypto';

export class CoreNodeUtils {
  static async generatePeerId(): Promise<any> {
    const peerId = await createEd25519PeerId();
    return peerId;
  }

  static async generatePrivateKey(seed: string): Promise<any> {
    const seedBytes = new TextEncoder().encode(seed);

    const privateKey: any = await generateKeyPairFromSeed('Ed25519', seedBytes);
    return privateKey;
  }

  // Utility function to convert any phrase into a 32-character string
  public static phraseToSeed(phrase: string): string {
    // Use SHA-256 to create a consistent 32-byte hash
    const hash = createHash('sha256').update(phrase).digest('hex');
    // Take the first 32 characters of the hex string
    return hash.substring(0, 32);
  }
}
