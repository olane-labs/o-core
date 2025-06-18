export enum RestrictedAddresses {
  GLOBAL_PREFIX = 'o://',
  REGISTRATION = 'register',
  LEADER = 'leader',
  TOOL = 'tool',
}

export const REGISTRATION_ADRESS =
  RestrictedAddresses.GLOBAL_PREFIX + RestrictedAddresses.REGISTRATION;

export const LEADER_ADRESS =
  RestrictedAddresses.GLOBAL_PREFIX + RestrictedAddresses.LEADER;

export const TOOL_ADRESS =
  RestrictedAddresses.GLOBAL_PREFIX + RestrictedAddresses.TOOL;

export const RestrictedAddressesList = [
  REGISTRATION_ADRESS,
  LEADER_ADRESS,
  TOOL_ADRESS,
];
