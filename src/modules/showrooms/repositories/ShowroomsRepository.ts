import { BaseRepository } from '../../shared/BaseRepository';
import { Showroom, ShowroomInventory } from '../types';

export class ShowroomsRepository extends BaseRepository<Showroom> {
  constructor() {
    super('showrooms');
  }
}

export class ShowroomInventoryRepository extends BaseRepository<ShowroomInventory> {
  constructor() {
    super('showroomInventory');
  }
}

export const showroomsRepo = new ShowroomsRepository();
export const showroomInventoryRepo = new ShowroomInventoryRepository();
