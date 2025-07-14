/* tslint:disable */
/* eslint-disable */
import { GrantedAuthority } from './granted-authority';
import { Role } from './role';
export interface User {
  accountLocked?: boolean;
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  authorities?: Array<GrantedAuthority>;
  createdAt?: string;
  credentialsNonExpired?: boolean;
  dateOfBirth?: string;
  email?: string;
  enabled?: boolean;
  firstname?: string;
  fullName?: string;
  id?: number;
  lastname?: string;
  name?: string;
  password?: string;
  roles?: Array<Role>;
  updatedAt?: string;
  username?: string;
}
