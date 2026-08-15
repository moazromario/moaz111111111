import { BaseRepository } from '../../shared/BaseRepository';
import { Employee, AttendanceRecord } from '../types';

export class EmployeesRepository extends BaseRepository<Employee> {
  constructor() {
    super('employees');
  }
}

export class AttendanceRepository extends BaseRepository<AttendanceRecord> {
  constructor() {
    super('attendance');
  }
}

export const employeesRepo = new EmployeesRepository();
export const attendanceRepo = new AttendanceRepository();
