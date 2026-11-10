import type { Student } from './student';

export type RelationshipType =
  | 'FATHER'
  | 'MOTHER'
  | 'GRANDFATHER'
  | 'GRANDMOTHER'
  | 'GUARDIAN';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface GuardianStudent {
  id: string;
  studentId: string;
  guardianId: string;
  relationshipType: RelationshipType;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

/**
 * Convenience shape used across the Parent UI: a guardian-student link
 * joined with its student record. The backend can return this shape
 * directly from a single endpoint (e.g. GET /guardians/me/children),
 * or the frontend can compose it client-side from two responses —
 * either way, only services/api needs to change.
 */
export interface GuardianStudentWithDetails extends GuardianStudent {
  student: Student;
}
