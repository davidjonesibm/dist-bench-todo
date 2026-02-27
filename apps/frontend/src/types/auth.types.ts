export interface User {
  id: string
  email: string
  name: string
  username: string
  avatar?: string
  created: string
  updated: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  passwordConfirm: string
  name: string
}

export interface UpdateProfileData {
  name?: string
  avatar?: File
}

export interface AuthState {
  user: User | null
  token: string
  isAuthenticated: boolean
}
