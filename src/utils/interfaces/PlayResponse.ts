export interface PlayResponse {
    card: number[][];
    winner: {email: string, id: string} | null;
    message: string;
}
