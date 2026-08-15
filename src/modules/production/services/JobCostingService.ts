import { ProductionOrder, ProductionCosting } from '../types';

export class JobCostingService {
  calculateActualCost(
    directMaterial: number,
    directLabor: number,
    machineCost: number,
    otherDirectCost: number,
    allocatedOverhead: number,
    reworkCost: number,
    scrapCost: number
  ): ProductionCosting {
    const actualProductionCost =
      directMaterial +
      directLabor +
      machineCost +
      otherDirectCost +
      allocatedOverhead +
      reworkCost +
      scrapCost;

    return {
      directMaterial,
      directLabor,
      machineCost,
      otherDirectCost,
      allocatedOverhead,
      reworkCost,
      scrapCost,
      actualProductionCost,
      grossProfit: 0 // Placeholder, requires selling price
    };
  }

  calculateGrossProfit(costing: ProductionCosting, sellingPrice: number): number {
    return sellingPrice - costing.actualProductionCost;
  }
}

export const jobCostingService = new JobCostingService();
