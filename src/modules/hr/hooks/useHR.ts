import { useState, useEffect, useCallback } from 'react';
import { Employee, AttendanceRecord } from '../types';
import { hrService } from '../services/HRService';
import { employeesRepo, attendanceRepo } from '../repositories/HRRepository';

export function useHR() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubEmployees = employeesRepo.subscribeAll((data) => {
      setEmployees(data);
      setLoading(false);
    }, (err) => setError(err.message));

    const unsubAttendance = attendanceRepo.subscribeAll((data) => {
      setAttendance(data);
    });

    return () => {
      unsubEmployees();
      unsubAttendance();
    };
  }, []);

  const addEmployee = useCallback(async (emp: Omit<Employee, 'id'>) => {
    try {
      setError(null);
      return await hrService.addEmployee(emp);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const recordAttendance = useCallback(async (record: Omit<AttendanceRecord, 'id'>) => {
    try {
      setError(null);
      return await hrService.recordAttendance(record);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    employees,
    attendance,
    loading,
    error,
    addEmployee,
    recordAttendance
  };
}
