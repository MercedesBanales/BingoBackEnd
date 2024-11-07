import { SessionDTO } from '../../utils/DTOs/sessionDTO';
import { Session } from '../models/Session';

export const create = async (user_id: string): Promise<string> => {
    const session = await Session.create({ UserId: user_id });
    return session.getDataValue("token");
}

export const find = async (criteria: { where: { [key: string]: any } }): Promise<SessionDTO> => {
    const session = await Session.findOne(criteria);
    return {
        id: session ? session.getDataValue("id") : "",
        token: session ? session.getDataValue("token") : "",
        userId: session ? session.getDataValue("UserId") : ""
    } as SessionDTO;
}

export const update = async (session_id: string, new_token: string | null): Promise<string> => {
    await Session.update({ token: new_token }, { where: { id: session_id } });
    const session = await Session.findByPk(session_id);
    return session!.getDataValue("token");
}