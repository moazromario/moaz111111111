import { maintenanceOrdersRepo } from '../repositories/MaintenanceRepository';
import { MaintenanceOrder } from '../types';
import { validateMaintenanceOrder } from '../schemas';

export class MaintenanceService {
  async getOrders(): Promise<MaintenanceOrder[]> {
    return await maintenanceOrdersRepo.getAll();
  }

  async createOrder(order: Omit<MaintenanceOrder, 'id'>): Promise<MaintenanceOrder> {
    validateMaintenanceOrder(order);
    return await maintenanceOrdersRepo.create(order);
  }

  async updateOrderStatus(id: string, status: MaintenanceOrder['status'], cost?: number): Promise<void> {
    const updatePayload: Partial<MaintenanceOrder> = { status };
    if (cost !== undefined) {
      updatePayload.cost = cost;
    }
    if (status === 'completed') {
      updatePayload.dateCompleted = new Date().toISOString();
    }
    await maintenanceOrdersRepo.update(id, updatePayload);
  }
}

export const maintenanceService = new MaintenanceService();
