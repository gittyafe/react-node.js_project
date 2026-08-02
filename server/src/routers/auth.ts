import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/users/User';
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

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.format() });
  }

  const { fullName, email, password }: RegisterInput = parsed.data;
  const userRepository = AppDataSource.getRepository(User);

  try {
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({
      fullName,
      email,
      password: hashedPassword,
      role: UserRole.STUDENT,
    });

    const savedUser = await userRepository.save(user);
    const { password: _, ...userWithoutPassword } = savedUser;
    const token = jwt.sign(
      { sub: savedUser.id, email: savedUser.email, role: savedUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Register failed:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.format() });
  }

  const { email, password }: LoginInput = parsed.data;
  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'No account found for this email. Please register first.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;