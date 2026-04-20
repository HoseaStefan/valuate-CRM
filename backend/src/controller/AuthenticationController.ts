import { Request, Response } from 'express';
import { login } from '../services/AuthenticationService';

/**
 * @desc Handles user login
 * @route POST /login
 */
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const token = await login(email, password);
    
    res.json({ token, status: 200 });
}

export const verify = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        throw { message: 'Token is required', status: 400};
    }

    token.verify(token, process.env.JWT_SECRET + "", (err: any, decoded: any) => {
        if (err) {
            throw { message: 'Invalid token', status: 401 };
        }
    });

    res.json({ message: 'Token is valid', status: 200 });
}