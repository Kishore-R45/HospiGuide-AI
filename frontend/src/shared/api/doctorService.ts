export interface Doctor {
  id: number;
  name: string;
  department_id: number;
  specialty: string;
  specialization: string;
  room_number: string;
  timing: string;
  days: string;
  isAvailableNow?: boolean; // Computed on frontend
}

export interface Department {
  id: number;
  name: string;
  block_id: number;
  floor: string;
  room: string;
  location_hint: string;
}

const API_BASE_URL = 'http://localhost:3000/api';

export const getDepartments = async (): Promise<Department[]> => {
  const response = await fetch(`${API_BASE_URL}/departments`);
  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }
  return response.json();
};

export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await fetch(`${API_BASE_URL}/doctors`);
  if (!response.ok) {
    throw new Error('Failed to fetch doctors');
  }
  return response.json();
};

export const getDoctorsByDepartment = async (departmentId: number): Promise<Doctor[]> => {
  const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/doctors`);
  if (!response.ok) {
    throw new Error(`Failed to fetch doctors for department ${departmentId}`);
  }
  return response.json();
};
