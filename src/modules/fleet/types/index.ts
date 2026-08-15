export interface Vehicle {
  id?: string;
  plateNumber: string;
  model: string;
  type: 'truck' | 'car' | 'bus' | 'van';
  status: 'active' | 'in_service' | 'inactive';
  driverName?: string;
}

export interface VehicleExpense {
  id?: string;
  vehicleId: string;
  plateNumber: string;
  date: string;
  type: 'fuel' | 'maintenance' | 'insurance' | 'fine' | 'other';
  amount: number;
  description: string;
}
