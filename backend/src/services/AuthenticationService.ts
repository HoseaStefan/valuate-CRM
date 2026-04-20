import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
import { User } from '../models/users';

export const login = async (email: string, password: string): Promise<string> => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        const error = new Error('Invalid email or password');
        (error as any).status = 401;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        (error as any).status = 401;
        throw error;
    }

    const secret = process.env.JWT_SECRET + "";
    const token = jwt.sign({id: user.id, email: user.email, name: user.fullName}, secret, {expiresIn: '7d'});
    return token;
};