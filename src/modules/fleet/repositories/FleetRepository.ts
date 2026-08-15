import { BaseRepository } from '../../shared/BaseRepository';
import { Vehicle, VehicleExpense } from '../types';

export class VehiclesRepository extends BaseRepository<Vehicle> {
  constructor() {
    super('vehicles');
  }
}

export class VehicleExpensesRepository extends BaseRepository<VehicleExpense> {
  constructor() {
    super('vehicleExpenses');
  }
}

export const vehiclesRepo = new VehiclesRepository();
export const vehicleExpensesRepo = new VehicleExpensesRepository();
