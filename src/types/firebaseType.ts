import type { Action } from './recordType';

export interface UserRecord {
  action: Action;
  timestamp: number;
  id: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  records: UserRecord;
}
