/* tslint:disable */
/* eslint-disable */
import { User } from './user';

export enum TeamType {
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  RETENTION_TEAM = 'RETENTION_TEAM',
}

export interface Team {
  id?: number;
  type?: TeamType;
  manager?: User;
  agents?: Array<User>;
}
