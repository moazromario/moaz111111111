export interface Item {
  id: string;
  name: string;
  unit: string;
  price: number;
  department: string;
  warehouseId: string;
  openingBalance: number;
  inward: number;
  outward: number;
  returned: number;
  wasted: number;
  currentBalance: number;
  safetyLimit: number;
}

export interface Waste {
  id: string;
  date: string;
  itemId: string;
  quantity: number;
  unit: string;
  reason: string;
  notes: string;
}

export interface Warehouse {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface CostCenter {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  totalPurchases: number;
  totalPayments: number;
  balance: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplierId: string;
  itemId: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  paidAmount: number;
  paymentStatus: 'آجل' | 'نقدي' | 'شيك';
  notes: string;
}

export interface Issuance {
  id: string;
  date: string;
  jobOrderNo: string;
  itemId: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  costCenter: string;
}

export interface ProductionJob {
  id: string;
  orderNo: string;
  clientName: string;
  productName: string;
  startDate: string;
  deadline: string;
  status: string; // This will be the CostCenter ID or name
  priority: 'منخفضة' | 'متوسطة' | 'عالية';
  notes: string;
}

export interface LoadingManifest {
  id: string;
  date: string;
  driverName: string;
  carNumber: string;
  destinationType: 'عميل' | 'معرض';
  clientName: string; // Can be "المعرض" or actual client name
  orderNumbers: string; // Can be multiple orders comma separated or just text
  products: {
    name: string;
    components: string;
    notes: string;
    salesPerson: string;
    additions: string;
  }[];
  loaderName: string;
  notes: string;
  createdAt?: any;
}

export interface BladeSharpening {
  id: string;
  date: string;
  bladeName: string;
  quantity: number;
  cost: number;
  notes: string;
}

export interface PlateSharpening {
  id: string;
  date: string;
  plateName: string;
  quantity: number;
  cost: number;
  notes: string;
}

export interface MachineMaintenance {
  id: string;
  date: string;
  machineName: string;
  maintenanceType: string;
  cost: number;
  notes: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  dailyRate: number;
  hireDate: string;
  status: 'نشط' | 'موقوف' | 'مستقيل';
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'حضور' | 'غياب' | 'تأخير' | 'إجازة';
}

export interface FinancialTransaction {
  id: string;
  employeeId: string;
  date: string;
  type: 'مكافأة' | 'خصم' | 'بدل' | 'إضافي';
  amount: number;
  description: string;
  overtimeHours?: number;
  overtimeRate?: 1.33 | 1.5 | 2;
}

export interface Loan {
  id: string;
  employeeId: string;
  date: string;
  amount: number;
  remainingAmount: number;
  installments?: number;
  paidAlready?: number;
  notes?: string;
  status: 'نشط' | 'مسدد';
}

export interface Payroll {
  id: string;
  employeeId: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  dailyRate: number;
  daysWorked: number;
  baseSalary: number;
  totalBonuses: number;
  totalOvertime: number;
  totalDeductions: number;
  totalLoans: number;
  netSalary: number;
  status: 'مسودة' | 'مدفوع';
  paymentDate?: string;
}

export type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | undefined;
    providerInfo: any[];
  };
}
