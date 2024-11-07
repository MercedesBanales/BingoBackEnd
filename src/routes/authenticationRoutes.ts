import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import * as authenticationController from '../controllers/authenticationController';

const router = Router();

router.post(
    "/login",
    authenticationController.login
);

router.post(
    "/logout", 
    authenticateToken(),
    authenticationController.logout
)

export default router;