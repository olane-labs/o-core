export enum RestrictedAddresses {
  GLOBAL_PREFIX = 'o://',
  REGISTRATION = 'register',
  LEADER = 'leader',
  MCP = 'mcp',
  A2A = 'a2a',
}

export const REGISTRATION_ADRESS =
  RestrictedAddresses.GLOBAL_PREFIX + RestrictedAddresses.REGISTRATION;

export const REGISTRATION_ADRESS_CLIENT =
  RestrictedAddresses.GLOBAL_PREFIX +
  RestrictedAddresses.REGISTRATION +
  '/client';

export const LEADER_ADRESS =
  RestrictedAddresses.GLOBAL_PREFIX + RestrictedAddresses.LEADER;

export const MCP_ADRESS =
  RestrictedAddresses.GLOBAL_PREFIX + RestrictedAddresses.MCP;

export const A2A_ADRESS =
  RestrictedAddresses.GLOBAL_PREFIX + RestrictedAddresses.A2A;

export const RestrictedAddressesList = [
  REGISTRATION_ADRESS,
  LEADER_ADRESS,
  MCP_ADRESS,
];
