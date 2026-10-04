import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import UserModel, { IUser } from '../models/User';
import logger from '../config/logger';
import { UserRole } from '../entities/users/user-role.enum';

const router = express.Router();

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const normalizeEmail = (value: unknown) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
};

router.post('/register', async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  const parsed = registerSchema.safeParse({ ...req.body, email });

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.format() });
  }

  const { fullName, email: normalizedEmail, password }: RegisterInput = parsed.data;
  try {
    const existingUser = await UserModel.findOne({ email: normalizedEmail }).exec();
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ fullName, email: normalizedEmail, password: hashedPassword, role: UserRole.STUDENT });
    const savedUser = await newUser.save();
    const userObj = savedUser.toObject();
    delete userObj.password;
    const token = jwt.sign({ sub: savedUser._id.toString(), email: savedUser.email, role: savedUser.role }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({ token, user: userObj });
  } catch (error) {
    console.error('Register failed:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  const parsed = loginSchema.safeParse({ ...req.body, email });

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.format() });
  }

  const { email: normalizedEmail, password }: LoginInput = parsed.data;
  try {
    const user = await UserModel.findOne({ email: normalizedEmail }).exec();
    if (!user) {
      return res.status(401).json({ message: 'No account found for this email. Please register first.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
    }
    const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ token, user: userObj });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;