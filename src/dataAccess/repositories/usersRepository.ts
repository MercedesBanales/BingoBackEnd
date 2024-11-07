import { User } from '../models/User';
import { UserDTO } from '../../utils/DTOs/userDTO';
import { NotFoundException } from '../../validators/exceptions/notFoundException';

export const find = async (email: string, password: string): Promise<UserDTO> => {
    const user = await User.findOne({ where: { email, password } });
    if (!user) throw new NotFoundException('User not found');
    return { id: user.getDataValue("id"), email: user.getDataValue("email") };
}