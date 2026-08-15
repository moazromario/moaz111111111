import { showroomsRepo, showroomInventoryRepo } from '../repositories/ShowroomsRepository';
import { Showroom, ShowroomInventory } from '../types';
import { validateShowroom, validateShowroomInventory } from '../schemas';

export class ShowroomsService {
  async getShowrooms(): Promise<Showroom[]> {
    return await showroomsRepo.getAll();
  }

  async addShowroom(showroom: Omit<Showroom, 'id'>): Promise<Showroom> {
    validateShowroom(showroom);
    return await showroomsRepo.create(showroom);
  }

  async getInventory(showroomId: string): Promise<ShowroomInventory[]> {
    return await showroomInventoryRepo.findWhere('showroomId', '==', showroomId);
  }

  async updateInventoryQuantity(id: string, delta: number): Promise<void> {
    const record = await showroomInventoryRepo.getById(id);
    if (!record) throw new Error('سجل مخزون المعرض غير موجود.');
    const newQty = (record.quantity || 0) + delta;
    if (newQty < 0) throw new Error('الكمية المتبقية لا تكفي لإتمام الحركة.');
    await showroomInventoryRepo.update(id, { quantity: newQty });
  }
}

export const showroomsService = new ShowroomsService();
