import type { Student } from '@/types';
import { apiRequest } from './client';

interface BackendStudent {
  id: string;
  full_name: string;
  class_name: string;
  status: Student['status'];
  created_at: string;
  updated_at: string;
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

export async function searchStudents(
  fullName: string,
  className: string,
  token?: string | null
): Promise<Student[]> {
  const params = new URLSearchParams({
    full_name: fullName,
    class_name: className,
  });

  const students = await apiRequest<BackendStudent[]>(
    `/students/search?${params.toString()}`,
    {
      token,
    }
  );

  return students.map(mapStudent);
}