export type StudentStatus = 'ACTIVE' | 'INACTIVE';

export interface Student {
  id: string;
  fullName: string;
  className: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}
