import { UserDTO } from "../utils/DTOs/userDTO";
import * as usersRepository from '../dataAccess/repositories/usersRepository';

export const find = async (criteria: { where: { [key: string]: any } }): Promise<UserDTO> => {
    return await usersRepository.find(criteria);
}

