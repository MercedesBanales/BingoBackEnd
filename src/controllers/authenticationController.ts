import { Request, Response } from 'express';
import { LoginRequest, LoginResponse } from '../apiModels/authentication';
import { NotFoundException } from '../validators/exceptions/notFoundException';
import { InvalidFormatException } from '../validators/exceptions/invalidFormatException';
import * as sessionService from '../services/sessionService';
import { loginSchema } from '../utils/schemas/loginSchema';
import dotenv from 'dotenv';
import { ValidationResult } from 'joi';

dotenv.config();

export const login = async (req: Request, res: Response) => {
    try {
        const request: LoginRequest = req.body;
        const { error  } = ValidateRequest(request);
        if (error) throw new InvalidFormatException(error.message);
        const {token, id} = await sessionService.create(request.email, request.password);
        const response: LoginResponse = { token, id, message: "Logged in successfully", succeeded: true };
        res.status(200).send(response);
    } catch (error:any) {
        let code = 500;
        if (error instanceof NotFoundException) code = 400;
        if (error instanceof InvalidFormatException) code = 400;
        res.status(code).send(error.message);
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

const ValidateRequest = (request: LoginRequest) : ValidationResult => {
    return loginSchema.validate(request);
}