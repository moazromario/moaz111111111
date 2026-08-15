import { BaseRepository } from '../../shared/BaseRepository';
import { BOM, WorkCenter, ProductionJob } from '../types';

export class BOMRepository extends BaseRepository<BOM> {
  constructor() {
    super('boms');
  }
}

export class WorkCentersRepository extends BaseRepository<WorkCenter> {
  constructor() {
    super('workCenters');
  }
}

export class ProductionJobsRepository extends BaseRepository<ProductionJob> {
  constructor() {
    super('productionJobs');
  }
}

export const bomsRepo = new BOMRepository();
export const workCentersRepo = new WorkCentersRepository();
export const productionJobsRepo = new ProductionJobsRepository();
