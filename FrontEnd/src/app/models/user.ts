/* tslint:disable */
/* eslint-disable */
import { GrantedAuthority } from './granted-authority';
import { Role } from './role';
import { Team } from './team';

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
  online?: boolean;
  password?: string;
  phoneNumber?: number;
  roles?: Array<Role>;
  team?: Team;
  teamId?: number;
  updatedAt?: string;
  username?: string;
}
