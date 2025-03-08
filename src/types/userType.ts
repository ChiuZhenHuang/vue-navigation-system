export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface userData {
  success: boolean;
  uid?: string;
  token?: string;
  userName?: string;
  email?: string;
  error?: string;
}
