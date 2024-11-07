import { UserDTO } from '../utils/DTOs/userDTO';

export const create = async (token: string, user: UserDTO): Promise<UserDTO> => {
    return user;
}