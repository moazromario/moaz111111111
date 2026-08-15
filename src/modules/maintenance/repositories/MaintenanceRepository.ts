import { BaseRepository } from '../../shared/BaseRepository';
import { MaintenanceOrder } from '../types';

export class MaintenanceOrdersRepository extends BaseRepository<MaintenanceOrder> {
  constructor() {
    super('maintenanceOrders');
  }
}

export const maintenanceOrdersRepo = new MaintenanceOrdersRepository();
