import { Connection, Uint8ArrayList, pushable, all } from '@olane/o-config';
import { Logger } from '../utils/logger';
import { oAddress } from '../o-address';
import { oDependency } from '../o-dependency';
import { v4 as uuidv4 } from 'uuid';
import { oRequest } from './o-request';
import {
  JSONRPC_VERSION,
  oHandshakeRequest,
  oProtocolMethods,
} from '@olane/o-protocol/schema/v1.0.0/schema';
import { oResponse } from './o-response';

export class oConnection {
  public readonly id: string;
  private readonly logger: Logger;
  private readonly p2pConnection: Connection;
  private readonly address: oAddress;
  private dependencies: oDependency[] = [];
  private parameters: any;
  private handshakePromise: Promise<oResponse> | null = null;
  private requestCounter: number = 0;

  constructor(
    private readonly config: {
      address: oAddress;
      p2pConnection: Connection;
    },
  ) {
    this.id = uuidv4();
    this.address = config.address;
    this.logger = new Logger(
      'Connection:[' + this.address.value + ']:' + this.id,
    );
    this.p2pConnection = config.p2pConnection;
  }

  async read(source) {
    const chunks: any = await all(source);

    const data = new Uint8ArrayList(...chunks).slice();
    if (!data || data.length === 0) {
      throw new Error('No data received');
    }
    return JSON.parse(new TextDecoder().decode(data));
  }

  validate() {
    if (this.config.p2pConnection.status !== 'open') {
      throw new Error('Connection is not valid');
    }
    // do nothing
  }

  async start() {
    if (this.handshakePromise) {
      this.logger.debug(
        'Handshake already in progress, waiting for it to complete',
      );
      return this.handshakePromise;
    }
    const params: oHandshakeRequest = {
      method: oProtocolMethods.HANDSHAKE,
      params: {
        address: this.address.value,
        _connectionId: this.id,
      },
      jsonrpc: JSONRPC_VERSION,
      id: this.requestCounter++,
    };
    const request = new oRequest(params);
    this.handshakePromise = this.transmit(request);
    return this.handshakePromise;
  }

  async handleResponse(response: oResponse) {
    this.logger.debug('Processing response: ', response);
    if (response.result.type === oProtocolMethods.HANDSHAKE) {
      if (response.result.dependencies) {
        this.logger.debug(
          'Handshake response received',
          response.result.dependencies,
        );
        this.dependencies = (
          response.result.dependencies as Array<oDependency>
        ).map((dependency) => new oDependency(dependency));
        // const dependencyResults = await this.config.onHandshake(this);
        // this.dependencies = dependencyResults;
      }
      if (response.result.parameters) {
        this.parameters = {
          ...this.parameters,
          dependencies: this.dependencies,
        };
      }
    }
  }

  async transmit(request: oRequest): Promise<oResponse> {
    const stream = await this.p2pConnection.newStream(this.address.protocol);

    // Create a pushable stream
    const pushableStream = pushable();
    pushableStream.push(new TextEncoder().encode(request.toString()));
    pushableStream.end();

    // Send the data
    await stream.sink(pushableStream);
    const res = await this.read(stream.source);
    const response = new oResponse(res);
    await this.handleResponse(response);
    return response;
  }

  async send(data: oRequest): Promise<oResponse> {
    this.logger.debug('Sending data via protocol: ' + this.address.value, data);

    // start the handshake
    await this.start();

    return this.transmit(data);
  }

  async close() {
    this.logger.debug('Closing connection');
    await this.p2pConnection.close();
    this.logger.debug('Connection closed');
  }
}
