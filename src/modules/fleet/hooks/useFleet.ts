import { useState, useEffect, useCallback } from 'react';
import { Vehicle, VehicleExpense } from '../types';
import { fleetService } from '../services/FleetService';
import { vehiclesRepo, vehicleExpensesRepo } from '../repositories/FleetRepository';

export function useFleet() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubVehicles = vehiclesRepo.subscribeAll((data) => {
      setVehicles(data);
      setLoading(false);
    }, (err) => setError(err.message));

    const unsubExp = vehicleExpensesRepo.subscribeAll((data) => {
      setExpenses(data);
    });

    return () => {
      unsubVehicles();
      unsubExp();
    };
  }, []);

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      setError(null);
      return await fleetService.addVehicle(vehicle);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const addExpense = useCallback(async (expense: Omit<VehicleExpense, 'id'>) => {
    try {
      setError(null);
      return await fleetService.addExpense(expense);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    vehicles,
    expenses,
    loading,
    error,
    addVehicle,
    addExpense
  };
}
