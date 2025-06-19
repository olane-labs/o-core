import {
  JSONRPC_VERSION,
  RequestId,
  oResponse as Response,
  Result,
} from '@olane/o-protocol';

export class oResponse implements Response {
  jsonrpc: typeof JSONRPC_VERSION;
  id: RequestId;
  result: Result;

  constructor(config: Result & { id: RequestId }) {
    this.jsonrpc = JSONRPC_VERSION;
    this.id = config.id;
    this.result = config;
  }
}
