import { Router } from 'express';
import * as authenticationController from '../controllers/authenticationController';

const router = Router();

router.post(
    "/login",
    authenticationController.login
);

router.post(
    "/logout", 
    authenticationController.logout
)

export default router;