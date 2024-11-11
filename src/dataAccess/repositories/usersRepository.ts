import { User } from '../models/User';
import { UserDTO } from '../../utils/DTOs/userDTO';
import { NotFoundException } from '../../validators/exceptions/notFoundException';

export const find = async (criteria: { where: { [key: string]: any } }): Promise<UserDTO> => {
    const user = await User.findOne(criteria);
    if (!user) throw new NotFoundException('Invalid email or password');
    return { id: user.getDataValue("id"), email: user.getDataValue("email") };
}