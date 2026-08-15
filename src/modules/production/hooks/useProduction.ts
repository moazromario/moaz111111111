import { useState, useEffect, useCallback } from 'react';
import { BOM, WorkCenter, ProductionJob } from '../types';
import { productionService } from '../services/ProductionService';
import { bomsRepo, workCentersRepo, productionJobsRepo } from '../repositories/ProductionRepository';

export function useProduction() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [productionJobs, setProductionJobs] = useState<ProductionJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubBOMs = bomsRepo.subscribeAll((data) => {
      setBoms(data);
      setLoading(false);
    }, (err) => setError(err.message));

    const unsubWCs = workCentersRepo.subscribeAll((data) => {
      setWorkCenters(data);
    });

    const unsubJobs = productionJobsRepo.subscribeAll((data) => {
      setProductionJobs(data);
    });

    return () => {
      unsubBOMs();
      unsubWCs();
      unsubJobs();
    };
  }, []);

  const createBOM = useCallback(async (bom: Omit<BOM, 'id'>) => {
    try {
      setError(null);
      return await productionService.createBOM(bom);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createWorkCenter = useCallback(async (wc: Omit<WorkCenter, 'id'>) => {
    try {
      setError(null);
      return await productionService.createWorkCenter(wc);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createJob = useCallback(async (job: Omit<ProductionJob, 'id'>) => {
    try {
      setError(null);
      return await productionService.createJob(job);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateJobStatus = useCallback(async (id: string, status: ProductionJob['status'], quantityProduced?: number) => {
    try {
      setError(null);
      await productionService.updateJobStatus(id, status, quantityProduced);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    boms,
    workCenters,
    productionJobs,
    loading,
    error,
    createBOM,
    createWorkCenter,
    createJob,
    updateJobStatus
  };
}
