import { canAccessUser, canUpdateUserRole } from '../src/config/permissions';
import { UserRole } from '../src/entities/users/user-role.enum';

describe('User role policy', () => {
  it('allows a student to access only their own profile', () => {
    expect(canAccessUser({ id: 'u1', role: UserRole.STUDENT }, 'u1')).toBe(true);
    expect(canAccessUser({ id: 'u1', role: UserRole.STUDENT }, 'u2')).toBe(false);
  });

  it('allows a teacher to access only their own profile, not all users', () => {
    expect(canAccessUser({ id: 't1', role: UserRole.TEACHER }, 't1')).toBe(true);
    expect(canAccessUser({ id: 't1', role: UserRole.TEACHER }, 'u2')).toBe(false);
  });

  it('allows admin to access any user', () => {
    expect(canAccessUser({ id: 'admin1', role: UserRole.ADMIN }, 'u2')).toBe(true);
  });

  it('only admins can change roles', () => {
    expect(canUpdateUserRole({ id: 'u1', role: UserRole.STUDENT })).toBe(false);
    expect(canUpdateUserRole({ id: 't1', role: UserRole.TEACHER })).toBe(false);
    expect(canUpdateUserRole({ id: 'admin1', role: UserRole.ADMIN })).toBe(true);
  });
});
