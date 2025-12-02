export type AtomValue = string | number | boolean | object | null | undefined;

export interface AtomConfig<T extends AtomValue> {
  key: string;
  initialValue: T;
}

export interface SyncMessage<T extends AtomValue = AtomValue> {
  type: 'atom-sync';
  key: string;
  value: T;
  timestamp: number;
}

export interface SyncRequestMessage {
  type: 'atom-sync-request';
  timestamp: number;
}

export interface IframeSyncOptions {
  targetOrigin?: string;
  debug?: boolean;
}
