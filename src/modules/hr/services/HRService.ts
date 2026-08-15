import { employeesRepo, attendanceRepo } from '../repositories/HRRepository';
import { Employee, AttendanceRecord } from '../types';
import { validateEmployee, validateAttendance } from '../schemas';

export class HRService {
  async getEmployees(): Promise<Employee[]> {
    return await employeesRepo.getAll();
  }

  async addEmployee(emp: Omit<Employee, 'id'>): Promise<Employee> {
    validateEmployee(emp);
    return await employeesRepo.create(emp);
  }

  async recordAttendance(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    validateAttendance(record);
    return await attendanceRepo.create(record);
  }

  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    return await attendanceRepo.findWhere('date', '==', date);
  }
}

export const hrService = new HRService();
