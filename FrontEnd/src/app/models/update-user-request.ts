export interface UpdateUserRequest {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  dateOfBirth?: string;
}
