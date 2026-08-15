export interface Employee {
  id?: string;
  code: string;
  name: string;
  nationalId?: string;
  phone?: string;
  department: string;
  jobTitle: string;
  basicSalary: number;
  hireDate: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'leave' | 'excused';
  notes?: string;
}
