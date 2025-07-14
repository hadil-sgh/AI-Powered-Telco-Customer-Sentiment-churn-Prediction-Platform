/* tslint:disable */
/* eslint-disable */
import { CallRecord } from './call-record';
import { Customer } from './customer';
import { User } from './user';
export interface Note {
  agent?: User;
  call?: CallRecord;
  callDuration?: {
'seconds'?: number;
'nano'?: number;
'negative'?: boolean;
'zero'?: boolean;
'units'?: Array<{
'dateBased'?: boolean;
'timeBased'?: boolean;
'durationEstimated'?: boolean;
}>;
};
  customer?: Customer;
  description?: string;
  id?: number;
}
