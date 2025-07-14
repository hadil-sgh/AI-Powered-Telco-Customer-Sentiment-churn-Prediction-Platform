export interface RegisterRequest {
  // firstname: string;
  // lastname: string;
  // dateOfBirth: string;
  email: string;
  password: string;
}

export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
  role: string[];
  fullName: string;
}
