import { Request, Response } from 'express';
import { LoginRequest, LoginResponse } from '../apiModels/authentication';
import { NotFoundException } from '../validators/exceptions/notFoundException';
import * as sessionService from '../services/sessionService';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req: Request, res: Response) => {
    try {
        const request: LoginRequest = req.body;
        const {token, id} = await sessionService.create(request.email, request.password);
        const response: LoginResponse = { token, id, message: "Logged in successfully", succeeded: true };
        res.status(200).send(response);

    } catch (error:any) {
        let code = 500;
        if (error instanceof NotFoundException) code = 404;
        res.status(code).send({ message: error.message });
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        const token = req.headers['authorization'];
        await sessionService.remove(token!);
        res.status(200).send({ message: "Logged out successfully" });
    } catch (error: any) {
        res.status(500).send({ message: error.message });
    }
}