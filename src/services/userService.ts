import { User } from "../models/user";
import { UserDTO } from "../utils/DTOs/userDTO";

export const find = async (email: string, password: string): Promise<UserDTO> => {
    return {
        id: 1,
        email: ''
    }
}