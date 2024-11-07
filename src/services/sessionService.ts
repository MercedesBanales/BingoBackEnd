import * as userService from './userService';
import { UserDTO } from '../utils/DTOs/userDTO';
import { SessionDTO } from '../utils/DTOs/sessionDTO';
import * as sessionsRepository from '../dataAccess/repositories/sessionsRepository';
import { v4 as uuidv4 } from 'uuid';

export const create = async (email: string, password: string): Promise<string> => {
    const user: UserDTO = await userService.find(email, password);
    const session: SessionDTO = await sessionsRepository.find({ where: { UserId: user.id } });
    if (session.id !== "") return sessionsRepository.update(session.id, uuidv4());
    return sessionsRepository.create(user.id);
}

export const remove = async (token: string): Promise<void> => {
    const session = await sessionsRepository.find({ where: { token: token } });
    await sessionsRepository.update(session!.id, null);
}

export const find = async (criteria: { where: { [key: string]: any } }): Promise<SessionDTO> => {
    return await sessionsRepository.find(criteria);
}
