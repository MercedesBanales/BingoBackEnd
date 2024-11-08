import { UserDTO } from './userDTO';

export interface GameDTO {
    id: string;
    players: number[],
    status: string,
    winner: UserDTO | null
}