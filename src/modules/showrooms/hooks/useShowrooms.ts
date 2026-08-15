import { useState, useEffect, useCallback } from 'react';
import { Showroom, ShowroomInventory } from '../types';
import { showroomsService } from '../services/ShowroomsService';
import { showroomsRepo, showroomInventoryRepo } from '../repositories/ShowroomsRepository';

export function useShowrooms() {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [inventories, setInventories] = useState<ShowroomInventory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubShowrooms = showroomsRepo.subscribeAll((data) => {
      setShowrooms(data);
      setLoading(false);
    }, (err) => setError(err.message));

    const unsubInv = showroomInventoryRepo.subscribeAll((data) => {
      setInventories(data);
    });

    return () => {
      unsubShowrooms();
      unsubInv();
    };
  }, []);

  const addShowroom = useCallback(async (showroom: Omit<Showroom, 'id'>) => {
    try {
      setError(null);
      return await showroomsService.addShowroom(showroom);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    showrooms,
    inventories,
    loading,
    error,
    addShowroom
  };
}
