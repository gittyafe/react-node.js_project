import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/users/User';
import { UserRole } from '../entities/users/user-role.enum';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

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
  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { id: req.user?.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user?.id !== user.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', authMiddleware, roleMiddleware([UserRole.ADMIN]), async (_req: Request, res: Response) => {
  const userRepository = AppDataSource.getRepository(User);

  try {
    const users = await userRepository.find({ order: { createdAt: 'DESC' } });
    const safeUsers = users.map(({ password, ...rest }) => rest);
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
  const userRepository = AppDataSource.getRepository(User);

  try {
    const existingUser = await userRepository.findOne({ where: { email: email as string } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password as string, 10);
    const user = userRepository.create({
      fullName: fullName as string,
      email: email as string,
      password: hashedPassword,
      role: role as UserRole,
    });

    const savedUser = await userRepository.save(user);
    const { password: _, ...userWithoutPassword } = savedUser;

    return res.status(201).json(userWithoutPassword);
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
  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user?.id !== user.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({ where: { email: email as string } });
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
    }

    const updatedFields: Partial<User> = {
      fullName: (fullName ?? user.fullName) as string,
      email: (email ?? user.email) as string,
      role: (role ?? user.role) as UserRole,
    };

    if (password) {
      updatedFields.password = await bcrypt.hash(password as string, 10);
    }

    const updatedUser = userRepository.merge(user, updatedFields);
    const savedUser = await userRepository.save(updatedUser);
    const { password: _, ...userWithoutPassword } = savedUser;

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user?.id === user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await userRepository.remove(user);
    return res.status(204).send();
  } catch (error) {
    console.error('Failed to delete user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
