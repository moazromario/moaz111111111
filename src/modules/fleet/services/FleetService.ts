import { vehiclesRepo, vehicleExpensesRepo } from '../repositories/FleetRepository';
import { Vehicle, VehicleExpense } from '../types';
import { validateVehicle, validateVehicleExpense } from '../schemas';

export class FleetService {
  async getVehicles(): Promise<Vehicle[]> {
    return await vehiclesRepo.getAll();
  }

  async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    validateVehicle(vehicle);
    return await vehiclesRepo.create(vehicle);
  }

  async addExpense(expense: Omit<VehicleExpense, 'id'>): Promise<VehicleExpense> {
    validateVehicleExpense(expense);
    return await vehicleExpensesRepo.create(expense);
  }
}

export const fleetService = new FleetService();
