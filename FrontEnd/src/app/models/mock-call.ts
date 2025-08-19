import { Customer } from './customer';
import { User } from './user';

export interface MockCall {
  id?: number;
  customer?: Customer;
  agent?: User;
}
