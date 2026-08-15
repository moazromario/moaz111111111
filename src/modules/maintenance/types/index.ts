export interface MaintenanceOrder {
  id?: string;
  orderNumber: string;
  machineName: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  cost?: number;
  dateCreated: string;
  dateCompleted?: string;
}
