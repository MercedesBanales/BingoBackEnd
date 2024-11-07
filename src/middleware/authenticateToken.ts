import { NextFunction } from "express";
import { Request,  Response } from "express"
import * as sessionService from "../services/sessionService";

export const authenticateToken = () => async (req: Request, res: Response, next: NextFunction) : Promise<any>=> {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    const session = await sessionService.find({where : {token: token}});
    if (session.id === '') return res.sendStatus(403);
    next();
}