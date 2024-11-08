import { UserDTO } from './userDTO';

export interface GameDTO {
    id: string;
    players: UserDTO[],
    status: string,
    winner: UserDTO | null
}