import { UserDTO } from "../utils/DTOs/userDTO";
import * as usersRepository from '../dataAccess/repositories/usersRepository';

export const find = async (email: string, password: string): Promise<UserDTO> => {
    return await usersRepository.find(email, password);
}