export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    id: string;
    message: string;
    succeeded: boolean;
}