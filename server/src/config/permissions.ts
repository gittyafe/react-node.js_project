import { UserRole } from '../entities/users/user-role.enum';

export type Actor = {
  id: string;
  role: UserRole;
};

export const isAdmin = (actor?: Actor) => actor?.role === UserRole.ADMIN;
export const isTeacher = (actor?: Actor) => actor?.role === UserRole.TEACHER;
export const isStudent = (actor?: Actor) => actor?.role === UserRole.STUDENT;

export const canAccessUser = (actor: Actor | undefined, targetUserId: string) => {
  if (!actor) return false;
  if (isAdmin(actor)) return true;
  return actor.id === targetUserId;
};

export const canManageUsers = (actor?: Actor) => isAdmin(actor);
export const canManageExams = (actor?: Actor) => isAdmin(actor) || isTeacher(actor);
export const canManageQuestions = canManageExams;
export const canUpdateUserRole = (actor?: Actor) => isAdmin(actor);
