import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterUserDto } from '../dtos/registerUserDto';
import authService from '../services/authService';
import { generateToken } from '../utils/jwt';
import { LoginDto } from '../dtos/loginDto';
export const registerUser = async (req, res) => {
    try {
        const dto = plainToInstance(RegisterUserDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation error', errors });
        }
        try {
            const newUser = await authService.registerUser(dto);
            const token = generateToken({ userId: newUser.id, email: newUser.email });
            return res
                .status(201)
                .json({ message: 'User registered successfully', token });
        }
        catch (err) {
            if (err.message && err.message.includes('Email already in use')) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
export const loginUser = async (req, res) => {
    try {
        const dto = plainToInstance(LoginDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation error', errors });
        }
        try {
            const user = await authService.loginUser(dto);
            const token = generateToken({ userId: user.id, email: user.email });
            return res.status(200).json({ message: 'Login successful', token });
        }
        catch (err) {
            if (err.message && err.message.includes('Invalid email or password')) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
export const getMe = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userInfo = await authService.getMe(user.userId);
    if (!userInfo) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user: userInfo });
};
//# sourceMappingURL=authController.js.map