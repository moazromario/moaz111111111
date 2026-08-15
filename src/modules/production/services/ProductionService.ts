import { bomsRepo, workCentersRepo, productionJobsRepo } from '../repositories/ProductionRepository';
import { BOM, WorkCenter, ProductionJob } from '../types';
import { validateBOM, validateProductionJob, validateWorkCenter } from '../schemas';

export class ProductionService {
  async getBOMs(): Promise<BOM[]> {
    return await bomsRepo.getAll();
  }

  async createBOM(bom: Omit<BOM, 'id'>): Promise<BOM> {
    validateBOM(bom);
    return await bomsRepo.create(bom);
  }

  async getWorkCenters(): Promise<WorkCenter[]> {
    return await workCentersRepo.getAll();
  }

  async createWorkCenter(wc: Omit<WorkCenter, 'id'>): Promise<WorkCenter> {
    validateWorkCenter(wc);
    return await workCentersRepo.create(wc);
  }

  async createJob(job: Omit<ProductionJob, 'id'>): Promise<ProductionJob> {
    validateProductionJob(job);
    return await productionJobsRepo.create(job);
  }

  async updateJobStatus(id: string, status: ProductionJob['status'], quantityProduced?: number): Promise<void> {
    const updatePayload: Partial<ProductionJob> = { status };
    if (quantityProduced !== undefined) {
      updatePayload.quantityProduced = quantityProduced;
    }
    if (status === 'in_progress') {
      updatePayload.startDate = new Date().toISOString();
    } else if (status === 'completed' || status === 'cancelled') {
      updatePayload.endDate = new Date().toISOString();
    }
    await productionJobsRepo.update(id, updatePayload);
  }
}

export const productionService = new ProductionService();
