import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import UserModel from '../models/User';
import logger from '../config/logger';
import { UserRole } from '../entities/users/user-role.enum';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { canAccessUser, canUpdateUserRole } from '../config/permissions';

const router = express.Router();

const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole).optional(),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

const updateUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').optional(),
  email: z.string().email('Invalid email').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.nativeEnum(UserRole).optional(),
});

type UpdateUserInput = z.infer<typeof updateUserSchema>;

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.user?.id).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userObj = user.toObject();
    delete userObj.password;
    return res.status(200).json(userObj);
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!canAccessUser(req.user, user._id.toString())) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userObj = user.toObject();
    delete userObj.password;
    return res.status(200).json(userObj);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', authMiddleware, roleMiddleware([UserRole.ADMIN]), async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 }).exec();
    const safeUsers = users.map((u) => {
      const o = u.toObject();
      delete o.password;
      return o;
    });
    return res.status(200).json(safeUsers);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authMiddleware, roleMiddleware([UserRole.ADMIN]), async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.format() });
  }

  const { fullName, email, password, role = UserRole.STUDENT }: CreateUserInput = parsed.data;
  try {
    const existingUser = await UserModel.findOne({ email: email as string }).exec();
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password as string, 10);
    const newUser = new UserModel({
      fullName: fullName as string,
      email: email as string,
      password: hashedPassword,
      role: role as UserRole,
    });

    const savedUser = await newUser.save();
    const userObj = savedUser.toObject();
    delete userObj.password;

    return res.status(201).json(userObj);
  } catch (error) {
    console.error('Failed to create user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.format() });
  }

  const { id } = req.params as { id: string };
  const { fullName, email, password, role }: UpdateUserInput = parsed.data;
  const isAdmin = req.user?.role === UserRole.ADMIN;

  try {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSelf = req.user?.id === user._id.toString();

    if (!canAccessUser(req.user, user._id.toString())) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!canUpdateUserRole(req.user) && role !== undefined) {
      return res.status(403).json({ message: 'Only admins can change roles' });
    }

    const normalizedFullName = fullName !== undefined ? fullName.trim() : undefined;
    const normalizedEmail = email !== undefined ? email.trim().toLowerCase() : undefined;

    if (normalizedEmail && normalizedEmail !== user.email.toLowerCase()) {
      const existingUser = await UserModel.findOne({ email: normalizedEmail }).exec();
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
    }

    if (normalizedFullName !== undefined) user.fullName = normalizedFullName;
    if (normalizedEmail !== undefined) user.email = normalizedEmail;
    if (isAdmin && role !== undefined) user.role = role as UserRole;
    if (password) user.password = await bcrypt.hash(password as string, 10);

    const savedUser = await user.save();
    const userObj = savedUser.toObject();
    delete userObj.password;

    return res.status(200).json(userObj);
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user?.id === user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await UserModel.deleteOne({ _id: id }).exec();
    return res.status(204).send();
  } catch (error) {
    console.error('Failed to delete user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
