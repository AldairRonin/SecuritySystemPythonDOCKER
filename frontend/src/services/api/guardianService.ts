import type { GuardianStudent, GuardianStudentWithDetails, Student } from '@/types';
import { apiRequest } from './client';

interface BackendGuardianStudent {
  id: string;
  student_id: string;
  guardian_id: string;
  relationship_type: GuardianStudent['relationshipType'];
  verification_status: GuardianStudent['verificationStatus'];
  created_at: string;
}

interface BackendStudent {
  id: string;
  full_name: string;
  class_name: string;
  status: Student['status'];
  created_at: string;
  updated_at: string;
}

function mapGuardianStudent(data: BackendGuardianStudent): GuardianStudent {
  return {
    id: data.id,
    studentId: data.student_id,
    guardianId: data.guardian_id,
    relationshipType: data.relationship_type,
    verificationStatus: data.verification_status,
    createdAt: data.created_at,
  };
}

function mapStudent(data: BackendStudent): Student {
  return {
    id: data.id,
    fullName: data.full_name,
    className: data.class_name,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getMyChildren(
  _guardianId: string,
  token?: string | null,
): Promise<GuardianStudentWithDetails[]> {
  const links = await apiRequest<BackendGuardianStudent[]>(
    '/guardian-students/',
    {
      token,
    },
  );

  const students = await apiRequest<BackendStudent[]>(
    '/students/',
  );

  const studentMap = new Map(
    students.map((student) => [student.id, mapStudent(student)]),
  );

  return links.map((link) => {
    const student = studentMap.get(link.student_id);

    if (!student) {
      throw new Error(`Student ${link.student_id} not found`);
    }

    return {
      ...mapGuardianStudent(link),
      student,
    };
  });
}

export async function getGuardianStudentById(
  guardianStudentId: string,
  token?: string | null,
): Promise<GuardianStudentWithDetails | null> {
  const links = await apiRequest<BackendGuardianStudent[]>(
    '/guardian-students/',
    {
      token,
    },
  );

  const link = links.find((item) => item.id === guardianStudentId);

  if (!link) {
    return null;
  }

  const students = await apiRequest<BackendStudent[]>(
    '/students/',
  );

  const student = students
    .map(mapStudent)
    .find((item) => item.id === link.student_id);

  if (!student) {
    return null;
  }

  return {
    ...mapGuardianStudent(link),
    student,
  };
}
export async function createGuardianStudent(
  studentId: string,
  relationshipType: GuardianStudent['relationshipType'],
  token?: string | null
): Promise<GuardianStudent> {
  const guardianStudent = await apiRequest<BackendGuardianStudent>(
    '/guardian-students/',
    {
      method: 'POST',
      token,
      body: {
        student_id: studentId,
        relationship_type: relationshipType,
      },
    }
  );

  return mapGuardianStudent(guardianStudent);
}
export async function resubmitVerificationRequest(
  guardianStudentId: string,
  token?: string | null,
) {
  return apiRequest('/verification-requests/', {
    method: 'POST',
    token,
    body: {
      guardian_student_id: guardianStudentId,
    },
  });
}
export async function deleteGuardianStudent(
  guardianStudentId: string,
  token?: string | null,
): Promise<void> {
  await apiRequest<void>(
    `/guardian-students/${guardianStudentId}`,
    {
      method: 'DELETE',
      token,
    },
  );
}