import { UserDTO } from './userDTO';

export interface GameDTO {
    id: string;
    players: string[],
    status: string,
    winner: string
}