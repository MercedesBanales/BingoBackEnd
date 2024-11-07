import { Request, Response } from 'express';
import { LoginRequest, LoginResponse } from '../models/authentication';
import { NotFoundException } from '../validators/exceptions/notFoundException';
import { UserDTO } from '../utils/DTOs/userDTO';
import * as userService from '../services/userService';
import * as sessionService from '../services/sessionService';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req: Request, res: Response) => {
    try {
        const request: LoginRequest = req.body;
        const user: UserDTO = await userService.find(request.email, request.password);
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );
        sessionService.create(token, user);
        const response: LoginResponse = { token: token, message: "Logged in successfully", succeeded: true };
        res.status(200).send(response);

    } catch (error:any) {
        let code = 500;
        if (error instanceof NotFoundException) code = 404;
        res.status(code).send({ message: error.message });
    }
}