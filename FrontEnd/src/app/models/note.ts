/* tslint:disable */
/* eslint-disable */
import { CallRecord } from './call-record';
import { Customer } from './customer';
import { User } from './user';

export interface Note {
  id?: number;
  customer?: Customer;
  agent?: User;
  description?: string;
  call?: CallRecord;
  
}
