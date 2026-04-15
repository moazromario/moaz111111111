/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './AuthContext';
import { loginWithGoogle, logout } from './firebase';
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ArrowUpRight, 
  Users, 
  Settings,
  LogOut,
  Plus,
  Search,
  AlertTriangle,
  FileText,
  BarChart3,
  Edit2,
  Trash2,
  Truck,
  Calendar,
  CheckCircle2,
  Printer,
  History,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Download,
  Upload,
  AlertCircle,
  LayoutGrid,
  List,
  Layers,
  DollarSign,
  Wrench,
  ChevronDown,
  Building2,
  ShieldAlert,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { db } from './firebase';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, increment, serverTimestamp } from 'firebase/firestore';
import { Item, Supplier, Purchase, Issuance, Warehouse, Unit, CostCenter, ProductionJob, LoadingManifest, Waste, BladeSharpening, PlateSharpening, MachineMaintenance, Employee, Attendance, FinancialTransaction, Loan, Payroll, SupplierPayment, JobLabor, JobOtherCost } from './types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { handleFirestoreError } from './lib/firestore-utils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// --- Components ---

function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "تأكيد الحذف",
  cancelText = "إلغاء"
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <Card className="dribbble-card w-full max-w-sm border-none shadow-2xl animate-in fade-in zoom-in duration-200">
        <CardHeader className="pb-2">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <CardTitle className="font-black text-xl text-slate-900">{title}</CardTitle>
          <CardDescription className="font-bold text-slate-500">{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 pt-4">
          <Button className="btn-ghost flex-1 h-11" onClick={onCancel}>{cancelText}</Button>
          <Button className="btn-danger flex-1 h-11" onClick={onConfirm}>{confirmText}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('هذا النطاق (Domain) غير مصرح له بتسجيل الدخول. يرجى إضافته في إعدادات Firebase Authentication.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('تم إغلاق نافذة تسجيل الدخول قبل الاكتمال.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('تم حظر نافذة تسجيل الدخول المنبثقة. يرجى السماح بالنوافذ المنبثقة (Pop-ups) في متصفحك.');
      } else {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md dribbble-card border-none shadow-2xl shadow-primary/10 relative z-10">
        <CardHeader className="text-center space-y-4 pt-12 pb-8">
          <div className="mx-auto w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mb-4 shadow-xl shadow-primary/30 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Package className="text-white w-10 h-10" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black tracking-tight text-slate-900">مصنع النجار</CardTitle>
            <CardDescription className="text-slate-500 font-bold text-lg">نظام إدارة المخازن والإنتاج الذكي</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-12 space-y-8">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center border border-red-100">
                {error}
              </div>
            )}
            <Button 
              onClick={handleLogin} 
              disabled={isLoading}
              className="btn-primary w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="animate-pulse">جاري تسجيل الدخول...</span>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  تسجيل الدخول باستخدام جوجل
                </>
              )}
            </Button>
            <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
              نظام آمن ومشفر لإدارة الموارد
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);
  const [productionMenuOpen, setProductionMenuOpen] = useState(false);
  const [maintenanceMenuOpen, setMaintenanceMenuOpen] = useState(false);
  const [itemCardSelectedId, setItemCardSelectedId] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [issuances, setIssuances] = useState<Issuance[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [productionJobs, setProductionJobs] = useState<ProductionJob[]>([]);
  const [loadingManifests, setLoadingManifests] = useState<LoadingManifest[]>([]);
  const [wasteRecords, setWasteRecords] = useState<Waste[]>([]);
  const [bladeSharpening, setBladeSharpening] = useState<BladeSharpening[]>([]);
  const [plateSharpening, setPlateSharpening] = useState<PlateSharpening[]>([]);
  const [machineMaintenance, setMachineMaintenance] = useState<MachineMaintenance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [hrTransactions, setHrTransactions] = useState<FinancialTransaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);
  const [jobLabors, setJobLabors] = useState<JobLabor[]>([]);
  const [jobOtherCosts, setJobOtherCosts] = useState<JobOtherCost[]>([]);
  const [hrMenuOpen, setHrMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubWarehouses = onSnapshot(collection(db, 'warehouses'), (snap) => {
      setWarehouses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Warehouse)));
    }, (err) => handleFirestoreError(err, 'list', 'warehouses'));

    const unsubUnits = onSnapshot(collection(db, 'units'), (snap) => {
      setUnits(snap.docs.map(d => ({ id: d.id, ...d.data() } as Unit)));
    }, (err) => handleFirestoreError(err, 'list', 'units'));

    const unsubCostCenters = onSnapshot(collection(db, 'costCenters'), (snap) => {
      setCostCenters(snap.docs.map(d => ({ id: d.id, ...d.data() } as CostCenter)));
    }, (err) => handleFirestoreError(err, 'list', 'costCenters'));

    const unsubItems = onSnapshot(collection(db, 'items'), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as Item)));
    }, (err) => handleFirestoreError(err, 'list', 'items'));

    const unsubSuppliers = onSnapshot(collection(db, 'suppliers'), (snap) => {
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Supplier)));
    }, (err) => handleFirestoreError(err, 'list', 'suppliers'));

    const unsubPurchases = onSnapshot(collection(db, 'purchases'), (snap) => {
      setPurchases(snap.docs.map(d => ({ id: d.id, ...d.data() } as Purchase)));
    }, (err) => handleFirestoreError(err, 'list', 'purchases'));

    const unsubIssuances = onSnapshot(collection(db, 'issuances'), (snap) => {
      setIssuances(snap.docs.map(d => ({ id: d.id, ...d.data() } as Issuance)));
    }, (err) => handleFirestoreError(err, 'list', 'issuances'));

    const unsubProductionJobs = onSnapshot(collection(db, 'productionJobs'), (snap) => {
      setProductionJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductionJob)));
    }, (err) => handleFirestoreError(err, 'list', 'productionJobs'));

    const unsubLoadingManifests = onSnapshot(collection(db, 'loadingManifests'), (snap) => {
      setLoadingManifests(snap.docs.map(d => ({ id: d.id, ...d.data() } as LoadingManifest)));
    }, (err) => handleFirestoreError(err, 'list', 'loadingManifests'));

    const unsubWaste = onSnapshot(collection(db, 'waste'), (snap) => {
      setWasteRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as Waste)));
    }, (err) => handleFirestoreError(err, 'list', 'waste'));

    const unsubBladeSharpening = onSnapshot(collection(db, 'bladeSharpening'), (snap) => {
      setBladeSharpening(snap.docs.map(d => ({ id: d.id, ...d.data() } as BladeSharpening)));
    }, (err) => handleFirestoreError(err, 'list', 'bladeSharpening'));

    const unsubPlateSharpening = onSnapshot(collection(db, 'plateSharpening'), (snap) => {
      setPlateSharpening(snap.docs.map(d => ({ id: d.id, ...d.data() } as PlateSharpening)));
    }, (err) => handleFirestoreError(err, 'list', 'plateSharpening'));

    const unsubMachineMaintenance = onSnapshot(collection(db, 'machineMaintenance'), (snap) => {
      setMachineMaintenance(snap.docs.map(d => ({ id: d.id, ...d.data() } as MachineMaintenance)));
    }, (err) => handleFirestoreError(err, 'list', 'machineMaintenance'));

    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snap) => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() } as Employee)));
    }, (err) => handleFirestoreError(err, 'list', 'employees'));

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      setAttendance(snap.docs.map(d => ({ id: d.id, ...d.data() } as Attendance)));
    }, (err) => handleFirestoreError(err, 'list', 'attendance'));

    const unsubHrTransactions = onSnapshot(collection(db, 'hrTransactions'), (snap) => {
      setHrTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as FinancialTransaction)));
    }, (err) => handleFirestoreError(err, 'list', 'hrTransactions'));

    const unsubLoans = onSnapshot(collection(db, 'loans'), (snap) => {
      setLoans(snap.docs.map(d => ({ id: d.id, ...d.data() } as Loan)));
    }, (err) => handleFirestoreError(err, 'list', 'loans'));

    const unsubPayrolls = onSnapshot(collection(db, 'payrolls'), (snap) => {
      setPayrolls(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payroll)));
    }, (err) => handleFirestoreError(err, 'list', 'payrolls'));

    const unsubSupplierPayments = onSnapshot(collection(db, 'supplierPayments'), (snap) => {
      setSupplierPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as SupplierPayment)));
    }, (err) => handleFirestoreError(err, 'list', 'supplierPayments'));

    const unsubJobLabors = onSnapshot(collection(db, 'jobLabors'), (snap) => {
      setJobLabors(snap.docs.map(d => ({ id: d.id, ...d.data() } as JobLabor)));
    }, (err) => handleFirestoreError(err, 'list', 'jobLabors'));

    const unsubJobOtherCosts = onSnapshot(collection(db, 'jobOtherCosts'), (snap) => {
      setJobOtherCosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as JobOtherCost)));
    }, (err) => handleFirestoreError(err, 'list', 'jobOtherCosts'));

    return () => {
      unsubWarehouses();
      unsubUnits();
      unsubCostCenters();
      unsubItems();
      unsubSuppliers();
      unsubPurchases();
      unsubIssuances();
      unsubProductionJobs();
      unsubLoadingManifests();
      unsubWaste();
      unsubBladeSharpening();
      unsubPlateSharpening();
      unsubMachineMaintenance();
      unsubEmployees();
      unsubAttendance();
      unsubHrTransactions();
      unsubLoans();
      unsubPayrolls();
      unsubSupplierPayments();
      unsubJobLabors();
      unsubJobOtherCosts();
    };
  }, [user]);

  if (!user) return <LoginPage />;

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const getItemMovements = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return [];

    const movements: any[] = [];
    movements.push({
      date: '---',
      type: 'رصيد أول المدة',
      in: item.openingBalance,
      out: 0,
      balance: item.openingBalance,
      notes: 'الرصيد الافتتاحي عند التأسيس'
    });

    purchases.filter(p => p.itemId === itemId).forEach(p => {
      movements.push({
        date: p.date,
        type: 'شراء (وارد)',
        in: p.quantity,
        out: 0,
        notes: `مورد: ${suppliers.find(s => s.id === p.supplierId)?.name || 'غير معروف'}`
      });
    });

    issuances.filter(iss => iss.itemId === itemId).forEach(iss => {
      const isReturn = iss.jobOrderNo === 'RETURN';
      const isReturnFromCostCenter = iss.costCenter.startsWith('مرتجع من:');
      
      if (isReturn) {
        if (isReturnFromCostCenter) {
          movements.push({
            date: iss.date,
            type: 'مرتجع (وارد)',
            in: iss.quantity,
            out: 0,
            notes: iss.costCenter
          });
        } else {
          movements.push({
            date: iss.date,
            type: 'مرتجع (منصرف)',
            in: 0,
            out: iss.quantity,
            notes: iss.costCenter
          });
        }
      } else {
        movements.push({
          date: iss.date,
          type: 'صرف (منصرف)',
          in: 0,
          out: iss.quantity,
          notes: `أمر تشغيل: ${iss.jobOrderNo} | ${iss.costCenter}`
        });
      }
    });

    wasteRecords.filter(w => w.itemId === itemId).forEach(w => {
      movements.push({
        date: w.date,
        type: 'هالك (منصرف)',
        in: 0,
        out: w.quantity,
        notes: `سبب الهالك: ${w.reason} | ${w.notes}`
      });
    });

    const sorted = movements.sort((a, b) => {
      if (a.date === '---') return -1;
      if (b.date === '---') return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    let currentBal = 0;
    return sorted.map(m => {
      currentBal += (m.in - m.out);
      return { ...m, balance: currentBal };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans" dir="rtl">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Package className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-slate-900">النجار للأثاث</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-xl">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 w-72 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-50 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:shadow-xl md:shadow-blue-500/5 md:z-20
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-8 hidden md:block">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Package className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-900">النجار للأثاث</h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">نظام الإدارة الذكي</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:hidden flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900">القائمة</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-xl">
            <X size={20} />
          </Button>
        </div>
        
        <nav className="flex-1 px-4 py-6 md:py-0 space-y-1.5 overflow-y-auto">
          <NavButton active={activeTab === 'dashboard'} onClick={() => handleNavClick('dashboard')} icon={<LayoutDashboard size={20} />} label="لوحة التحكم" />
          
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">المخازن والعمليات</div>
          
          <div>
            <button 
              onClick={() => setInventoryMenuOpen(!inventoryMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                ['inventory', 'issuances', 'returns'].includes(activeTab) 
                ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-[-4px]' 
                : 'text-slate-500 hover:bg-blue-50 hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`transition-transform duration-300 ${['inventory', 'issuances', 'returns'].includes(activeTab) ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Package size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">المخزن</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${inventoryMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${inventoryMenuOpen ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="mr-4 pr-4 border-r-2 border-slate-100 space-y-1.5">
                <SubNavButton active={activeTab === 'inventory'} onClick={() => handleNavClick('inventory')} label="رصيد المخزن" />
                <SubNavButton active={activeTab === 'itemCard'} onClick={() => handleNavClick('itemCard')} label="كارت الصنف" />
                <SubNavButton active={activeTab === 'issuances'} onClick={() => handleNavClick('issuances')} label="صرف الخامات" />
                <SubNavButton active={activeTab === 'returns'} onClick={() => handleNavClick('returns')} label="المرتجع" />
                <SubNavButton active={activeTab === 'waste'} onClick={() => handleNavClick('waste')} label="الهالك" />
              </div>
            </div>
          </div>

          <div>
            <button 
              onClick={() => setProductionMenuOpen(!productionMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                ['production', 'loading'].includes(activeTab) 
                ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-[-4px]' 
                : 'text-slate-500 hover:bg-blue-50 hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`transition-transform duration-300 ${['production', 'loading'].includes(activeTab) ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <LayoutDashboard size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">خط الإنتاج</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${productionMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${productionMenuOpen ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="mr-4 pr-4 border-r-2 border-slate-100 space-y-1.5">
                <SubNavButton active={activeTab === 'production'} onClick={() => handleNavClick('production')} label="أوامر الإنتاج" />
                <SubNavButton active={activeTab === 'loading'} onClick={() => handleNavClick('loading')} label="حمولة العربية" />
              </div>
            </div>
          </div>

          <div>
            <button 
              onClick={() => setMaintenanceMenuOpen(!maintenanceMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                ['bladeSharpening', 'plateSharpening', 'machineMaintenance'].includes(activeTab) 
                ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-[-4px]' 
                : 'text-slate-500 hover:bg-blue-50 hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`transition-transform duration-300 ${['bladeSharpening', 'plateSharpening', 'machineMaintenance'].includes(activeTab) ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Wrench size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">الصيانة</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${maintenanceMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${maintenanceMenuOpen ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="mr-4 pr-4 border-r-2 border-slate-100 space-y-1.5">
                <SubNavButton active={activeTab === 'bladeSharpening'} onClick={() => handleNavClick('bladeSharpening')} label="سن الصواني" />
                <SubNavButton active={activeTab === 'plateSharpening'} onClick={() => handleNavClick('plateSharpening')} label="سن الصفايح" />
                <SubNavButton active={activeTab === 'machineMaintenance'} onClick={() => handleNavClick('machineMaintenance')} label="صيانة الالات والمعدات" />
              </div>
            </div>
          </div>

          <NavButton active={activeTab === 'purchases'} onClick={() => handleNavClick('purchases')} icon={<ShoppingCart size={20} />} label="المشتريات" />
          
          <div>
            <button 
              onClick={() => setHrMenuOpen(!hrMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                ['employees', 'attendance', 'loans', 'payroll', 'hrTransactions'].includes(activeTab) 
                ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-[-4px]' 
                : 'text-slate-500 hover:bg-blue-50 hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`transition-transform duration-300 ${['employees', 'attendance', 'loans', 'payroll', 'hrTransactions'].includes(activeTab) ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <DollarSign size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">الأجور والمرتبات</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${hrMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${hrMenuOpen ? 'max-h-[400px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="mr-4 pr-4 border-r-2 border-slate-100 space-y-1.5">
                <SubNavButton active={activeTab === 'employees'} onClick={() => handleNavClick('employees')} label="الموظفين" />
                <SubNavButton active={activeTab === 'attendance'} onClick={() => handleNavClick('attendance')} label="الحضور والانصراف" />
                <SubNavButton active={activeTab === 'hrTransactions'} onClick={() => handleNavClick('hrTransactions')} label="الحركات المالية" />
                <SubNavButton active={activeTab === 'loans'} onClick={() => handleNavClick('loans')} label="إدارة السلف" />
                <SubNavButton active={activeTab === 'payroll'} onClick={() => handleNavClick('payroll')} label="كشوف الرواتب" />
                <SubNavButton active={activeTab === 'archive'} onClick={() => handleNavClick('archive')} label="الأرشيف" />
              </div>
            </div>
          </div>

          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">الإدارة والتقارير</div>
          <NavButton active={activeTab === 'suppliers'} onClick={() => handleNavClick('suppliers')} icon={<Users size={20} />} label="الموردين" />
          <NavButton active={activeTab === 'reports'} onClick={() => handleNavClick('reports')} icon={<BarChart3 size={20} />} label="التقارير" />
          <NavButton active={activeTab === 'settings'} onClick={() => handleNavClick('settings')} icon={<Settings size={20} />} label="الإعدادات" />
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 mb-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            <img src={user.photoURL || ''} className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-900">{user.displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl" onClick={logout}>
            <LogOut size={18} className="ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-auto">
        {activeTab === 'dashboard' && <Dashboard 
          items={items} 
          suppliers={suppliers} 
          purchases={purchases} 
          issuances={issuances} 
          employees={employees}
          productionJobs={productionJobs}
          loadingManifests={loadingManifests}
          machineMaintenance={machineMaintenance}
          bladeSharpening={bladeSharpening}
          plateSharpening={plateSharpening}
          hrTransactions={hrTransactions}
          supplierPayments={supplierPayments}
          attendance={attendance}
          loans={loans}
          payrolls={payrolls}
          wasteRecords={wasteRecords}
          jobLabors={jobLabors}
          jobOtherCosts={jobOtherCosts}
        />}
        {activeTab === 'inventory' && <Inventory items={items} warehouses={warehouses} purchases={purchases} issuances={issuances} suppliers={suppliers} getItemMovements={getItemMovements} />}
        {activeTab === 'itemCard' && <ItemCardView items={items} suppliers={suppliers} purchases={purchases} issuances={issuances} getItemMovements={getItemMovements} />}
        {activeTab === 'production' && (
          <ProductionLine 
            costCenters={costCenters} 
            productionJobs={productionJobs} 
            issuances={issuances} 
            employees={employees}
            jobLabors={jobLabors}
            jobOtherCosts={jobOtherCosts}
          />
        )}
        {activeTab === 'loading' && <LoadingManifests manifests={loadingManifests} />}
        {activeTab === 'purchases' && <Purchases items={items} suppliers={suppliers} purchases={purchases} />}
        {activeTab === 'issuances' && <Issuances items={items} issuances={issuances} costCenters={costCenters} />}
        {activeTab === 'returns' && <Returns items={items} suppliers={suppliers} costCenters={costCenters} />}
        {activeTab === 'waste' && <WastedItemsView items={items} wasteRecords={wasteRecords} />}
        {activeTab === 'bladeSharpening' && <BladeSharpeningView records={bladeSharpening} />}
        {activeTab === 'plateSharpening' && <PlateSharpeningView records={plateSharpening} />}
        {activeTab === 'machineMaintenance' && <MachineMaintenanceView records={machineMaintenance} />}
        {activeTab === 'employees' && <EmployeesView employees={employees} />}
        {activeTab === 'attendance' && <AttendanceView employees={employees} attendance={attendance} />}
        {activeTab === 'hrTransactions' && <HRTransactionsView employees={employees} transactions={hrTransactions} />}
        {activeTab === 'loans' && <LoansView employees={employees} loans={loans} payrolls={payrolls} hrTransactions={hrTransactions} />}
        {activeTab === 'payroll' && <PayrollView employees={employees} attendance={attendance} transactions={hrTransactions} loans={loans} payrolls={payrolls} />}
        {activeTab === 'archive' && <ArchiveView employees={employees} payrolls={payrolls} />}
        {activeTab === 'suppliers' && <Suppliers suppliers={suppliers} purchases={purchases} items={items} supplierPayments={supplierPayments} />}
        {activeTab === 'reports' && <ReportsView items={items} suppliers={suppliers} purchases={purchases} issuances={issuances} warehouses={warehouses} />}
        {activeTab === 'settings' && <SettingsView items={items} suppliers={suppliers} warehouses={warehouses} units={units} costCenters={costCenters} />}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-[-4px]' 
          : 'text-slate-500 hover:bg-blue-50 hover:text-primary'
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {active && <div className="mr-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />}
    </button>
  );
}

function SubNavButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold ${
        active 
        ? 'text-primary bg-blue-50 shadow-sm' 
        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function ItemCardView({ items, suppliers, purchases, issuances, getItemMovements }: { items: Item[], suppliers: Supplier[], purchases: Purchase[], issuances: Issuance[], getItemMovements: (id: string) => any[] }) {
  const [selectedId, setSelectedId] = useState<string>('');
  const selectedItem = items.find(i => i.id === selectedId);
  const movements = selectedId ? getItemMovements(selectedId) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">كارت الصنف</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">عرض تفصيلي لحركة الصنف في المخزن</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => window.print()} variant="outline" className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-sm md:text-base">
            <Printer size={18} className="ml-2" />
            طباعة الكارت
          </Button>
        </div>
      </div>

      <Card className="dribbble-card border-none p-6 print:hidden">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">اختر الصنف للمعاينة</label>
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full pr-12 h-12 rounded-2xl border-slate-200 bg-slate-50 focus:ring-primary font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="">--- اختر صنفاً من القائمة ---</option>
                {items.sort((a,b) => a.name.localeCompare(b.name)).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {selectedItem ? (
        <div className="space-y-8">
          <div className="hidden print:block text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900">كارت صنف: {selectedItem.name}</h1>
            <p className="text-slate-500 font-bold mt-2">تاريخ التقرير: {format(new Date(), 'dd/MM/yyyy')}</p>
            <div className="mt-4 w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
            <StatCard title="رصيد أول المدة" value={`${selectedItem.openingBalance} ${selectedItem.unit}`} icon={<History className="text-blue-500" />} />
            <StatCard title="إجمالي الوارد (+)" value={`${selectedItem.inward + selectedItem.returned} ${selectedItem.unit}`} icon={<Plus className="text-green-500" />} color="text-green-600" />
            <StatCard title="إجمالي المنصرف (-)" value={`${selectedItem.outward} ${selectedItem.unit}`} icon={<ArrowUpRight className="text-red-500" />} color="text-red-600" />
            <StatCard title="إجمالي الهالك" value={`${selectedItem.wasted || 0} ${selectedItem.unit}`} icon={<AlertTriangle className="text-orange-500" />} color="text-orange-600" />
            <StatCard title="الرصيد الحالي" value={`${selectedItem.currentBalance} ${selectedItem.unit}`} icon={<Package className="text-primary" />} />
            <StatCard title="سعر الوحدة" value={`${selectedItem.price.toLocaleString()} ج.م`} icon={<DollarSign className="text-amber-500" />} color="text-amber-600" />
            <StatCard title="إجمالي القيمة" value={`${(selectedItem.currentBalance * selectedItem.price).toLocaleString()} ج.م`} icon={<Layers className="text-emerald-500" />} color="text-emerald-600" />
          </div>

          <Card className="dribbble-card border-none overflow-hidden print:shadow-none">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-black text-slate-900">التاريخ</TableHead>
                    <TableHead className="font-black text-slate-900">نوع الحركة</TableHead>
                    <TableHead className="font-black text-slate-900 text-center">وارد (+)</TableHead>
                    <TableHead className="font-black text-slate-900 text-center">منصرف (-)</TableHead>
                    <TableHead className="font-black text-slate-900 text-center">الرصيد</TableHead>
                    <TableHead className="font-black text-slate-900 text-center">إجمالي القيمة</TableHead>
                    <TableHead className="font-black text-slate-900">ملاحظات / التفاصيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.slice().reverse().map((m, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-500 font-medium">
                        {m.date !== '---' ? format(new Date(m.date), 'yyyy/MM/dd HH:mm') : '---'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-lg px-3 py-1 border-none font-bold ${
                          m.type.includes('وارد') ? 'bg-green-100 text-green-700' : 
                          m.type.includes('منصرف') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-green-600 font-black">{m.in > 0 ? `+${m.in}` : '-'}</TableCell>
                      <TableCell className="text-center text-red-500 font-black">{m.out > 0 ? `-${m.out}` : '-'}</TableCell>
                      <TableCell className="text-center font-black text-slate-900">{m.balance}</TableCell>
                      <TableCell className="text-center font-black text-emerald-600">{(m.balance * selectedItem.price).toLocaleString()} ج.م</TableCell>
                      <TableCell className="text-sm text-slate-600 font-medium">{m.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Search className="text-slate-300" size={40} />
          </div>
          <p className="text-slate-400 font-bold">يرجى اختيار صنف لعرض كارت الحركة الخاص به</p>
        </div>
      )}
    </div>
  );
}

// --- Views ---

function Dashboard({ 
  items, 
  suppliers, 
  purchases, 
  issuances,
  employees,
  productionJobs,
  loadingManifests,
  machineMaintenance,
  bladeSharpening,
  plateSharpening,
  hrTransactions,
  supplierPayments,
  attendance,
  loans,
  payrolls,
  wasteRecords,
  jobLabors,
  jobOtherCosts
}: { 
  items: Item[], 
  suppliers: Supplier[], 
  purchases: Purchase[], 
  issuances: Issuance[],
  employees: Employee[],
  productionJobs: ProductionJob[],
  loadingManifests: LoadingManifest[],
  machineMaintenance: MachineMaintenance[],
  bladeSharpening: BladeSharpening[],
  plateSharpening: PlateSharpening[],
  hrTransactions: FinancialTransaction[],
  supplierPayments: SupplierPayment[],
  attendance: Attendance[],
  loans: Loan[],
  payrolls: Payroll[],
  wasteRecords: Waste[],
  jobLabors: JobLabor[],
  jobOtherCosts: JobOtherCost[]
}) {
  const totalInventoryValue = items.reduce((acc, item) => acc + (item.currentBalance * item.price), 0);
  const lowStockItems = items.filter(item => item.currentBalance <= item.safetyLimit);
  const totalSupplierDebt = suppliers.reduce((acc, s) => acc + s.balance, 0);
  
  const activeEmployees = employees.filter(emp => emp.status === 'نشط');
  const totalWasteValue = wasteRecords.reduce((acc, w) => {
    const item = items.find(i => i.id === w.itemId);
    return acc + (w.quantity * (item?.price || 0));
  }, 0);

  const totalManufacturingCost = productionJobs.reduce((acc, job) => {
    const materialCost = issuances.filter(i => i.jobOrderNo === job.orderNo).reduce((sum, m) => sum + m.total, 0);
    const laborCost = jobLabors.filter(l => l.jobId === job.id).reduce((sum, l) => sum + l.total, 0);
    const otherCost = jobOtherCosts.filter(o => o.jobId === job.id).reduce((sum, o) => sum + o.amount, 0);
    return acc + materialCost + laborCost + otherCost;
  }, 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">لوحة التحكم</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">مرحباً بك في نظام النجار للأثاث الذكي</p>
        </div>
        <div className="px-4 md:px-6 py-2 md:py-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 self-start md:self-auto">
          <Calendar className="text-primary" size={18} />
          <span className="font-bold text-slate-700 text-sm md:text-base">{format(new Date(), 'eeee, d MMMM yyyy', { locale: ar })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="إجمالي قيمة المخزن" value={`${totalInventoryValue.toLocaleString()} ج.م`} icon={<Package className="text-primary" size={24} />} />
        <StatCard title="إجمالي ديون الموردين" value={`${totalSupplierDebt.toLocaleString()} ج.م`} icon={<Users className="text-orange-500" size={24} />} color="text-orange-500" />
        <StatCard title="تكلفة التصنيع الإجمالية" value={`${totalManufacturingCost.toLocaleString()} ج.م`} icon={<DollarSign className="text-emerald-600" size={24} />} color="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="أصناف تحت حد الأمان" value={lowStockItems.length} icon={<AlertTriangle className="text-red-500" size={24} />} color="text-red-500" />
        <StatCard title="إجمالي أوامر الإنتاج" value={productionJobs.length} icon={<Wrench className="text-blue-500" size={24} />} color="text-blue-500" />
        <StatCard title="إجمالي الموظفين" value={activeEmployees.length} icon={<Users className="text-emerald-500" size={24} />} color="text-emerald-500" />
        <StatCard title="إجمالي الهالك" value={`${totalWasteValue.toLocaleString()} ج.م`} icon={<Trash2 className="text-red-600" size={24} />} color="text-red-600" />
        <StatCard title="حمولة عربيات" value={loadingManifests.length} icon={<Truck className="text-purple-500" size={24} />} color="text-purple-500" />
        <StatCard title="عمليات صيانة" value={machineMaintenance.length} icon={<Settings className="text-slate-500" size={24} />} color="text-slate-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="dribbble-card">
          <CardHeader className="p-4 md:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-3 text-slate-900">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              تنبيهات نقص المخزون
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pt-0">
            <div className="space-y-3 md:space-y-4">
              {lowStockItems.length > 0 ? lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 md:p-5 bg-red-50/50 rounded-2xl border border-red-100/50 group hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center shadow-sm font-bold text-red-500 text-sm md:text-base">
                      {item.currentBalance}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm md:text-base">{item.name}</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">الرصيد: {item.currentBalance} {item.unit}</p>
                    </div>
                  </div>
                  <Badge className="bg-red-500 hover:bg-red-600 text-white border-none rounded-lg px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs">منخفض</Badge>
                </div>
              )) : (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="text-green-500" size={32} />
                  </div>
                  <p className="font-bold text-slate-400">جميع الأصناف في حالة جيدة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="dribbble-card">
          <CardHeader className="p-4 md:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-3 text-slate-900">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <ArrowUpRight size={18} className="text-primary" />
              </div>
              آخر عمليات الصرف
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pt-0">
            <div className="space-y-3 md:space-y-4">
              {issuances.slice(-5).reverse().map(iss => (
                <div key={iss.id} className="flex items-center justify-between p-3 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50 group hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center shadow-sm font-bold text-primary text-sm md:text-base">
                      {iss.quantity}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm md:text-base">{items.find(i => i.id === iss.itemId)?.name || 'صنف غير معروف'}</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{iss.costCenter}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs md:text-sm font-black text-slate-900">{iss.total.toLocaleString()} ج.م</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(iss.date), 'HH:mm')}</p>
                  </div>
                </div>
              ))}
              {issuances.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-bold">لا توجد عمليات صرف حديثة</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="dribbble-card">
          <CardHeader className="p-4 md:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-3 text-slate-900">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Wrench size={18} className="text-emerald-500" />
              </div>
              أحدث أوامر الإنتاج
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pt-0">
            <div className="space-y-3 md:space-y-4">
              {productionJobs.slice(-5).reverse().map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 md:p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 group hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center shadow-sm font-bold text-emerald-600 text-sm md:text-base">
                      {job.orderNo}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm md:text-base">{job.productName}</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{job.clientName}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-none rounded-lg px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-bold">{job.priority}</Badge>
                </div>
              ))}
              {productionJobs.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-bold">لا توجد أوامر إنتاج</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="dribbble-card">
          <CardHeader className="p-4 md:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-3 text-slate-900">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <ShoppingCart size={18} className="text-orange-500" />
              </div>
              آخر المشتريات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pt-0">
            <div className="space-y-3 md:space-y-4">
              {purchases.slice(-5).reverse().map(pur => (
                <div key={pur.id} className="flex items-center justify-between p-3 md:p-5 bg-orange-50/30 rounded-2xl border border-orange-100/50 group hover:bg-orange-50/50 transition-colors">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center shadow-sm font-bold text-orange-600 text-sm md:text-base">
                      {pur.quantity}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm md:text-base">{items.find(i => i.id === pur.itemId)?.name || 'صنف غير معروف'}</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{suppliers.find(s => s.id === pur.supplierId)?.name || 'مورد غير معروف'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs md:text-sm font-black text-slate-900">{pur.total.toLocaleString()} ج.م</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(pur.date), 'dd/MM')}</p>
                  </div>
                </div>
              ))}
              {purchases.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-bold">لا توجد مشتريات حديثة</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="dribbble-card">
          <CardHeader className="p-4 md:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-3 text-slate-900">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <DollarSign size={18} className="text-purple-500" />
              </div>
              دفعات الموردين الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pt-0">
            <div className="space-y-3 md:space-y-4">
              {supplierPayments.slice(-5).reverse().map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-3 md:p-5 bg-purple-50/30 rounded-2xl border border-purple-100/50 group hover:bg-purple-50/50 transition-colors">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center shadow-sm font-bold text-purple-600 text-sm md:text-base">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm md:text-base">{suppliers.find(s => s.id === payment.supplierId)?.name || 'مورد غير معروف'}</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{payment.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs md:text-sm font-black text-slate-900">{payment.amount.toLocaleString()} ج.م</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(payment.date), 'dd/MM')}</p>
                  </div>
                </div>
              ))}
              {supplierPayments.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-bold">لا توجد دفعات مسجلة</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="dribbble-card">
          <CardHeader className="p-4 md:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-3 text-slate-900">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Users size={18} className="text-indigo-500" />
              </div>
              آخر حركات الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pt-0">
            <div className="space-y-3 md:space-y-4">
              {hrTransactions.slice(-5).reverse().map(trans => (
                <div key={trans.id} className="flex items-center justify-between p-3 md:p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 group hover:bg-indigo-50/50 transition-colors">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center shadow-sm font-bold text-indigo-600 text-sm md:text-base">
                      {trans.type === 'مكافأة' || trans.type === 'بدل' || trans.type === 'إضافي' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm md:text-base">{employees.find(e => e.id === trans.employeeId)?.name || 'موظف غير معروف'}</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{trans.type}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`text-xs md:text-sm font-black ${trans.type === 'خصم' ? 'text-red-500' : 'text-emerald-500'}`}>{trans.amount.toLocaleString()} ج.م</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(trans.date), 'dd/MM')}</p>
                  </div>
                </div>
              ))}
              {hrTransactions.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-bold">لا توجد حركات مسجلة</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = "text-primary" }: { title: string, value: string | number, icon: React.ReactNode, color?: string }) {
  return (
    <Card className="dribbble-card overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            <h3 className={`text-2xl font-black tracking-tight ${color}`}>{value}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Inventory({ items, warehouses, purchases, issuances, suppliers, getItemMovements }: { items: Item[], warehouses: Warehouse[], purchases: Purchase[], issuances: Issuance[], suppliers: Supplier[], getItemMovements: (id: string) => any[] }) {
  const [search, setSearch] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedItemCard, setSelectedItemCard] = useState<Item | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) && 
    (selectedWarehouseId === 'all' || i.warehouseId === selectedWarehouseId)
  );

  const handleDelete = async (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      await deleteDoc(doc(db, 'items', showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (err) { handleFirestoreError(err, 'delete', 'items'); }
  };

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const exportExcel = () => {
    const data = filtered.map(i => ({
      'اسم الصنف': i.name,
      'المخزن': warehouses.find(w => w.id === i.warehouseId)?.name,
      'الوحدة': i.unit,
      'سعر الوحدة': i.price,
      'رصيد أول': i.openingBalance,
      'الوارد': i.inward,
      'المنصرف': i.outward,
      'المرتجع': i.returned,
      'الرصيد الحالي': i.currentBalance,
      'إجمالي القيمة': i.currentBalance * i.price,
      'حد الأمان': i.safetyLimit
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory_report.xlsx");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">المخزن</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">إدارة الأصناف ومراقبة المخزون</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={`rounded-lg h-8 px-3 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <LayoutGrid size={16} />
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('table')}
              className={`rounded-lg h-8 px-3 ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
            >
              <List size={16} />
            </Button>
          </div>
          <Button onClick={() => window.print()} variant="outline" className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-sm md:text-base">
            <Printer size={18} className="ml-2" />
            طباعة
          </Button>
          <Button onClick={exportExcel} variant="outline" className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-sm md:text-base">
            <FileText size={18} className="ml-2" />
            تصدير Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="dribbble-card bg-primary text-white border-none shadow-xl shadow-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Package className="text-white" size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">إجمالي كمية المخزون</p>
              <p className="text-3xl font-black">
                {filtered.reduce((acc, item) => acc + item.currentBalance, 0).toLocaleString()}
                <span className="text-xs font-medium mr-2 opacity-80">صنف</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dribbble-card bg-emerald-600 text-white border-none shadow-xl shadow-emerald-600/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <DollarSign className="text-white" size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">إجمالي قيمة المخزون</p>
              <p className="text-3xl font-black">
                {filtered.reduce((acc, item) => acc + (item.currentBalance * item.price), 0).toLocaleString()}
                <span className="text-xs font-medium mr-2 opacity-80">ج.م</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="dribbble-card bg-slate-900 text-white border-none shadow-xl shadow-slate-900/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Layers className="text-white" size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">عدد الأصناف</p>
              <p className="text-3xl font-black">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm print:hidden">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="بحث عن صنف..." 
            className="pr-12 h-10 md:h-12 rounded-xl md:rounded-2xl border-none bg-transparent focus-visible:ring-0 font-bold text-sm md:text-base" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex gap-2 p-1 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setSelectedWarehouseId('all')}
            className={`flex-none md:flex-1 h-9 md:h-10 px-4 md:px-0 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedWarehouseId === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            الكل
          </button>
          {warehouses.map(w => (
            <button 
              key={w.id}
              onClick={() => setSelectedWarehouseId(w.id)}
              className={`flex-none md:flex-1 h-9 md:h-10 px-4 md:px-0 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedWarehouseId === w.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {w.name}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
          {filtered.map(item => (
            <Card key={item.id} className="dribbble-card group overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors">{item.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {warehouses.find(w => w.id === item.warehouseId)?.name} | {item.unit}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50" onClick={() => setEditingItem(item)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">الرصيد الحالي</p>
                      <p className={`text-lg font-black ${item.currentBalance <= item.safetyLimit ? 'text-red-500' : 'text-slate-900'}`}>
                        {item.currentBalance} <span className="text-[10px] text-slate-400">{item.unit}</span>
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">سعر الوحدة</p>
                      <p className="text-lg font-black text-primary">
                        {item.price.toLocaleString()} <span className="text-[10px] text-slate-400">ج.م</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">إجمالي القيمة المادية</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-xl font-black text-emerald-700">
                        {(item.currentBalance * item.price).toLocaleString()}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-600">جنيهاً مصرياً</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600" title="وارد">
                        {item.inward}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-orange-600" title="منصرف">
                        {item.outward}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-red-600" title="هالك">
                        {item.wasted || 0}
                      </div>
                    </div>
                    <Button 
                      onClick={() => setSelectedItemCard(item)}
                      variant="ghost" 
                      className="text-xs font-bold text-primary hover:bg-blue-50 rounded-xl h-9"
                    >
                      كارت الصنف
                      <ArrowUpRight size={14} className="mr-1" />
                    </Button>
                  </div>
                </div>
                
                {item.currentBalance <= item.safetyLimit && (
                  <div className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 text-center">
                    تنبيه: رصيد منخفض
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="dribbble-card border-none overflow-hidden print:shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-black text-slate-900">اسم الصنف</TableHead>
                  <TableHead className="font-black text-slate-900">المخزن</TableHead>
                  <TableHead className="font-black text-slate-900">الوحدة</TableHead>
                  <TableHead className="font-black text-slate-900 text-center">الرصيد</TableHead>
                  <TableHead className="font-black text-slate-900 text-center">الهالك</TableHead>
                  <TableHead className="font-black text-slate-900 text-center">سعر الوحدة</TableHead>
                  <TableHead className="font-black text-slate-900 text-center">إجمالي القيمة</TableHead>
                  <TableHead className="font-black text-slate-900 text-center print:hidden">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(item => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-700">{item.name}</TableCell>
                    <TableCell className="text-slate-500 font-medium">
                      {warehouses.find(w => w.id === item.warehouseId)?.name}
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">{item.unit}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-black ${item.currentBalance <= item.safetyLimit ? 'text-red-500' : 'text-slate-900'}`}>
                        {item.currentBalance}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-red-500">
                        {item.wasted || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {item.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-black text-emerald-600">
                        {(item.currentBalance * item.price).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center print:hidden">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary" onClick={() => setEditingItem(item)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50/50 font-black">
                  <TableCell colSpan={3} className="text-left">الإجمالي العام</TableCell>
                  <TableCell className="text-center">
                    {filtered.reduce((acc, i) => acc + i.currentBalance, 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {filtered.reduce((acc, i) => acc + (i.wasted || 0), 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">---</TableCell>
                  <TableCell className="text-center text-emerald-700">
                    {filtered.reduce((acc, i) => acc + (i.currentBalance * i.price), 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="print:hidden"></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Printable Report Header (Hidden in UI) */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-black">تقرير جرد المخازن</h1>
        <p className="text-slate-500 font-bold mt-1">بتاريخ: {format(new Date(), 'dd/MM/yyyy')}</p>
        <div className="mt-4 border-b-2 border-slate-900 w-full" />
      </div>

      {/* Edit Item Dialog */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader><CardTitle className="font-black">تعديل صنف: {editingItem.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم الصنف</label>
                <Input className="rounded-xl h-11" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المخزن</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white" 
                    value={editingItem.warehouseId} 
                    onChange={e => setEditingItem({...editingItem, warehouseId: e.target.value})}
                  >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الوحدة</label>
                  <Input className="rounded-xl h-11" value={editingItem.unit} onChange={e => setEditingItem({...editingItem, unit: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">السعر</label>
                  <Input className="rounded-xl h-11" type="number" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">حد الأمان</label>
                  <Input className="rounded-xl h-11" type="number" value={editingItem.safetyLimit} onChange={e => setEditingItem({...editingItem, safetyLimit: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="rounded-xl" onClick={() => setEditingItem(null)}>إلغاء</Button>
                <Button onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'items', editingItem.id), {
                      name: editingItem.name,
                      warehouseId: editingItem.warehouseId,
                      unit: editingItem.unit,
                      price: editingItem.price,
                      safetyLimit: editingItem.safetyLimit
                    });
                    setEditingItem(null);
                  } catch (err) { handleFirestoreError(err, 'write', 'items'); }
                }} className="btn-primary px-8 h-11">حفظ التغييرات</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Item Card Dialog */}
      {selectedItemCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="dribbble-card w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b border-slate-100 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-black text-slate-900">كارت الصنف: {selectedItemCard.name}</CardTitle>
                  <p className="text-slate-500 font-medium mt-1">سجل حركة الوارد والمنصرف والرصيد التفصيلي</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-xl h-11 px-6 border-slate-200 font-bold" onClick={() => window.print()}>طباعة</Button>
                  <Button variant="ghost" className="rounded-xl h-11 px-6 font-bold" onClick={() => setSelectedItemCard(null)}>إغلاق</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-auto flex-1">
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 bg-slate-50/50 border-b border-slate-100">
                <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">رصيد أول المدة</p>
                  <p className="text-2xl font-black text-slate-900">{selectedItemCard.openingBalance} {selectedItemCard.unit}</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">إجمالي الوارد (+)</p>
                  <p className="text-2xl font-black text-green-600">{selectedItemCard.inward + selectedItemCard.returned} {selectedItemCard.unit}</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">إجمالي المنصرف (-)</p>
                  <p className="text-2xl font-black text-red-500">{selectedItemCard.outward} {selectedItemCard.unit}</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">إجمالي الهالك</p>
                  <p className="text-2xl font-black text-orange-600">{selectedItemCard.wasted || 0} {selectedItemCard.unit}</p>
                </div>
                <div className="p-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">الرصيد الحالي</p>
                  <p className="text-2xl font-black">{selectedItemCard.currentBalance} {selectedItemCard.unit}</p>
                </div>
              </div>

              <div className="p-8">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="text-right font-bold text-slate-900">التاريخ</TableHead>
                      <TableHead className="text-right font-bold text-slate-900">نوع الحركة</TableHead>
                      <TableHead className="text-right font-bold text-slate-900">وارد (+)</TableHead>
                      <TableHead className="text-right font-bold text-slate-900">منصرف (-)</TableHead>
                      <TableHead className="text-right font-bold text-slate-900">الرصيد</TableHead>
                      <TableHead className="text-right font-bold text-slate-900">ملاحظات / التفاصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getItemMovements(selectedItemCard.id).slice().reverse().map((m, idx) => (
                      <TableRow key={idx} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-slate-500 font-medium">{m.date !== '---' ? format(new Date(m.date), 'yyyy/MM/dd HH:mm') : '---'}</TableCell>
                        <TableCell>
                          <Badge className={`rounded-lg px-3 py-1 border-none font-bold ${
                            m.type.includes('وارد') ? 'bg-green-100 text-green-700' : 
                            m.type.includes('منصرف') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-600 font-black">{m.in > 0 ? `+${m.in}` : '-'}</TableCell>
                        <TableCell className="text-red-500 font-black">{m.out > 0 ? `-${m.out}` : '-'}</TableCell>
                        <TableCell className="font-black text-slate-900">{m.balance}</TableCell>
                        <TableCell className="text-sm text-slate-600 font-medium">{m.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Confirm Delete Dialog */}
      <ConfirmDialog 
        isOpen={!!showDeleteConfirm}
        title="تأكيد حذف الصنف"
        message="هل أنت متأكد من حذف هذا الصنف؟ سيتم حذف كافة البيانات المتعلقة به نهائياً."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </div>
  );
}

function ProductionLine({ 
  costCenters, 
  productionJobs, 
  issuances, 
  employees,
  jobLabors,
  jobOtherCosts
}: { 
  costCenters: CostCenter[], 
  productionJobs: ProductionJob[],
  issuances: Issuance[],
  employees: Employee[],
  jobLabors: JobLabor[],
  jobOtherCosts: JobOtherCost[]
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<ProductionJob | null>(null);
  const [selectedJobForCost, setSelectedJobForCost] = useState<ProductionJob | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [formData, setFormData] = useState({
    orderNo: '',
    clientName: '',
    productName: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    priority: 'متوسطة' as const,
    notes: ''
  });

  const filteredJobs = productionJobs.filter(job => {
    const matchesSearch = job.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.orderNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || job.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      await updateDoc(doc(db, 'productionJobs', draggableId), {
        status: destination.droppableId
      });
    } catch (err) {
      handleFirestoreError(err, 'write', 'productionJobs');
    }
  };

  const handleAdd = async () => {
    if (!formData.orderNo || !formData.productName) return;
    try {
      await addDoc(collection(db, 'productionJobs'), {
        ...formData,
        status: costCenters[0]?.id || 'waiting',
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setFormData({
        orderNo: '',
        clientName: '',
        productName: '',
        startDate: new Date().toISOString().split('T')[0],
        deadline: '',
        priority: 'متوسطة',
        notes: ''
      });
    } catch (err) {
      handleFirestoreError(err, 'write', 'productionJobs');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'productionJobs', id));
      setShowDeleteConfirm(null);
    } catch (err) {
      handleFirestoreError(err, 'delete', 'productionJobs');
    }
  };

  const handleUpdate = async () => {
    if (!editingJob) return;
    try {
      const { id, ...data } = editingJob;
      await updateDoc(doc(db, 'productionJobs', id), data);
      setEditingJob(null);
    } catch (err) {
      handleFirestoreError(err, 'update', 'productionJobs');
    }
  };

  const stats = {
    total: productionJobs.length,
    highPriority: productionJobs.filter(j => j.priority === 'عالية').length,
    completed: productionJobs.filter(j => j.status === costCenters[costCenters.length - 1]?.id).length
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">خط الإنتاج الذكي</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">تتبع مراحل التصنيع بنظام السحب والإفلات</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 ml-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الطلبات</span>
              <span className="text-xl font-black text-slate-900">{stats.total}</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">أولوية عالية</span>
              <span className="text-xl font-black text-red-500">{stats.highPriority}</span>
            </div>
          </div>
          <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8 text-sm md:text-base">
            <Plus size={18} className="ml-2" />
            أمر إنتاج جديد
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            className="h-12 pr-12 rounded-2xl border-none shadow-sm bg-white font-bold" 
            placeholder="ابحث برقم الطلب، اسم العميل، أو المنتج..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="h-12 px-4 rounded-2xl border-none shadow-sm bg-white font-bold text-slate-600 min-w-[150px]"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="all">كل الأولويات</option>
          <option value="عالية">عالية</option>
          <option value="متوسطة">متوسطة</option>
          <option value="منخفضة">منخفضة</option>
        </select>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-max">
            {costCenters.map(column => (
              <div key={column.id} className="w-80 flex flex-col bg-zinc-100/50 rounded-2xl border border-zinc-200/60">
                <div className="px-4 py-3 flex items-center justify-between mb-4">
                  <h3 className="font-black text-slate-900 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                    {column.name}
                  </h3>
                  <Badge className="bg-white text-primary border-slate-200 rounded-lg px-2 shadow-sm font-black">
                    {filteredJobs.filter(j => j.status === column.id).length}
                  </Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-3 space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-zinc-200/50' : ''}`}
                    >
                      {filteredJobs.filter(job => job.status === column.id).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 opacity-20 grayscale">
                          <Package size={40} />
                          <span className="text-xs font-bold mt-2">لا توجد طلبات</span>
                        </div>
                      )}
                      {filteredJobs
                        .filter(job => job.status === column.id)
                        .map((job, index) => (
                          <Draggable key={job.id} draggableId={job.id} index={index} {...({} as any)}>
                            {(provided: any, snapshot: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="outline-none"
                              >
                                <Card
                                  className={`dribbble-card group ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary rotate-2 scale-105' : ''}`}
                                >
                                  <CardContent className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-400">#{job.orderNo}</Badge>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedJobForCost(job); }} className="h-7 w-7 rounded-lg text-slate-300 hover:text-emerald-500 hover:bg-emerald-50">
                                          <DollarSign size={14} />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingJob(job); }} className="h-7 w-7 rounded-lg text-slate-300 hover:text-primary hover:bg-blue-50">
                                          <Edit2 size={14} />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(job.id); }} className="h-7 w-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50">
                                          <Trash2 size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-black text-slate-900 leading-tight">{job.productName}</h4>
                                      <p className="text-xs font-bold text-slate-400 mt-1">{job.clientName}</p>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-black bg-slate-50 p-2 rounded-xl">
                                      <span className="text-slate-400 uppercase tracking-widest">التكلفة التقديرية</span>
                                      <span className="text-emerald-600">
                                        {(
                                          (issuances.filter(i => i.jobOrderNo === job.orderNo).reduce((sum, m) => sum + m.total, 0)) +
                                          (jobLabors.filter(l => l.jobId === job.id).reduce((sum, l) => sum + l.total, 0)) +
                                          (jobOtherCosts.filter(o => o.jobId === job.id).reduce((sum, o) => sum + o.amount, 0))
                                        ).toLocaleString()} ج.م
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Calendar size={12} className={job.deadline && new Date(job.deadline) < new Date() ? "text-red-500 animate-pulse" : "text-primary"} />
                                        <span className={job.deadline && new Date(job.deadline) < new Date() ? "text-red-500 font-black" : ""}>
                                          {job.deadline ? format(new Date(job.deadline), 'MM/dd') : 'بدون موعد'}
                                        </span>
                                      </div>
                                      <Badge 
                                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-none ${
                                          job.priority === 'عالية' ? 'bg-red-500 text-white' :
                                          job.priority === 'متوسطة' ? 'bg-orange-400 text-white' :
                                          'bg-blue-400 text-white'
                                        }`}
                                      >
                                        {job.priority}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog 
        isOpen={!!showDeleteConfirm}
        title="حذف أمر الإنتاج"
        message="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
        onCancel={() => setShowDeleteConfirm(null)}
      />

      {/* Edit Job Dialog */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تعديل أمر إنتاج</CardTitle>
              <CardDescription className="font-medium">تحديث بيانات الطلب رقم {editingJob.orderNo}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رقم الطلب</label>
                  <Input className="rounded-xl h-11" value={editingJob.orderNo} onChange={e => setEditingJob({...editingJob, orderNo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الأولوية</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold"
                    value={editingJob.priority}
                    onChange={e => setEditingJob({...editingJob, priority: e.target.value as any})}
                  >
                    <option value="منخفضة">منخفضة</option>
                    <option value="متوسطة">متوسطة</option>
                    <option value="عالية">عالية</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم العميل</label>
                <Input className="rounded-xl h-11" value={editingJob.clientName} onChange={e => setEditingJob({...editingJob, clientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المنتج / الوصف</label>
                <Input className="rounded-xl h-11" value={editingJob.productName} onChange={e => setEditingJob({...editingJob, productName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">تاريخ البدء</label>
                  <Input className="rounded-xl h-11" type="date" value={editingJob.startDate} onChange={e => setEditingJob({...editingJob, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">موعد التسليم</label>
                  <Input className="rounded-xl h-11" type="date" value={editingJob.deadline} onChange={e => setEditingJob({...editingJob, deadline: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات</label>
                <Input className="rounded-xl h-11" value={editingJob.notes} onChange={e => setEditingJob({...editingJob, notes: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="btn-ghost" onClick={() => setEditingJob(null)}>إلغاء</Button>
                <Button onClick={handleUpdate} className="btn-primary px-8 h-11">حفظ التعديلات</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Job Cost Modal */}
      {selectedJobForCost && (
        <JobCostModal 
          job={selectedJobForCost} 
          onClose={() => setSelectedJobForCost(null)}
          issuances={issuances}
          employees={employees}
          jobLabors={jobLabors}
          jobOtherCosts={jobOtherCosts}
        />
      )}

      {/* Add Job Dialog */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle className="font-black text-2xl">إضافة أمر إنتاج جديد</CardTitle>
              <CardDescription className="font-medium">أدخل تفاصيل الطلب لبدء عملية التصنيع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رقم الطلب</label>
                  <Input className="rounded-xl h-11" value={formData.orderNo} onChange={e => setFormData({...formData, orderNo: e.target.value})} placeholder="مثلاً: 2024-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الأولوية</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                  >
                    <option value="منخفضة">منخفضة</option>
                    <option value="متوسطة">متوسطة</option>
                    <option value="عالية">عالية</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم العميل</label>
                <Input className="rounded-xl h-11" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المنتج / الوصف</label>
                <Input className="rounded-xl h-11" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} placeholder="مثلاً: طقم صالون كلاسيك" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">تاريخ البدء</label>
                  <Input className="rounded-xl h-11" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">موعد التسليم</label>
                  <Input className="rounded-xl h-11" type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات</label>
                <Input className="rounded-xl h-11" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-8 h-11">بدء الإنتاج</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function LoadingManifests({ manifests }: { manifests: LoadingManifest[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManifest, setSelectedManifest] = useState<LoadingManifest | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    driverName: '',
    carNumber: '',
    destinationType: 'عميل' as 'عميل' | 'معرض',
    clientName: '',
    orderNumbers: '',
    loaderName: '',
    notes: '',
    products: [{ name: '', components: '', notes: '', salesPerson: '', additions: '' }]
  });

  const handleAddProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', components: '', notes: '', salesPerson: '', additions: '' }]
    });
  };

  const handleRemoveProduct = (index: number) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index)
    });
  };

  const handleProductChange = (index: number, field: string, value: string) => {
    const newProducts = [...formData.products];
    (newProducts[index] as any)[field] = value;
    setFormData({ ...formData, products: newProducts });
  };

  const handleEdit = (manifest: LoadingManifest) => {
    setEditingId(manifest.id);
    setFormData({
      date: manifest.date,
      driverName: manifest.driverName,
      carNumber: manifest.carNumber,
      destinationType: manifest.destinationType,
      clientName: manifest.clientName,
      orderNumbers: manifest.orderNumbers,
      loaderName: manifest.loaderName,
      notes: manifest.notes,
      products: manifest.products
    });
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!formData.driverName || !formData.carNumber || !formData.clientName) return;
    try {
      if (editingId) {
        await updateDoc(doc(db, 'loadingManifests', editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'loadingManifests'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setShowAdd(false);
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        driverName: '',
        carNumber: '',
        destinationType: 'عميل',
        clientName: '',
        orderNumbers: '',
        loaderName: '',
        notes: '',
        products: [{ name: '', components: '', notes: '', salesPerson: '', additions: '' }]
      });
    } catch (err) {
      handleFirestoreError(err, editingId ? 'update' : 'write', 'loadingManifests');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(doc(db, 'loadingManifests', id).firestore, 'loadingManifests', id));
      setShowDeleteConfirm(null);
    } catch (err) {
      handleFirestoreError(err, 'delete', 'loadingManifests');
    }
  };

  const filteredManifests = manifests.filter(m => 
    m.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.carNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.orderNumbers.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">حمولة العربية</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">إدارة وطباعة كشوف تحميل السيارات</p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="بحث في الحمولات..." 
              className="pr-12 h-10 md:h-12 rounded-xl md:rounded-2xl border-slate-200 bg-white font-bold text-sm md:text-base"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => { setEditingId(null); setShowAdd(true); }} className="btn-primary h-10 md:h-12 px-6 md:px-8 whitespace-nowrap text-sm md:text-base">
            <Plus size={18} className="ml-2" />
            إضافة حمولة جديدة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredManifests.slice().reverse().map(m => (
          <Card key={m.id} className="dribbble-card group overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <Badge className={`rounded-lg px-2 py-0.5 font-black uppercase tracking-widest border-none ${m.destinationType === 'معرض' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {m.destinationType === 'معرض' ? 'المعرض' : 'عميل'}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedManifest(m)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50">
                    <FileText size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(m)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50">
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-4 text-xl font-black text-slate-900">{m.clientName}</CardTitle>
              <CardDescription className="font-bold text-slate-400">{m.date}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">السائق</span>
                <span className="font-black text-slate-900">{m.driverName}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم السيارة</span>
                <span className="font-black text-slate-900">{m.carNumber}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">عدد المنتجات</span>
                <span className="font-black text-primary">{m.products.length}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog 
        isOpen={!!showDeleteConfirm}
        title="حذف الحمولة"
        message="هل أنت متأكد من حذف هذه الحمولة؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
        onCancel={() => setShowDeleteConfirm(null)}
      />

      {/* Add Manifest Dialog */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-4xl max-h-[90vh] overflow-auto my-8">
            <CardHeader>
              <CardTitle className="font-black text-2xl">{editingId ? 'تعديل حمولة عربية' : 'إضافة حمولة عربية جديدة'}</CardTitle>
              <CardDescription className="font-medium">أدخل تفاصيل الحمولة والمنتجات بدقة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">التاريخ</label>
                  <Input type="date" className="rounded-xl h-11" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اسم السائق</label>
                  <Input className="rounded-xl h-11" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رقم السيارة</label>
                  <Input className="rounded-xl h-11" value={formData.carNumber} onChange={e => setFormData({...formData, carNumber: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الوجهة</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.destinationType}
                    onChange={e => {
                      const val = e.target.value as any;
                      setFormData({
                        ...formData, 
                        destinationType: val,
                        clientName: val === 'معرض' ? 'المعرض' : formData.clientName
                      });
                    }}
                  >
                    <option value="عميل">عميل</option>
                    <option value="معرض">المعرض</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اسم العميل</label>
                  <Input 
                    disabled={formData.destinationType === 'معرض'} 
                    className="rounded-xl h-11"
                    value={formData.clientName} 
                    onChange={e => setFormData({...formData, clientName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">أرقام الأوردرات</label>
                  <Input className="rounded-xl h-11" value={formData.orderNumbers} onChange={e => setFormData({...formData, orderNumbers: e.target.value})} placeholder="مثلاً: 101, 105, 110" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl text-slate-900">المنتجات المحملة</h3>
                  <Button variant="outline" size="sm" onClick={handleAddProduct} className="rounded-xl font-black border-slate-200 text-primary hover:bg-blue-50">
                    <Plus size={16} className="ml-2" />
                    إضافة منتج
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {formData.products.map((p, idx) => (
                    <div key={idx} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4 relative group">
                      {formData.products.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-4 left-4 text-slate-300 hover:text-red-500 hover:bg-red-50 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handleRemoveProduct(idx)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">اسم المنتج</label>
                          <Input className="rounded-xl h-11 bg-white" value={p.name} onChange={e => handleProductChange(idx, 'name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">اسم السيلز</label>
                          <Input className="rounded-xl h-11 bg-white" value={p.salesPerson} onChange={e => handleProductChange(idx, 'salesPerson', e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">المكونات</label>
                          <Input className="rounded-xl h-11 bg-white" value={p.components} onChange={e => handleProductChange(idx, 'components', e.target.value)} placeholder="مثلاً: 4 كراسي + ترابيزة" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">إضافات أخرى</label>
                          <Input className="rounded-xl h-11 bg-white" value={p.additions} onChange={e => handleProductChange(idx, 'additions', e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ملاحظات المنتج</label>
                        <Input className="rounded-xl h-11 bg-white" value={p.notes} onChange={e => handleProductChange(idx, 'notes', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">القائم بالتحميل</label>
                  <Input className="rounded-xl h-11" value={formData.loaderName} onChange={e => setFormData({...formData, loaderName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">ملاحظات عامة</label>
                  <Input className="rounded-xl h-11" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="rounded-xl font-bold h-12 px-8" onClick={() => { setShowAdd(false); setEditingId(null); }}>إلغاء</Button>
                <Button onClick={handleSave} className="btn-primary px-10 h-12 font-black">
                  {editingId ? 'حفظ التعديلات' : 'حفظ الحمولة'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Print Manifest Dialog */}
      {selectedManifest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-4xl my-8 bg-white print:shadow-none print:border-none print:m-0 print:w-full overflow-hidden">
            <CardHeader className="border-b border-slate-100 flex flex-row justify-between items-center print:border-slate-300 bg-slate-50/50">
              <div className="text-right">
                <CardTitle className="text-3xl font-black text-slate-900">كشف حمولة سيارة</CardTitle>
                <CardDescription className="font-bold text-primary">شركة النجار للأثاث الفاخر</CardDescription>
              </div>
              <div className="flex gap-3 print:hidden">
                <Button onClick={() => window.print()} className="btn-primary rounded-xl font-black px-6">
                  <Printer size={18} className="ml-2" />
                  طباعة
                </Button>
                <Button variant="ghost" onClick={() => setSelectedManifest(null)} className="rounded-xl font-bold text-slate-400">إغلاق</Button>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-10 border border-slate-100 p-8 rounded-3xl bg-slate-50/30 print:bg-transparent print:border-slate-300">
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">التاريخ</span>
                    <span className="font-black text-slate-900">{selectedManifest.date}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">اسم السائق</span>
                    <span className="font-black text-slate-900">{selectedManifest.driverName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">رقم السيارة</span>
                    <span className="font-black text-slate-900">{selectedManifest.carNumber}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">الوجهة</span>
                    <span className="font-black text-slate-900">{selectedManifest.clientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">أرقام الأوردرات</span>
                    <span className="font-black text-slate-900">{selectedManifest.orderNumbers || '---'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">القائم بالتحميل</span>
                    <span className="font-black text-slate-900">{selectedManifest.loaderName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-black text-xl text-slate-900 flex items-center gap-3">
                  <div className="w-2 h-6 bg-primary rounded-full" />
                  تفاصيل المنتجات
                </h3>
                <div className="rounded-3xl border border-slate-100 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-right font-black text-slate-900 py-4">المنتج</TableHead>
                        <TableHead className="text-right font-black text-slate-900 py-4">المكونات</TableHead>
                        <TableHead className="text-right font-black text-slate-900 py-4">السيلز</TableHead>
                        <TableHead className="text-right font-black text-slate-900 py-4">إضافات</TableHead>
                        <TableHead className="text-right font-black text-slate-900 py-4">ملاحظات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedManifest.products.map((p, i) => (
                        <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-black text-slate-700 py-4">{p.name}</TableCell>
                          <TableCell className="font-medium text-slate-600 py-4">{p.components}</TableCell>
                          <TableCell className="font-medium text-slate-600 py-4">{p.salesPerson}</TableCell>
                          <TableCell className="font-medium text-slate-600 py-4">{p.additions}</TableCell>
                          <TableCell className="font-medium text-slate-600 py-4">{p.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selectedManifest.notes && (
                <div className="p-6 bg-blue-50/30 border border-blue-100 rounded-3xl print:bg-transparent print:border-slate-300">
                  <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">ملاحظات عامة</p>
                  <p className="font-medium text-slate-700">{selectedManifest.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-20 pt-16">
                <div className="text-center space-y-10">
                  <p className="font-black text-slate-900 border-b-2 border-slate-100 pb-4">توقيع السائق</p>
                  <div className="h-24"></div>
                  <div className="w-full border-t border-dashed border-slate-200" />
                </div>
                <div className="text-center space-y-10">
                  <p className="font-black text-slate-900 border-b-2 border-slate-100 pb-4">توقيع القائم بالتحميل</p>
                  <div className="h-24"></div>
                  <div className="w-full border-t border-dashed border-slate-200" />
                </div>
              </div>

              <div className="text-center text-[10px] font-black text-slate-300 pt-10 border-t border-slate-50 print:block hidden uppercase tracking-widest">
                طبع بواسطة نظام النجار لإدارة الأثاث - {new Date().toLocaleString('ar-EG')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Purchases({ items, suppliers, purchases }: { items: Item[], suppliers: Supplier[], purchases: Purchase[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [formData, setFormData] = useState({
    supplierId: '',
    itemId: '',
    quantity: 0,
    unitPrice: 0,
    paidAmount: 0,
    paymentStatus: 'نقدي' as const,
    notes: ''
  });

  const filteredPurchases = purchases.filter(p => {
    const supplier = suppliers.find(s => s.id === p.supplierId)?.name || '';
    const item = items.find(i => i.id === p.itemId)?.name || '';
    const search = searchTerm.toLowerCase();
    const matchesSearch = supplier.toLowerCase().includes(search) || item.toLowerCase().includes(search);
    
    const pDate = new Date(p.date);
    const matchesStart = !dateFilter.start || pDate >= new Date(dateFilter.start);
    const matchesEnd = !dateFilter.end || pDate <= new Date(dateFilter.end + 'T23:59:59');
    
    return matchesSearch && matchesStart && matchesEnd;
  });

  const handleExportExcel = () => {
    const data = filteredPurchases.map(p => ({
      'التاريخ': format(new Date(p.date), 'yyyy/MM/dd'),
      'المورد': suppliers.find(s => s.id === p.supplierId)?.name || 'غير معروف',
      'الصنف': items.find(i => i.id === p.itemId)?.name || 'غير معروف',
      'الكمية': p.quantity,
      'الوحدة': p.unit,
      'الإجمالي': p.total,
      'المدفوع': p.paidAmount,
      'الحالة': p.paymentStatus,
      'ملاحظات': p.notes || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المشتريات");
    XLSX.writeFile(wb, `المشتريات_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleAdd = async () => {
    if (!formData.supplierId || !formData.itemId || formData.quantity <= 0) return;
    
    const total = formData.quantity * formData.unitPrice;
    const item = items.find(i => i.id === formData.itemId);
    
    try {
      await addDoc(collection(db, 'purchases'), {
        ...formData,
        total,
        date: new Date().toISOString(),
        unit: item?.unit || ''
      });

      // Update Item Stock
      await updateDoc(doc(db, 'items', formData.itemId), {
        inward: increment(formData.quantity),
        currentBalance: increment(formData.quantity)
      });

      // Update Supplier Balance
      const balanceChange = total - formData.paidAmount;
      await updateDoc(doc(db, 'suppliers', formData.supplierId), {
        totalPurchases: increment(total),
        totalPayments: increment(formData.paidAmount),
        balance: increment(balanceChange)
      });

      setShowAdd(false);
      setFormData({
        supplierId: '',
        itemId: '',
        quantity: 0,
        unitPrice: 0,
        paidAmount: 0,
        paymentStatus: 'نقدي',
        notes: ''
      });
    } catch (err) {
      handleFirestoreError(err, 'write', 'purchases');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">المشتريات</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">إدارة فواتير الشراء وتوريدات الخامات</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExportExcel} variant="outline" className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl border-slate-200 hover:bg-slate-50 font-bold">
            <Download size={18} className="ml-2" />
            تصدير إكسيل
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl border-slate-200 hover:bg-slate-50 font-bold">
            <Printer size={18} className="ml-2" />
            طباعة
          </Button>
          <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8 text-sm md:text-base">
            <Plus size={18} className="ml-2" />
            فاتورة شراء جديدة
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm print:hidden">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="البحث باسم المورد أو الصنف..." 
            className="pr-10 h-11 rounded-xl border-slate-200 focus:ring-primary/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <Input 
              type="date" 
              className="h-9 border-none bg-transparent font-bold text-xs" 
              value={dateFilter.start}
              onChange={e => setDateFilter({...dateFilter, start: e.target.value})}
            />
            <span className="text-slate-400 font-bold text-xs">إلى</span>
            <Input 
              type="date" 
              className="h-9 border-none bg-transparent font-bold text-xs" 
              value={dateFilter.end}
              onChange={e => setDateFilter({...dateFilter, end: e.target.value})}
            />
            {(dateFilter.start || dateFilter.end) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-red-500"
                onClick={() => setDateFilter({ start: '', end: '' })}
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">إجمالي المشتريات</p>
          <p className="text-2xl font-black text-slate-900">{filteredPurchases.reduce((acc, p) => acc + p.total, 0).toLocaleString()} ج.م</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">إجمالي المدفوع</p>
          <p className="text-2xl font-black text-emerald-600">{filteredPurchases.reduce((acc, p) => acc + p.paidAmount, 0).toLocaleString()} ج.م</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">إجمالي المتبقي (مديونية)</p>
          <p className="text-2xl font-black text-orange-600">{filteredPurchases.reduce((acc, p) => acc + (p.total - p.paidAmount), 0).toLocaleString()} ج.م</p>
        </div>
      </div>

      <Card className="dribbble-card overflow-hidden border-none print:shadow-none">
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-black">تقرير المشتريات</h1>
          <p className="text-slate-500 font-bold mt-1">بتاريخ: {format(new Date(), 'dd/MM/yyyy')}</p>
          <div className="mt-4 border-b-2 border-slate-900 w-full" />
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-right font-black text-slate-900 py-5">التاريخ</TableHead>
              <TableHead className="text-right font-black text-slate-900">المورد</TableHead>
              <TableHead className="text-right font-black text-slate-900">الصنف</TableHead>
              <TableHead className="text-right font-black text-slate-900">الكمية</TableHead>
              <TableHead className="text-right font-black text-slate-900">الوحدة</TableHead>
              <TableHead className="text-right font-black text-slate-900">سعر الوحدة</TableHead>
              <TableHead className="text-right font-black text-slate-900">الإجمالي</TableHead>
              <TableHead className="text-right font-black text-slate-900">المدفوع</TableHead>
              <TableHead className="text-right font-black text-slate-900">الحالة</TableHead>
              <TableHead className="text-right font-black text-slate-900">ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.slice().reverse().map(p => (
              <TableRow key={p.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-500">{format(new Date(p.date), 'yyyy/MM/dd')}</TableCell>
                <TableCell className="font-black text-slate-900">{suppliers.find(s => s.id === p.supplierId)?.name}</TableCell>
                <TableCell className="font-bold text-slate-700">{items.find(i => i.id === p.itemId)?.name}</TableCell>
                <TableCell className="font-bold text-slate-600">{p.quantity}</TableCell>
                <TableCell className="text-slate-500 font-medium">{p.unit}</TableCell>
                <TableCell className="font-bold text-slate-600">{p.unitPrice?.toLocaleString() || (p.total / p.quantity).toLocaleString()} ج.م</TableCell>
                <TableCell className="font-black text-primary">{p.total.toLocaleString()} ج.م</TableCell>
                <TableCell className="font-bold text-green-600">{p.paidAmount.toLocaleString()} ج.م</TableCell>
                <TableCell>
                  <Badge 
                    className={`rounded-lg px-3 py-1 border-none font-black text-[10px] uppercase tracking-widest ${
                      p.paymentStatus === 'نقدي' ? 'bg-green-100 text-green-700' : 
                      p.paymentStatus === 'شيك' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {p.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400 text-xs font-medium max-w-[150px] truncate">{p.notes}</TableCell>
              </TableRow>
            ))}
            {filteredPurchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-20 text-slate-400 font-bold">لا توجد نتائج بحث مطابقة</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Purchase Dialog */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-lg max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle className="font-black">إضافة فاتورة شراء</CardTitle>
              <CardDescription className="font-medium">أدخل تفاصيل الفاتورة لتحديث المخزون وحسابات الموردين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المورد</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white"
                    value={formData.supplierId}
                    onChange={e => setFormData({...formData, supplierId: e.target.value})}
                  >
                    <option value="">اختر مورد...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الصنف</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white"
                    value={formData.itemId}
                    onChange={e => setFormData({...formData, itemId: e.target.value})}
                  >
                    <option value="">اختر صنف...</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الكمية</label>
                  <div className="relative">
                    <Input type="number" className="rounded-xl h-11" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {items.find(i => i.id === formData.itemId)?.unit}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">سعر الوحدة</label>
                  <Input type="number" className="rounded-xl h-11" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المبلغ المدفوع</label>
                  <Input type="number" className="rounded-xl h-11" value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">طريقة الدفع</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white"
                    value={formData.paymentStatus}
                    onChange={e => setFormData({...formData, paymentStatus: e.target.value as any})}
                  >
                    <option value="نقدي">نقدي</option>
                    <option value="آجل">آجل</option>
                    <option value="شيك">شيك</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات</label>
                <Input className="rounded-xl h-11" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="أي ملاحظات إضافية..." />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="rounded-xl" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-8 h-11">حفظ الفاتورة</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Issuances({ items, issuances, costCenters }: { items: Item[], issuances: Issuance[], costCenters: CostCenter[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    jobOrderNo: '',
    costCenter: '',
    selectedItems: [{ itemId: '', quantity: 0 }]
  });

  useEffect(() => {
    if (costCenters.length > 0 && !formData.costCenter) {
      setFormData(prev => ({ ...prev, costCenter: costCenters[0].name }));
    }
  }, [costCenters]);

  const filteredIssuances = issuances.filter(iss => {
    const item = items.find(i => i.id === iss.itemId)?.name || '';
    const costCenter = iss.costCenter || '';
    const jobOrder = iss.jobOrderNo || '';
    const search = searchTerm.toLowerCase();
    const matchesSearch = item.toLowerCase().includes(search) || 
           costCenter.toLowerCase().includes(search) || 
           jobOrder.toLowerCase().includes(search);

    const issDate = new Date(iss.date);
    const matchesStart = !dateFilter.start || issDate >= new Date(dateFilter.start);
    const matchesEnd = !dateFilter.end || issDate <= new Date(dateFilter.end + 'T23:59:59');

    return matchesSearch && matchesStart && matchesEnd;
  });

  const handleExportExcel = () => {
    const data = filteredIssuances.map(iss => ({
      'التاريخ': format(new Date(iss.date), 'yyyy/MM/dd HH:mm'),
      'رقم أمر الشغل': iss.jobOrderNo,
      'الصنف': items.find(i => i.id === iss.itemId)?.name || 'غير معروف',
      'الكمية': iss.quantity,
      'الوحدة': iss.unit,
      'مركز التكلفة': iss.costCenter,
      'الإجمالي': iss.total
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "أذونات الصرف");
    XLSX.writeFile(wb, `أذونات_الصرف_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      selectedItems: [...formData.selectedItems, { itemId: '', quantity: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      selectedItems: formData.selectedItems.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.selectedItems];
    (newItems[index] as any)[field] = value;
    setFormData({ ...formData, selectedItems: newItems });
  };

  const handleAdd = async () => {
    if (!formData.jobOrderNo || formData.selectedItems.some(i => !i.itemId || i.quantity <= 0)) {
      setError('يرجى التأكد من ملء جميع البيانات والكميات');
      return;
    }
    
    setError(null);
    try {
      const date = new Date().toISOString();
      
      for (const selectedItem of formData.selectedItems) {
        const item = items.find(i => i.id === selectedItem.itemId);
        if (!item) continue;

        const total = selectedItem.quantity * item.price;
        
        await addDoc(collection(db, 'issuances'), {
          jobOrderNo: formData.jobOrderNo,
          costCenter: formData.costCenter,
          itemId: selectedItem.itemId,
          quantity: selectedItem.quantity,
          total,
          price: item.price,
          unit: item.unit,
          date
        });

        // Update Item Stock
        await updateDoc(doc(db, 'items', selectedItem.itemId), {
          outward: increment(selectedItem.quantity),
          currentBalance: increment(-selectedItem.quantity)
        });
      }

      setShowAdd(false);
      setFormData({
        jobOrderNo: '',
        costCenter: costCenters[0]?.name || '',
        selectedItems: [{ itemId: '', quantity: 0 }]
      });
    } catch (err) {
      handleFirestoreError(err, 'write', 'issuances');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">صرف الخامات</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">إدارة أذونات صرف الخامات لمراحل الإنتاج</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExportExcel} variant="outline" className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl border-slate-200 hover:bg-slate-50 font-bold">
            <Download size={18} className="ml-2" />
            تصدير إكسيل
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl border-slate-200 hover:bg-slate-50 font-bold">
            <Printer size={18} className="ml-2" />
            طباعة
          </Button>
          <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8 text-sm md:text-base">
            <Plus size={18} className="ml-2" />
            إذن صرف جديد
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm print:hidden">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="البحث باسم الصنف، مركز التكلفة، أو رقم أمر الشغل..." 
            className="pr-10 h-11 rounded-xl border-slate-200 focus:ring-primary/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <Input 
              type="date" 
              className="h-9 border-none bg-transparent font-bold text-xs" 
              value={dateFilter.start}
              onChange={e => setDateFilter({...dateFilter, start: e.target.value})}
            />
            <span className="text-slate-400 font-bold text-xs">إلى</span>
            <Input 
              type="date" 
              className="h-9 border-none bg-transparent font-bold text-xs" 
              value={dateFilter.end}
              onChange={e => setDateFilter({...dateFilter, end: e.target.value})}
            />
            {(dateFilter.start || dateFilter.end) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-red-500"
                onClick={() => setDateFilter({ start: '', end: '' })}
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="dribbble-card overflow-hidden border-none print:shadow-none">
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-black">تقرير أذونات الصرف</h1>
          <p className="text-slate-500 font-bold mt-1">بتاريخ: {format(new Date(), 'dd/MM/yyyy')}</p>
          <div className="mt-4 border-b-2 border-slate-900 w-full" />
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-right font-black text-slate-900 py-5">التاريخ</TableHead>
              <TableHead className="text-right font-black text-slate-900">رقم أمر الشغل</TableHead>
              <TableHead className="text-right font-black text-slate-900">الصنف</TableHead>
              <TableHead className="text-right font-black text-slate-900">الكمية</TableHead>
              <TableHead className="text-right font-black text-slate-900">الوحدة</TableHead>
              <TableHead className="text-right font-black text-slate-900">مركز التكلفة</TableHead>
              <TableHead className="text-right font-black text-slate-900">الإجمالي</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssuances.slice().reverse().map(iss => (
              <TableRow key={iss.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-500">{format(new Date(iss.date), 'yyyy/MM/dd HH:mm')}</TableCell>
                <TableCell className="font-black text-slate-900">
                  <Badge variant="outline" className="border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                    #{iss.jobOrderNo || '-'}
                  </Badge>
                </TableCell>
                <TableCell className="font-black text-slate-900">{items.find(i => i.id === iss.itemId)?.name}</TableCell>
                <TableCell className="font-bold text-slate-600">{iss.quantity}</TableCell>
                <TableCell className="text-slate-500 font-medium">{iss.unit}</TableCell>
                <TableCell>
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                    {iss.costCenter}
                  </Badge>
                </TableCell>
                <TableCell className="font-black text-primary">{iss.total.toLocaleString()} ج.م</TableCell>
              </TableRow>
            ))}
            {filteredIssuances.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 text-slate-400 font-bold">لا توجد نتائج بحث مطابقة</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Issuance Dialog */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-2xl max-h-[90vh] overflow-auto my-8">
            <CardHeader>
              <CardTitle className="font-black text-2xl">إصدار إذن صرف خامات</CardTitle>
              <CardDescription className="font-medium">حدد الأصناف والكميات المراد صرفها لمرحلة إنتاج معينة</CardDescription>
              {error && <p className="text-red-500 font-bold text-sm mt-2">{error}</p>}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رقم أمر الشغل</label>
                  <Input className="rounded-xl h-11" value={formData.jobOrderNo} onChange={e => setFormData({...formData, jobOrderNo: e.target.value})} placeholder="مثال: 1234" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">مركز التكلفة (المرحلة)</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white"
                    value={formData.costCenter}
                    onChange={e => setFormData({...formData, costCenter: e.target.value})}
                  >
                    <option value="">اختر مركز التكلفة...</option>
                    {costCenters.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-black text-slate-900">الأصناف المراد صرفها</h3>
                  <Button variant="outline" size="sm" onClick={handleAddItem} className="rounded-xl border-slate-200 font-bold text-primary hover:bg-primary/5">
                    <Plus size={14} className="ml-1" />
                    إضافة صنف
                  </Button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {formData.selectedItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-end p-5 bg-slate-50/50 rounded-2xl border border-slate-100 relative group transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
                      {formData.selectedItems.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 left-2 text-slate-300 hover:text-red-500 hover:bg-red-50 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">الصنف</label>
                        <select 
                          className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white"
                          value={item.itemId}
                          onChange={e => handleItemChange(idx, 'itemId', e.target.value)}
                        >
                          <option value="">اختر صنف...</option>
                          {items.map(i => (
                            <option key={i.id} value={i.id}>
                              {i.name} (المتاح: {i.currentBalance} {i.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">الكمية</label>
                        <div className="relative">
                          <Input 
                            className="rounded-xl h-11"
                            type="number" 
                            value={item.quantity} 
                            onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} 
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            {items.find(i => i.id === item.itemId)?.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-10 h-12 font-black">تأكيد الصرف</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Suppliers({ suppliers, purchases, items, supplierPayments }: { suppliers: Supplier[], purchases: Purchase[], items: Item[], supplierPayments: SupplierPayment[] }) {
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSupplierId, setPaymentSupplierId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    paymentMethod: 'نقدي' as const,
    referenceNumber: '',
    notes: ''
  });

  const handleAddPayment = async () => {
    if (!paymentSupplierId || paymentData.amount <= 0) return;
    
    const supplier = suppliers.find(s => s.id === paymentSupplierId);
    if (!supplier) return;

    try {
      // 1. Add payment record
      await addDoc(collection(db, 'supplierPayments'), {
        supplierId: paymentSupplierId,
        ...paymentData
      });

      // 2. Update supplier balance
      await updateDoc(doc(db, 'suppliers', paymentSupplierId), {
        totalPayments: supplier.totalPayments + paymentData.amount,
        balance: supplier.balance - paymentData.amount
      });

      setShowPaymentModal(false);
      setPaymentSupplierId(null);
      setPaymentData({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: 0,
        paymentMethod: 'نقدي',
        referenceNumber: '',
        notes: ''
      });
    } catch (err) {
      handleFirestoreError(err, 'write', 'supplierPayments');
    }
  };

  const filtered = suppliers.filter(s => s.name.includes(search));
  const supplierPurchases = purchases.filter(p => p.supplierId === selectedSupplier?.id);
  const supplierPaymentsList = supplierPayments.filter(p => p.supplierId === selectedSupplier?.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">الموردين</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">إدارة حسابات الموردين وكشوف الحسابات</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="بحث عن مورد بالاسم..." 
            className="pr-12 h-10 md:h-14 rounded-xl md:rounded-2xl border-none bg-white shadow-lg md:shadow-xl shadow-slate-200/50 font-bold text-slate-900 placeholder:text-slate-400 text-sm md:text-base" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <Card className="dribbble-card overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-right font-black text-slate-900 py-5">اسم المورد</TableHead>
              <TableHead className="text-right font-black text-slate-900">إجمالي المشتريات</TableHead>
              <TableHead className="text-right font-black text-slate-900">إجمالي المدفوعات</TableHead>
              <TableHead className="text-right font-black text-slate-900">الرصيد المتبقي</TableHead>
              <TableHead className="text-right font-black text-slate-900">الحالة</TableHead>
              <TableHead className="text-right font-black text-slate-900">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-black text-slate-900">{s.name}</TableCell>
                <TableCell className="font-bold text-slate-600">{s.totalPurchases.toLocaleString()} ج.م</TableCell>
                <TableCell className="font-bold text-green-600">{s.totalPayments.toLocaleString()} ج.م</TableCell>
                <TableCell className="font-black text-orange-600">{s.balance.toLocaleString()} ج.م</TableCell>
                <TableCell>
                  {s.balance > 0 ? (
                    <Badge className="bg-orange-100 text-orange-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">مطلوب السداد</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">خالص</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setPaymentSupplierId(s.id);
                      setShowPaymentModal(true);
                    }} className="rounded-xl border-green-200 font-bold text-green-700 hover:bg-green-50">
                      <DollarSign size={16} className="ml-1" />
                      تسديد دفعة
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedSupplier(s)} className="rounded-xl border-slate-200 font-bold text-primary hover:bg-primary/5">
                      <FileText size={16} className="ml-1" />
                      كشف حساب
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Supplier Account Statement Dialog */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl border-zinc-200 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b border-zinc-100 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">كشف حساب: {selectedSupplier.name}</CardTitle>
                  <CardDescription>عرض كافة المعاملات المالية والمشتريات</CardDescription>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <Button variant="outline" onClick={() => window.print()} className="rounded-xl border-slate-200 font-bold">
                    <Printer size={16} className="ml-2" />
                    طباعة الكشف
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedSupplier(null)}>إغلاق</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-auto flex-1">
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 border-b border-zinc-100 print:bg-white">
                <div className="p-4 bg-white rounded-xl border border-zinc-200">
                  <p className="text-xs text-zinc-500 mb-1">إجمالي المشتريات</p>
                  <p className="text-xl font-bold">{selectedSupplier.totalPurchases.toLocaleString()} ج.م</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-zinc-200">
                  <p className="text-xs text-zinc-500 mb-1">إجمالي المدفوعات</p>
                  <p className="text-xl font-bold text-green-600">{selectedSupplier.totalPayments.toLocaleString()} ج.م</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-zinc-200">
                  <p className="text-xs text-zinc-500 mb-1">الرصيد المتبقي</p>
                  <p className="text-xl font-bold text-orange-600">{selectedSupplier.balance.toLocaleString()} ج.م</p>
                </div>
              </div>
              
              <Table>
                <TableHeader className="bg-zinc-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">البيان / الصنف</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">سعر الوحدة</TableHead>
                    <TableHead className="text-right">مدين (مشتريات)</TableHead>
                    <TableHead className="text-right">دائن (مدفوعات)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ...supplierPurchases.map(p => ({ ...p, _type: 'purchase', _date: new Date(p.date).getTime() })),
                    ...supplierPaymentsList.map(p => ({ ...p, _type: 'payment', _date: new Date(p.date).getTime() }))
                  ].sort((a, b) => b._date - a._date).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{format(new Date(item.date), 'yyyy/MM/dd')}</TableCell>
                      <TableCell>
                        {item._type === 'purchase' ? (
                          <Badge className="bg-blue-100 text-blue-700 border-none">فاتورة مشتريات</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 border-none">دفعة {item.paymentMethod}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item._type === 'purchase' ? items.find(i => i.id === item.itemId)?.name : item.notes || `دفعة ${item.paymentMethod} ${item.referenceNumber ? `(${item.referenceNumber})` : ''}`}
                      </TableCell>
                      <TableCell>{item._type === 'purchase' ? `${item.quantity} ${item.unit}` : '-'}</TableCell>
                      <TableCell>{item._type === 'purchase' ? (item.unitPrice || (item.total / item.quantity)).toLocaleString() : '-'}</TableCell>
                      <TableCell className="font-bold text-orange-600">{item._type === 'purchase' ? item.total.toLocaleString() : '-'}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {item._type === 'purchase' ? (item.paidAmount > 0 ? item.paidAmount.toLocaleString() : '-') : item.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {supplierPurchases.length === 0 && supplierPaymentsList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-zinc-500">لا توجد معاملات مسجلة لهذا المورد</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تسديد دفعة للمورد</CardTitle>
              <CardDescription>
                {suppliers.find(s => s.id === paymentSupplierId)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <Input type="date" className="rounded-xl h-11" value={paymentData.date} onChange={e => setPaymentData({...paymentData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المبلغ</label>
                <Input type="number" step="any" className="rounded-xl h-11" value={paymentData.amount || ''} onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">طريقة الدفع</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={paymentData.paymentMethod} onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value as any})}>
                  <option value="نقدي">نقدي</option>
                  <option value="شيك">شيك</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                </select>
              </div>
              {(paymentData.paymentMethod === 'شيك' || paymentData.paymentMethod === 'تحويل بنكي') && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رقم المرجع (رقم الشيك / التحويل)</label>
                  <Input className="rounded-xl h-11" value={paymentData.referenceNumber} onChange={e => setPaymentData({...paymentData, referenceNumber: e.target.value})} />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات</label>
                <Input className="rounded-xl h-11" value={paymentData.notes} onChange={e => setPaymentData({...paymentData, notes: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentSupplierId(null);
                }}>إلغاء</Button>
                <Button onClick={handleAddPayment} className="bg-green-600 hover:bg-green-700 text-white px-10 h-12 font-black rounded-xl">حفظ الدفعة</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Returns({ items, suppliers, costCenters }: { items: Item[], suppliers: Supplier[], costCenters: CostCenter[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [returnType, setReturnType] = useState<'cost_center' | 'supplier'>('cost_center');
  const [formData, setFormData] = useState({
    itemId: '',
    supplierId: '',
    quantity: 0,
    costCenter: '',
    notes: ''
  });

  useEffect(() => {
    if (costCenters.length > 0 && !formData.costCenter) {
      setFormData(prev => ({ ...prev, costCenter: costCenters[0].name }));
    }
  }, [costCenters]);

  const handleAdd = async () => {
    if (!formData.itemId || formData.quantity <= 0) return;
    if (returnType === 'supplier' && !formData.supplierId) return;
    
    try {
      const item = items.find(i => i.id === formData.itemId);
      if (!item) return;

      if (returnType === 'cost_center') {
        // Return from Cost Center to Inventory
        await updateDoc(doc(db, 'items', formData.itemId), {
          returned: increment(formData.quantity),
          currentBalance: increment(formData.quantity)
        });
      } else {
        // Return from Inventory to Supplier
        // 1. Update Inventory
        await updateDoc(doc(db, 'items', formData.itemId), {
          outward: increment(formData.quantity),
          currentBalance: increment(-formData.quantity)
        });

        // 2. Update Supplier Balance (Reduce debt)
        const refundValue = formData.quantity * item.price;
        await updateDoc(doc(db, 'suppliers', formData.supplierId), {
          totalPurchases: increment(-refundValue),
          balance: increment(-refundValue)
        });
      }

      // Log the return transaction (optional, but good for history)
      await addDoc(collection(db, 'issuances'), {
        date: new Date().toISOString(),
        itemId: formData.itemId,
        quantity: formData.quantity,
        unit: item.unit,
        price: item.price,
        total: formData.quantity * item.price,
        costCenter: returnType === 'cost_center' ? `مرتجع من: ${formData.costCenter}` : `مرتجع إلى المورد: ${suppliers.find(s => s.id === formData.supplierId)?.name}`,
        jobOrderNo: 'RETURN'
      });

      setShowAdd(false);
      setFormData({ itemId: '', supplierId: '', quantity: 0, costCenter: costCenters[0]?.name || '', notes: '' });
    } catch (err) {
      handleFirestoreError(err, 'write', 'items');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">المرتجع</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">إدارة المرتجعات من مراكز التكلفة أو إلى الموردين</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8 text-sm md:text-base">
          <Plus size={18} className="ml-2" />
          تسجيل مرتجع جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card 
          className="dribbble-card p-10 text-center border-none hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer group" 
          onClick={() => { setReturnType('cost_center'); setShowAdd(true); }}
        >
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <ArrowUpRight size={32} className="text-primary rotate-180" />
          </div>
          <h3 className="font-black text-2xl text-slate-900 mb-2">مرتجع من مركز تكلفة</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">خامات زائدة تعود من الورشة إلى المخزن لتحديث الرصيد المتاح</p>
        </Card>

        <Card 
          className="dribbble-card p-10 text-center border-none hover:shadow-2xl hover:shadow-orange-500/10 transition-all cursor-pointer group" 
          onClick={() => { setReturnType('supplier'); setShowAdd(true); }}
        >
          <div className="mx-auto w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <ArrowUpRight size={32} className="text-orange-600" />
          </div>
          <h3 className="font-black text-2xl text-slate-900 mb-2">مرتجع إلى مورد</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">خامات معيبة أو زائدة تعود من المخزن للمورد لخصم قيمتها من المديونية</p>
        </Card>
      </div>

      {/* Add Return Dialog */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle className="font-black text-2xl">{returnType === 'cost_center' ? 'مرتجع من مركز تكلفة' : 'مرتجع إلى مورد'}</CardTitle>
              <CardDescription className="font-medium">سيتم تحديث أرصدة المخازن والحسابات تلقائياً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الصنف</label>
                <select 
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold"
                  value={formData.itemId}
                  onChange={e => setFormData({...formData, itemId: e.target.value})}
                >
                  <option value="">اختر صنف...</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} (الرصيد: {i.currentBalance} {i.unit})</option>)}
                </select>
              </div>

              {returnType === 'cost_center' ? (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">من مركز تكلفة (المرحلة)</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold"
                    value={formData.costCenter}
                    onChange={e => setFormData({...formData, costCenter: e.target.value})}
                  >
                    <option value="">اختر مركز التكلفة...</option>
                    {costCenters.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المورد</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold"
                    value={formData.supplierId}
                    onChange={e => setFormData({...formData, supplierId: e.target.value})}
                  >
                    <option value="">اختر المورد...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الكمية</label>
                <div className="relative">
                  <Input className="rounded-xl h-11" type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {items.find(i => i.id === formData.itemId)?.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات</label>
                <Input className="rounded-xl h-11" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="سبب الارتجاع..." />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-10 h-12 font-black">تأكيد الارتجاع</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function WastedItemsView({ items, wasteRecords }: { items: Item[], wasteRecords: Waste[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: 0,
    reason: '',
    notes: ''
  });

  const handleAdd = async () => {
    if (!formData.itemId || formData.quantity <= 0 || !formData.reason) {
      setError('يرجى ملء جميع البيانات المطلوبة');
      return;
    }

    setError(null);
    try {
      const item = items.find(i => i.id === formData.itemId);
      if (!item) return;

      const date = new Date().toISOString();

      // 1. Add Waste Record
      await addDoc(collection(db, 'waste'), {
        ...formData,
        unit: item.unit,
        date
      });

      // 2. Update Item Stock
      await updateDoc(doc(db, 'items', formData.itemId), {
        wasted: increment(formData.quantity),
        currentBalance: increment(-formData.quantity)
      });

      setShowAdd(false);
      setFormData({ itemId: '', quantity: 0, reason: '', notes: '' });
    } catch (err) {
      handleFirestoreError(err, 'write', 'waste');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">الهالك</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">تسجيل ومتابعة المواد التالفة أو الهالك</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8 text-sm md:text-base">
          <Plus size={18} className="ml-2" />
          تسجيل هالك جديد
        </Button>
      </div>

      <Card className="dribbble-card overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-right font-black text-slate-900 py-5">التاريخ</TableHead>
              <TableHead className="text-right font-black text-slate-900">الصنف</TableHead>
              <TableHead className="text-right font-black text-slate-900">الكمية</TableHead>
              <TableHead className="text-right font-black text-slate-900">الوحدة</TableHead>
              <TableHead className="text-right font-black text-slate-900">السبب</TableHead>
              <TableHead className="text-right font-black text-slate-900">ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wasteRecords.slice().reverse().map(record => (
              <TableRow key={record.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-500">{format(new Date(record.date), 'yyyy/MM/dd HH:mm')}</TableCell>
                <TableCell className="font-black text-slate-900">{items.find(i => i.id === record.itemId)?.name}</TableCell>
                <TableCell className="font-bold text-red-600">{record.quantity}</TableCell>
                <TableCell className="text-slate-500 font-medium">{record.unit}</TableCell>
                <TableCell>
                  <Badge className="bg-red-100 text-red-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                    {record.reason}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600 font-medium">{record.notes}</TableCell>
              </TableRow>
            ))}
            {wasteRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-400 font-bold">لا توجد سجلات هالك حالياً</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تسجيل هالك جديد</CardTitle>
              <CardDescription className="font-medium">سيتم خصم الكمية من رصيد المخزن تلقائياً</CardDescription>
              {error && <p className="text-red-500 font-bold text-sm mt-2">{error}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الصنف</label>
                <select 
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold"
                  value={formData.itemId}
                  onChange={e => setFormData({...formData, itemId: e.target.value})}
                >
                  <option value="">اختر صنف...</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} (الرصيد: {i.currentBalance})</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الكمية</label>
                <div className="relative">
                  <Input className="rounded-xl h-11" type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {items.find(i => i.id === formData.itemId)?.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">السبب</label>
                <select 
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold"
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                >
                  <option value="">اختر السبب...</option>
                  <option value="تلف">تلف</option>
                  <option value="كسر">كسر</option>
                  <option value="انتهاء صلاحية">انتهاء صلاحية</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات إضافية</label>
                <Input className="rounded-xl h-11" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="تفاصيل إضافية..." />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-10 h-12 font-black">حفظ السجل</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ReportsView({ items, suppliers, purchases, issuances, warehouses }: { items: Item[], suppliers: Supplier[], purchases: Purchase[], issuances: Issuance[], warehouses: Warehouse[] }) {
  // 1. Data for Warehouse Value Chart
  const warehouseData = warehouses.map(w => {
    const value = items
      .filter(i => i.warehouseId === w.id)
      .reduce((acc, i) => acc + (i.currentBalance * i.price), 0);
    return { name: w.name, value };
  });

  // 2. Data for Cost Center Consumption
  const costCenterData = issuances.reduce((acc: any[], iss) => {
    const existing = acc.find(a => a.name === iss.costCenter);
    if (existing) {
      existing.value += iss.total;
    } else {
      acc.push({ name: iss.costCenter, value: iss.total });
    }
    return acc;
  }, []);

  // 3. Monthly Trends (Last 6 months)
  const monthlyTrends = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = format(date, 'MMM yyyy');
    
    const monthPurchases = purchases
      .filter(p => format(new Date(p.date), 'MMM yyyy') === monthStr)
      .reduce((acc, p) => acc + p.total, 0);
      
    const monthIssuances = issuances
      .filter(iss => format(new Date(iss.date), 'MMM yyyy') === monthStr)
      .reduce((acc, iss) => acc + iss.total, 0);

    return { name: monthStr, purchases: monthPurchases, issuances: monthIssuances };
  }).reverse();

  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <div className="space-y-10 pb-20 print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">التقارير التحليلية</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">نظرة شاملة على أداء المخازن والتدفقات المالية</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-10 md:h-12 px-4 md:px-6 border-slate-200 font-bold text-sm md:text-base" onClick={() => exportToExcel(warehouseData, 'قيمة_المخازن')}>
            تصدير إكسيل
          </Button>
          <Button onClick={() => window.print()} className="btn-primary h-10 md:h-12 px-6 md:px-8 font-black text-sm md:text-base">
            <FileText size={18} className="ml-2" />
            طباعة / PDF
          </Button>
        </div>
      </div>

      <div className="hidden print:block text-center mb-12">
        <h1 className="text-3xl font-black text-slate-900">تقرير مصنع النجار للأثاث</h1>
        <p className="text-slate-500 font-bold mt-2">{format(new Date(), 'eeee, d MMMM yyyy', { locale: ar })}</p>
        <div className="mt-4 w-20 h-1 bg-primary mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Inventory Value by Warehouse */}
        <Card className="dribbble-card border-none">
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-900">قيمة المخزون لكل مخزن</CardTitle>
            <CardDescription className="font-medium">توزيع رأس المال المركون في المخازن</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(value: number) => [`${value.toLocaleString()} ج.م`, 'القيمة']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Consumption by Cost Center */}
        <Card className="dribbble-card border-none">
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-900">استهلاك مراكز التكلفة</CardTitle>
            <CardDescription className="font-medium">توزيع المنصرف على مراحل الإنتاج</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costCenterData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {costCenterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(value: number) => `${value.toLocaleString()} ج.م`} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Purchase vs Issuance Trends */}
        <Card className="dribbble-card border-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-900">حركة المشتريات مقابل المنصرف</CardTitle>
            <CardDescription className="font-medium">مقارنة التدفقات الداخلة والخارجة خلال 6 أشهر</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontWeight: 600 }} />
                <Line type="monotone" dataKey="purchases" name="المشتريات" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="issuances" name="المنصرف" stroke="#94a3b8" strokeWidth={4} dot={{ r: 6, fill: '#94a3b8', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="dribbble-card border-none overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-900">حالة المخزون الحالي</CardTitle>
            <CardDescription className="font-medium">الأصناف المتاحة وكمياتها ووحداتها</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="text-right font-black text-slate-900 py-5">الصنف</TableHead>
                  <TableHead className="text-right font-black text-slate-900">الرصيد</TableHead>
                  <TableHead className="text-right font-black text-slate-900">الوحدة</TableHead>
                  <TableHead className="text-right font-black text-slate-900">القيمة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.sort((a, b) => b.currentBalance - a.currentBalance).slice(0, 10).map(item => (
                  <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-black text-slate-900">{item.name}</TableCell>
                    <TableCell className={`font-bold ${item.currentBalance <= item.safetyLimit ? 'text-red-500' : 'text-slate-700'}`}>
                      {item.currentBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">{item.unit}</TableCell>
                    <TableCell className="font-black text-emerald-600">{(item.currentBalance * item.price).toLocaleString()} ج.م</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="dribbble-card border-none overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-900">تقرير مديونيات الموردين</CardTitle>
            <CardDescription className="font-medium">قائمة الموردين الذين لهم أرصدة مستحقة</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="text-right font-black text-slate-900 py-5">المورد</TableHead>
                  <TableHead className="text-right font-black text-slate-900">المتبقي (دين)</TableHead>
                  <TableHead className="text-right font-black text-slate-900">نسبة السداد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.filter(s => s.balance > 0).sort((a, b) => b.balance - a.balance).map(s => (
                  <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-black text-slate-900">{s.name}</TableCell>
                    <TableCell className="text-red-500 font-black">{s.balance.toLocaleString()} ج.م</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary shadow-[0_0_8px_var(--primary)]" 
                            style={{ width: `${(s.totalPayments / s.totalPurchases) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-900">{Math.round((s.totalPayments / s.totalPurchases) * 100)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BladeSharpeningView({ records }: { records: BladeSharpening[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ 
    bladeName: '', 
    quantity: 1, 
    cost: 0, 
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const handleAdd = async () => {
    if (!formData.bladeName || formData.quantity <= 0) return;
    try {
      await addDoc(collection(db, 'bladeSharpening'), {
        ...formData,
        date: new Date(formData.date).toISOString()
      });
      setShowAdd(false);
      setFormData({ bladeName: '', quantity: 1, cost: 0, notes: '', date: format(new Date(), 'yyyy-MM-dd') });
    } catch (err) { handleFirestoreError(err, 'write', 'bladeSharpening'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">سن الصواني</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">تسجيل ومتابعة عمليات سن صواني التقطيع</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8">
          <Plus size={18} className="ml-2" />
          تسجيل عملية سن
        </Button>
      </div>

      <Card className="dribbble-card overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-right font-black text-slate-900 py-5">التاريخ</TableHead>
              <TableHead className="text-right font-black text-slate-900">اسم الصينية</TableHead>
              <TableHead className="text-right font-black text-slate-900">العدد</TableHead>
              <TableHead className="text-right font-black text-slate-900">التكلفة</TableHead>
              <TableHead className="text-right font-black text-slate-900">ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
              <TableRow key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-500">{format(new Date(r.date), 'yyyy/MM/dd')}</TableCell>
                <TableCell className="font-black text-slate-900">{r.bladeName}</TableCell>
                <TableCell className="font-bold text-slate-600">{r.quantity}</TableCell>
                <TableCell className="font-black text-primary">{r.cost.toLocaleString()} ج.م</TableCell>
                <TableCell className="text-sm text-slate-600">{r.notes}</TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-400 font-bold">لا توجد سجلات حالياً</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تسجيل عملية سن صواني</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <Input type="date" className="rounded-xl h-11" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم الصينية / النوع</label>
                <Input className="rounded-xl h-11" value={formData.bladeName} onChange={e => setFormData({...formData, bladeName: e.target.value})} placeholder="مثال: صينية تقطيع خشب 12 بوصة" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">العدد</label>
                  <Input type="number" className="rounded-xl h-11" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">التكلفة الإجمالية</label>
                  <Input type="number" className="rounded-xl h-11" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات</label>
                <Input className="rounded-xl h-11" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="أي ملاحظات إضافية..." />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-10 h-12 font-black">حفظ السجل</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function PlateSharpeningView({ records }: { records: PlateSharpening[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ 
    plateName: '', 
    quantity: 1, 
    cost: 0, 
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const handleAdd = async () => {
    if (!formData.plateName || formData.quantity <= 0) return;
    try {
      await addDoc(collection(db, 'plateSharpening'), {
        ...formData,
        date: new Date(formData.date).toISOString()
      });
      setShowAdd(false);
      setFormData({ plateName: '', quantity: 1, cost: 0, notes: '', date: format(new Date(), 'yyyy-MM-dd') });
    } catch (err) { handleFirestoreError(err, 'write', 'plateSharpening'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">سن الصفايح</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">تسجيل ومتابعة عمليات سن صفايح المنشار</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8">
          <Plus size={18} className="ml-2" />
          تسجيل عملية سن
        </Button>
      </div>

      <Card className="dribbble-card overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-right font-black text-slate-900 py-5">التاريخ</TableHead>
              <TableHead className="text-right font-black text-slate-900">اسم الصفيحة</TableHead>
              <TableHead className="text-right font-black text-slate-900">العدد</TableHead>
              <TableHead className="text-right font-black text-slate-900">التكلفة</TableHead>
              <TableHead className="text-right font-black text-slate-900">ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
              <TableRow key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-500">{format(new Date(r.date), 'yyyy/MM/dd')}</TableCell>
                <TableCell className="font-black text-slate-900">{r.plateName}</TableCell>
                <TableCell className="font-bold text-slate-600">{r.quantity}</TableCell>
                <TableCell className="font-black text-primary">{r.cost.toLocaleString()} ج.م</TableCell>
                <TableCell className="text-sm text-slate-600">{r.notes}</TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-400 font-bold">لا توجد سجلات حالياً</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تسجيل عملية سن صفايح</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <Input type="date" className="rounded-xl h-11" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم الصفيحة / النوع</label>
                <Input className="rounded-xl h-11" value={formData.plateName} onChange={e => setFormData({...formData, plateName: e.target.value})} placeholder="مثال: صفيحة منشار شريط" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">العدد</label>
                  <Input type="number" className="rounded-xl h-11" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">التكلفة الإجمالية</label>
                  <Input type="number" className="rounded-xl h-11" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات</label>
                <Input className="rounded-xl h-11" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="أي ملاحظات إضافية..." />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-10 h-12 font-black">حفظ السجل</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MachineMaintenanceView({ records }: { records: MachineMaintenance[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ 
    machineName: '', 
    maintenanceType: '', 
    cost: 0, 
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const handleAdd = async () => {
    if (!formData.machineName || !formData.maintenanceType) return;
    try {
      await addDoc(collection(db, 'machineMaintenance'), {
        ...formData,
        date: new Date(formData.date).toISOString()
      });
      setShowAdd(false);
      setFormData({ machineName: '', maintenanceType: '', cost: 0, notes: '', date: format(new Date(), 'yyyy-MM-dd') });
    } catch (err) { handleFirestoreError(err, 'write', 'machineMaintenance'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">صيانة الالات والمعدات</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">تسجيل ومتابعة صيانة الماكينات والمعدات بالمصنع</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8">
          <Plus size={18} className="ml-2" />
          تسجيل صيانة جديدة
        </Button>
      </div>

      <Card className="dribbble-card overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-right font-black text-slate-900 py-5">التاريخ</TableHead>
              <TableHead className="text-right font-black text-slate-900">اسم الماكينة</TableHead>
              <TableHead className="text-right font-black text-slate-900">نوع الصيانة</TableHead>
              <TableHead className="text-right font-black text-slate-900">التكلفة</TableHead>
              <TableHead className="text-right font-black text-slate-900">ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
              <TableRow key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-500">{format(new Date(r.date), 'yyyy/MM/dd')}</TableCell>
                <TableCell className="font-black text-slate-900">{r.machineName}</TableCell>
                <TableCell className="font-bold text-blue-600">{r.maintenanceType}</TableCell>
                <TableCell className="font-black text-primary">{r.cost.toLocaleString()} ج.م</TableCell>
                <TableCell className="text-sm text-slate-600">{r.notes}</TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-400 font-bold">لا توجد سجلات حالياً</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تسجيل صيانة ماكينة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <Input type="date" className="rounded-xl h-11" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم الماكينة / المعدة</label>
                <Input className="rounded-xl h-11" value={formData.machineName} onChange={e => setFormData({...formData, machineName: e.target.value})} placeholder="مثال: ماكينة تقطيع CNC" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">نوع الصيانة</label>
                <Input className="rounded-xl h-11" value={formData.maintenanceType} onChange={e => setFormData({...formData, maintenanceType: e.target.value})} placeholder="مثال: تغيير سيور / عمرة موتور" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التكلفة</label>
                <Input type="number" className="rounded-xl h-11" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات</label>
                <Input className="rounded-xl h-11" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="تفاصيل إضافية..." />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-10 h-12 font-black">حفظ السجل</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function EmployeesView({ employees }: { employees: Employee[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('الكل');
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    dailyRate: 0,
    hireDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'نشط' as const,
    shiftStart: '08:00',
    shiftEnd: '18:00'
  });

  const departments = ['الكل', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[]];

  const filteredEmployees = selectedDept === 'الكل' 
    ? employees 
    : employees.filter(e => e.department === selectedDept);

  const handleAdd = async () => {
    if (!formData.name || formData.dailyRate <= 0) return;
    try {
      await addDoc(collection(db, 'employees'), formData);
      setShowAdd(false);
      setFormData({ name: '', position: '', department: '', dailyRate: 0, hireDate: format(new Date(), 'yyyy-MM-dd'), status: 'نشط', shiftStart: '08:00', shiftEnd: '18:00' });
    } catch (err) { handleFirestoreError(err, 'write', 'employees'); }
  };

  const handleUpdate = async () => {
    if (!editingEmployee) return;
    try {
      const { id, ...data } = editingEmployee;
      await updateDoc(doc(db, 'employees', id), data);
      setEditingEmployee(null);
    } catch (err) { handleFirestoreError(err, 'update', 'employees'); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, 'employees', deletingId));
      setDeletingId(null);
    } catch (err) { handleFirestoreError(err, 'delete', 'employees'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">الموظفين</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">إدارة بيانات الموظفين والرواتب اليومية</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="h-10 md:h-12 rounded-2xl border border-slate-200 px-4 bg-white font-bold text-sm"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8">
            <Plus size={18} className="ml-2" />
            إضافة موظف جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredEmployees.map(emp => (
          <Card key={emp.id} className="dribbble-card border-none overflow-hidden group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className={`rounded-lg px-3 py-1 border-none font-black text-[10px] uppercase tracking-widest ${
                  emp.status === 'نشط' ? 'bg-green-100 text-green-700' : 
                  emp.status === 'موقوف' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {emp.status}
                </Badge>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Users size={20} />
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-black text-xl text-slate-900">{emp.name}</CardTitle>
                  <CardDescription className="font-bold text-primary">
                    {emp.position} {emp.department && <span className="text-slate-400 mr-1">| {emp.department}</span>}
                  </CardDescription>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button onClick={() => setEditingEmployee(emp)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 size={14} />
                  </Button>
                  <Button onClick={() => setDeletingId(emp.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">اليومية</span>
                    <span className="font-black text-slate-900">{emp.dailyRate.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">سعر الساعة (10س)</span>
                    <span className="font-black text-blue-600">{(emp.dailyRate / 10).toLocaleString()} ج.م</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تاريخ التعيين</span>
                    <span className="font-bold text-slate-500 text-xs">{emp.hireDate}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">مواعيد العمل</span>
                    <span className="font-bold text-slate-500 text-xs">{emp.shiftStart || '08:00'} - {emp.shiftEnd || '18:00'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">إضافة موظف جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الاسم بالكامل</label>
                <Input className="rounded-xl h-11" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الوظيفة / المسمى الوظيفي</label>
                  <Input className="rounded-xl h-11" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">القسم</label>
                  <Input className="rounded-xl h-11" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="مثال: الإنتاج، المخازن..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اليومية</label>
                  <Input type="number" className="rounded-xl h-11" value={formData.dailyRate} onChange={e => setFormData({...formData, dailyRate: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">تاريخ التعيين</label>
                  <Input type="date" className="rounded-xl h-11" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">موعد الحضور</label>
                  <Input type="time" className="rounded-xl h-11" value={formData.shiftStart} onChange={e => setFormData({...formData, shiftStart: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">موعد الانصراف</label>
                  <Input type="time" className="rounded-xl h-11" value={formData.shiftEnd} onChange={e => setFormData({...formData, shiftEnd: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الحالة</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option value="نشط">نشط</option>
                  <option value="موقوف">موقوف</option>
                  <option value="مستقيل">مستقيل</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-10 h-12">حفظ البيانات</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editingEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تعديل بيانات الموظف</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الاسم بالكامل</label>
                <Input className="rounded-xl h-11" value={editingEmployee.name} onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الوظيفة / المسمى الوظيفي</label>
                  <Input className="rounded-xl h-11" value={editingEmployee.position} onChange={e => setEditingEmployee({...editingEmployee, position: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">القسم</label>
                  <Input className="rounded-xl h-11" value={editingEmployee.department || ''} onChange={e => setEditingEmployee({...editingEmployee, department: e.target.value})} placeholder="مثال: الإنتاج، المخازن..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اليومية</label>
                  <Input type="number" className="rounded-xl h-11" value={editingEmployee.dailyRate} onChange={e => setEditingEmployee({...editingEmployee, dailyRate: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">تاريخ التعيين</label>
                  <Input type="date" className="rounded-xl h-11" value={editingEmployee.hireDate} onChange={e => setEditingEmployee({...editingEmployee, hireDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">موعد الحضور</label>
                  <Input type="time" className="rounded-xl h-11" value={editingEmployee.shiftStart || '08:00'} onChange={e => setEditingEmployee({...editingEmployee, shiftStart: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">موعد الانصراف</label>
                  <Input type="time" className="rounded-xl h-11" value={editingEmployee.shiftEnd || '18:00'} onChange={e => setEditingEmployee({...editingEmployee, shiftEnd: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الحالة</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={editingEmployee.status} onChange={e => setEditingEmployee({...editingEmployee, status: e.target.value as any})}>
                  <option value="نشط">نشط</option>
                  <option value="موقوف">موقوف</option>
                  <option value="مستقيل">مستقيل</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="btn-ghost" onClick={() => setEditingEmployee(null)}>إلغاء</Button>
                <Button onClick={handleUpdate} className="btn-primary px-10 h-12">حفظ التعديلات</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="dribbble-card w-full max-w-sm">
            <CardHeader>
              <CardTitle className="font-black text-xl text-red-600 text-right">تأكيد الحذف</CardTitle>
              <CardDescription className="font-bold text-slate-600 text-right">هل أنت متأكد من حذف هذا الموظف نهائياً؟ سيؤدي ذلك لحذف كافة بياناته المرتبطة.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="ghost" className="btn-ghost" onClick={() => setDeletingId(null)}>إلغاء</Button>
              <Button onClick={handleDelete} className="btn-danger px-8 h-12">حذف نهائي</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

function AttendanceView({ employees, attendance }: { employees: Employee[], attendance: Attendance[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('الكل');
  const [formData, setFormData] = useState({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '08:00',
    checkOut: '18:00',
    status: 'حضور' as const
  });

  const handleAdd = async () => {
    if (!formData.employeeId || !formData.date) return;
    try {
      // Auto-determine status if "حضور" or "تأخير" is selected based on 8:15 grace period
      let finalStatus = formData.status;
      if (formData.status === 'حضور' || formData.status === 'تأخير') {
        const [hours, minutes] = formData.checkIn.split(':').map(Number);
        const checkInTime = hours * 60 + minutes;
        const officialTime = 8 * 60; // 08:00
        const gracePeriod = 15;
        
        if (checkInTime > officialTime + gracePeriod) {
          finalStatus = 'تأخير';
        } else {
          finalStatus = 'حضور';
        }
      }

      await addDoc(collection(db, 'attendance'), {
        ...formData,
        status: finalStatus
      });
      setShowAdd(false);
      setFormData({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        checkIn: '08:00',
        checkOut: '18:00',
        status: 'حضور'
      });
    } catch (err) { handleFirestoreError(err, 'write', 'attendance'); }
  };

  const handleUpdate = async () => {
    if (!editingAttendance) return;
    try {
      let finalStatus = editingAttendance.status;
      if (editingAttendance.status === 'حضور' || editingAttendance.status === 'تأخير') {
        const [hours, minutes] = editingAttendance.checkIn.split(':').map(Number);
        const checkInTime = hours * 60 + minutes;
        const officialTime = 8 * 60;
        const gracePeriod = 15;
        finalStatus = checkInTime > officialTime + gracePeriod ? 'تأخير' : 'حضور';
      }
      const { id, ...data } = editingAttendance;
      await updateDoc(doc(db, 'attendance', id), { ...data, status: finalStatus });
      setEditingAttendance(null);
    } catch (err) { handleFirestoreError(err, 'update', 'attendance'); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, 'attendance', deletingId));
      setDeletingId(null);
    } catch (err) { handleFirestoreError(err, 'delete', 'attendance'); }
  };

  const departments = ['الكل', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[]];

  const filteredAttendance = selectedDept === 'الكل'
    ? attendance
    : attendance.filter(att => {
        const emp = employees.find(e => e.id === att.employeeId);
        return emp?.department === selectedDept;
      });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">الحضور والانصراف</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">المواعيد الرسمية: 08:00 ص - 06:00 م (فترة سماح 15 دقيقة)</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="h-10 md:h-12 rounded-2xl border border-slate-200 px-4 bg-white font-bold text-sm"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8">
            <Plus size={18} className="ml-2" />
            تسجيل حضور جديد
          </Button>
        </div>
      </div>

      <Card className="dribbble-card overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-right font-black text-slate-900 py-5">التاريخ</TableHead>
              <TableHead className="text-right font-black text-slate-900">الموظف</TableHead>
              <TableHead className="text-right font-black text-slate-900">الحضور</TableHead>
              <TableHead className="text-right font-black text-slate-900">الانصراف</TableHead>
              <TableHead className="text-right font-black text-slate-900">الخصم</TableHead>
              <TableHead className="text-right font-black text-slate-900">الحالة</TableHead>
              <TableHead className="text-right font-black text-slate-900">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(att => (
              <TableRow key={att.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-500">{att.date}</TableCell>
                <TableCell className="font-black text-slate-900">{employees.find(e => e.id === att.employeeId)?.name}</TableCell>
                <TableCell className="font-bold text-slate-600">{att.checkIn || '-'}</TableCell>
                <TableCell className="font-bold text-slate-600">{att.checkOut || '-'}</TableCell>
                <TableCell className="font-black text-red-600">
                  {(() => {
                    if (att.status === 'غياب' || att.status === 'إجازة') return '-';
                    if (!att.checkIn || !att.checkOut) return '0.00 ج.م';
                    const emp = employees.find(e => e.id === att.employeeId);
                    if (!emp) return '-';
                    
                    const [inH, inM] = att.checkIn.split(':').map(Number);
                    const [outH, outM] = att.checkOut.split(':').map(Number);
                    const checkInMins = inH * 60 + inM;
                    const checkOutMins = outH * 60 + outM;
                    const officialStart = 8 * 60;
                    const officialEnd = 18 * 60;
                    const gracePeriod = 15;
                    
                    if (checkInMins <= officialStart + gracePeriod && att.checkOut === '12:00') return 'نصف يوم';
                    
                    let lateMins = 0;
                    if (checkInMins > officialStart + gracePeriod) lateMins = checkInMins - officialStart;
                    const earlyMins = Math.max(0, officialEnd - checkOutMins);
                    
                    const missedMins = lateMins + earlyMins;
                    if (missedMins === 0) return '0.00 ج.م';
                    
                    const deduction = missedMins * (emp.dailyRate / 600);
                    return `-${deduction.toFixed(2)} ج.م`;
                  })()}
                </TableCell>
                <TableCell>
                  <Badge className={`rounded-lg px-3 py-1 border-none font-black text-[10px] uppercase tracking-widest ${
                    att.status === 'حضور' ? 'bg-green-100 text-green-700' : 
                    att.status === 'غياب' ? 'bg-red-100 text-red-700' :
                    att.status === 'تأخير' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {att.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setEditingAttendance(att)} variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 rounded-xl">
                      <Edit2 size={16} />
                    </Button>
                    <Button onClick={() => setDeletingId(att.id)} variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 rounded-xl">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تسجيل حضور</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الموظف</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                  <option value="">اختر موظف...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <Input type="date" className="rounded-xl h-11" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">وقت الحضور</label>
                  <Input type="time" className="rounded-xl h-11" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">وقت الانصراف</label>
                  <Input type="time" className="rounded-xl h-11" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الحالة</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option value="حضور">حضور</option>
                  <option value="غياب">غياب</option>
                  <option value="تأخير">تأخير</option>
                  <option value="إجازة">إجازة</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-10 h-12">حفظ السجل</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editingAttendance && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تعديل سجل حضور</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الموظف</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={editingAttendance.employeeId} onChange={e => setEditingAttendance({...editingAttendance, employeeId: e.target.value})}>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <Input type="date" className="rounded-xl h-11" value={editingAttendance.date} onChange={e => setEditingAttendance({...editingAttendance, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">وقت الحضور</label>
                  <Input type="time" className="rounded-xl h-11" value={editingAttendance.checkIn} onChange={e => setEditingAttendance({...editingAttendance, checkIn: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">وقت الانصراف</label>
                  <Input type="time" className="rounded-xl h-11" value={editingAttendance.checkOut} onChange={e => setEditingAttendance({...editingAttendance, checkOut: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الحالة</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={editingAttendance.status} onChange={e => setEditingAttendance({...editingAttendance, status: e.target.value as any})}>
                  <option value="حضور">حضور</option>
                  <option value="غياب">غياب</option>
                  <option value="تأخير">تأخير</option>
                  <option value="إجازة">إجازة</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="btn-ghost" onClick={() => setEditingAttendance(null)}>إلغاء</Button>
                <Button onClick={handleUpdate} className="btn-primary px-10 h-12">حفظ التعديلات</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="dribbble-card w-full max-w-sm">
            <CardHeader>
              <CardTitle className="font-black text-xl text-red-600">تأكيد الحذف</CardTitle>
              <CardDescription className="font-bold">هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setDeletingId(null)}>إلغاء</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 font-black">حذف نهائي</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

function LoansView({ employees, loans, payrolls, hrTransactions }: { employees: Employee[], loans: Loan[], payrolls: Payroll[], hrTransactions: FinancialTransaction[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('الكل');
  const [formData, setFormData] = useState({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    installments: 0,
    paidAlready: 0,
    notes: '',
    status: 'نشط' as const
  });

  const handleAdd = async () => {
    if (!formData.employeeId || formData.amount <= 0) return;
    try {
      const remainingAmount = formData.amount - formData.paidAlready;
      await addDoc(collection(db, 'loans'), {
        ...formData,
        remainingAmount: remainingAmount > 0 ? remainingAmount : 0,
        status: remainingAmount <= 0 ? 'مسدد' : 'نشط'
      });
      setShowAdd(false);
      setFormData({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: 0,
        installments: 0,
        paidAlready: 0,
        notes: '',
        status: 'نشط'
      });
    } catch (err) { handleFirestoreError(err, 'write', 'loans'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'loans', id));
      setShowDeleteConfirm(null);
    } catch (err) { handleFirestoreError(err, 'delete', 'loans'); }
  };

  const handleUpdate = async () => {
    if (!editingLoan) return;
    try {
      const remainingAmount = editingLoan.amount - (editingLoan.paidAlready || 0);
      const { id, ...data } = editingLoan;
      await updateDoc(doc(db, 'loans', id), {
        ...data,
        remainingAmount: remainingAmount > 0 ? remainingAmount : 0,
        status: remainingAmount <= 0 ? 'مسدد' : 'نشط'
      });
      setEditingLoan(null);
    } catch (err) { handleFirestoreError(err, 'update', 'loans'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">إدارة السلف</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">متابعة سلف الموظفين والأرصدة المتبقية</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="h-10 md:h-12 rounded-2xl border border-slate-200 px-4 bg-white font-bold text-sm"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {['الكل', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[]].map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select 
            className="h-10 md:h-12 rounded-2xl border border-slate-200 px-4 bg-white font-bold text-sm"
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            value={selectedEmployeeId || ''}
          >
            <option value="">كشف حساب موظف...</option>
            {employees
              .filter(e => (selectedDept === 'الكل' || e.department === selectedDept) && loans.some(l => l.employeeId === e.id))
              .map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))
            }
          </select>
          <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8">
            <Plus size={18} className="ml-2" />
            تسجيل سلفة جديدة
          </Button>
        </div>
      </div>

      <Card className="dribbble-card overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-right font-black text-slate-900 py-5">التاريخ</TableHead>
              <TableHead className="text-right font-black text-slate-900">الموظف</TableHead>
              <TableHead className="text-right font-black text-slate-900">البيان</TableHead>
              <TableHead className="text-right font-black text-slate-900">المبلغ</TableHead>
              <TableHead className="text-right font-black text-slate-900">المتبقي</TableHead>
              <TableHead className="text-right font-black text-slate-900">الحالة</TableHead>
              <TableHead className="text-right font-black text-slate-900">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans
              .filter(l => {
                if (selectedDept === 'الكل') return true;
                const emp = employees.find(e => e.id === l.employeeId);
                return emp?.department === selectedDept;
              })
              .map(loan => (
              <TableRow key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-500">{loan.date}</TableCell>
                <TableCell className="font-black text-slate-900">{employees.find(e => e.id === loan.employeeId)?.name}</TableCell>
                <TableCell className="text-sm text-slate-600 font-medium">{loan.notes || '-'}</TableCell>
                <TableCell className="font-black text-slate-900">{loan.amount.toLocaleString()} ج.م</TableCell>
                <TableCell className="font-black text-red-600">{loan.remainingAmount.toLocaleString()} ج.م</TableCell>
                <TableCell>
                  <Badge className={`rounded-lg px-3 py-1 border-none font-black text-[10px] uppercase tracking-widest ${
                    loan.status === 'نشط' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {loan.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 rounded-lg font-bold text-primary hover:bg-blue-50"
                      onClick={() => setSelectedEmployeeId(loan.employeeId)}
                    >
                      <FileText size={14} className="ml-1" />
                      كشف حساب
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50"
                      onClick={() => setEditingLoan(loan)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => setShowDeleteConfirm(loan.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تسجيل سلفة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الموظف</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                  <option value="">اختر موظف...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <Input type="date" className="rounded-xl h-11" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المبلغ</label>
                <Input type="number" className="rounded-xl h-11" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">التقسيط (أسبوع)</label>
                  <Input type="number" className="rounded-xl h-11" value={formData.installments} onChange={e => setFormData({...formData, installments: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المسدد بالفعل</label>
                  <Input type="number" className="rounded-xl h-11" value={formData.paidAlready} onChange={e => setFormData({...formData, paidAlready: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">البيان / ملاحظات</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['رصيد أول مدة', 'سلفة أسبوعية', 'رصيد أول مدة (مديونية سابقة)'].map(note => (
                    <button
                      key={note}
                      onClick={() => setFormData({...formData, notes: note})}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                        formData.notes === note ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
                <Input className="rounded-xl h-11" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="أدخل البيان أو اختر من المقترحات..." />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-10 h-12">حفظ السلفة</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedEmployeeId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="font-black text-2xl">كشف حساب سلف</CardTitle>
                  <CardDescription className="font-bold text-slate-600">
                    الموظف: {employees.find(e => e.id === selectedEmployeeId)?.name}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedEmployeeId(null)} className="rounded-xl">
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-auto flex-1">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">إجمالي السلف والمصروفات</p>
                    <p className="text-2xl font-black text-blue-900">
                      {(
                        loans.filter(l => l.employeeId === selectedEmployeeId).reduce((sum, l) => sum + l.amount, 0) +
                        hrTransactions.filter(t => t.employeeId === selectedEmployeeId && t.type === 'مصروف').reduce((sum, t) => sum + t.amount, 0)
                      ).toLocaleString()} ج.م
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">إجمالي المسدد</p>
                    <p className="text-2xl font-black text-green-900">
                      {(() => {
                        const loanPaid = loans.filter(l => l.employeeId === selectedEmployeeId).reduce((sum, l) => sum + (l.amount - l.remainingAmount), 0);
                        const expensePaid = payrolls.filter(p => p.employeeId === selectedEmployeeId && p.status === 'مدفوع').reduce((sum, p) => {
                          const expensesInPeriod = hrTransactions.filter(t => 
                            t.employeeId === selectedEmployeeId && 
                            t.type === 'مصروف' && 
                            t.date >= p.startDate && 
                            t.date <= p.endDate
                          );
                          return sum + expensesInPeriod.reduce((s, t) => s + t.amount, 0);
                        }, 0);
                        return (loanPaid + expensePaid).toLocaleString();
                      })()} ج.م
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">الرصيد المتبقي</p>
                    <p className="text-2xl font-black text-red-900">
                      {(() => {
                        const loanRemaining = loans.filter(l => l.employeeId === selectedEmployeeId).reduce((sum, l) => sum + l.remainingAmount, 0);
                        const totalExpenses = hrTransactions.filter(t => t.employeeId === selectedEmployeeId && t.type === 'مصروف').reduce((sum, t) => sum + t.amount, 0);
                        const settledExpenses = payrolls.filter(p => p.employeeId === selectedEmployeeId && p.status === 'مدفوع').reduce((sum, p) => {
                          const expensesInPeriod = hrTransactions.filter(t => 
                            t.employeeId === selectedEmployeeId && 
                            t.type === 'مصروف' && 
                            t.date >= p.startDate && 
                            t.date <= p.endDate
                          );
                          return sum + expensesInPeriod.reduce((s, t) => s + t.amount, 0);
                        }, 0);
                        return (loanRemaining + (totalExpenses - settledExpenses)).toLocaleString();
                      })()} ج.م
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 flex items-center gap-2">
                    <History size={18} className="text-primary" />
                    سجل الحركات
                  </h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-right font-bold text-slate-700">التاريخ</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">البيان</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">مدين (+)</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">دائن (-)</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">الرصيد</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const history: any[] = [];
                          
                          // Add Loans
                          loans.filter(l => l.employeeId === selectedEmployeeId).forEach(l => {
                            history.push({
                              date: l.date,
                              description: l.notes || 'سلفة جديدة',
                              debit: l.amount,
                              credit: 0,
                              type: 'loan'
                            });
                            if (l.paidAlready && l.paidAlready > 0) {
                              history.push({
                                date: l.date,
                                description: 'مسدد عند الاستلام',
                                debit: 0,
                                credit: l.paidAlready,
                                type: 'payment'
                              });
                            }
                          });

                          // Add Payroll Deductions
                          payrolls.filter(p => p.employeeId === selectedEmployeeId && p.status === 'مدفوع' && p.totalLoans > 0).forEach(p => {
                            history.push({
                              date: p.paymentDate || p.endDate,
                              description: `خصم من راتب أسبوع ${p.weekNumber}`,
                              debit: 0,
                              credit: p.totalLoans,
                              type: 'payroll'
                            });
                          });

                          // Add Weekly Expenses (Advances)
                          hrTransactions.filter(t => t.employeeId === selectedEmployeeId && t.type === 'مصروف').forEach(t => {
                            history.push({
                              date: t.date,
                              description: t.description || 'مصروف أسبوعي',
                              debit: t.amount,
                              credit: 0,
                              type: 'expense'
                            });
                          });

                          // Add Payroll Deductions for Expenses (if we want to show them separately, but they are usually in totalDeductions)
                          // Actually, the user said "يرحل في كشوف الرواتب", so it's already in the payroll.
                          // If we show the expense as debit, we need a corresponding credit.
                          // In PayrollView, I added 'مصروف' to manualDeductions.
                          // So we should add a history item for the payroll deduction of 'مصروف'.
                          payrolls.filter(p => p.employeeId === selectedEmployeeId && p.status === 'مدفوع').forEach(p => {
                            // Find if this payroll period covers any 'مصروف'
                            const expensesInPeriod = hrTransactions.filter(t => 
                              t.employeeId === selectedEmployeeId && 
                              t.type === 'مصروف' && 
                              t.date >= p.startDate && 
                              t.date <= p.endDate
                            );
                            const totalExp = expensesInPeriod.reduce((sum, t) => sum + t.amount, 0);
                            if (totalExp > 0) {
                              history.push({
                                date: p.paymentDate || p.endDate,
                                description: `تسوية مصروف أسبوع ${p.weekNumber}`,
                                debit: 0,
                                credit: totalExp,
                                type: 'expense_settlement'
                              });
                            }
                          });

                          // Sort by date
                          history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                          let runningBalance = 0;
                          return history.map((item, idx) => {
                            runningBalance += (item.debit - item.credit);
                            return (
                              <TableRow key={idx} className="hover:bg-slate-50/50">
                                <TableCell className="text-xs font-bold text-slate-500">{item.date}</TableCell>
                                <TableCell className="text-xs font-black text-slate-900">{item.description}</TableCell>
                                <TableCell className="text-xs font-black text-blue-600">{item.debit > 0 ? `+${item.debit.toLocaleString()}` : '-'}</TableCell>
                                <TableCell className="text-xs font-black text-red-600">{item.credit > 0 ? `-${item.credit.toLocaleString()}` : '-'}</TableCell>
                                <TableCell className="text-xs font-black text-slate-900">{runningBalance.toLocaleString()} ج.م</TableCell>
                              </TableRow>
                            );
                          });
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 bg-slate-50/50 p-4 flex justify-between print:hidden">
              <Button variant="outline" className="rounded-xl font-bold" onClick={() => window.print()}>
                <Printer size={16} className="ml-2" />
                طباعة كشف الحساب
              </Button>
              <Button onClick={() => setSelectedEmployeeId(null)} className="btn-primary px-8 font-black">إغلاق</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {editingLoan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تعديل سلفة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الموظف</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={editingLoan.employeeId} onChange={e => setEditingLoan({...editingLoan, employeeId: e.target.value})}>
                  <option value="">اختر موظف...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <Input type="date" className="rounded-xl h-11" value={editingLoan.date} onChange={e => setEditingLoan({...editingLoan, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المبلغ</label>
                <Input type="number" className="rounded-xl h-11" value={editingLoan.amount} onChange={e => setEditingLoan({...editingLoan, amount: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">التقسيط (أسبوع)</label>
                  <Input type="number" className="rounded-xl h-11" value={editingLoan.installments || 0} onChange={e => setEditingLoan({...editingLoan, installments: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المسدد بالفعل</label>
                  <Input type="number" className="rounded-xl h-11" value={editingLoan.paidAlready || 0} onChange={e => setEditingLoan({...editingLoan, paidAlready: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">البيان / ملاحظات</label>
                <Input className="rounded-xl h-11" value={editingLoan.notes || ''} onChange={e => setEditingLoan({...editingLoan, notes: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="btn-ghost" onClick={() => setEditingLoan(null)}>إلغاء</Button>
                <Button onClick={handleUpdate} className="btn-primary px-10 h-12">تحديث السلفة</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!showDeleteConfirm}
        title="حذف السلفة"
        message="هل أنت متأكد من حذف هذه السلفة؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </div>
  );
}

function HRTransactionsView({ employees, transactions }: { employees: Employee[], transactions: FinancialTransaction[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('الكل');
  const [formData, setFormData] = useState({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'مكافأة' as const,
    amount: 0,
    description: '',
    overtimeHours: 0,
    overtimeRate: 1.5 as 1.33 | 1.5 | 2
  });

  const handleAdd = async () => {
    if (!formData.employeeId) return;
    
    let finalData = { ...formData };
    
    // If it's overtime, calculate the amount automatically
    if (formData.type === 'إضافي') {
      const emp = employees.find(e => e.id === formData.employeeId);
      if (emp && formData.overtimeHours > 0) {
        const hourlyRate = emp.dailyRate / 10;
        finalData.amount = formData.overtimeHours * formData.overtimeRate * hourlyRate;
        if (!finalData.description) {
          finalData.description = `إضافي ${formData.overtimeHours} ساعة بمعدل ${formData.overtimeRate}`;
        }
      }
    }

    if (finalData.amount <= 0 && finalData.type !== 'إضافي') return;

    try {
      await addDoc(collection(db, 'hrTransactions'), finalData);
      setShowAdd(false);
      setFormData({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'مكافأة',
        amount: 0,
        description: '',
        overtimeHours: 0,
        overtimeRate: 1.5
      });
    } catch (err) { handleFirestoreError(err, 'write', 'hrTransactions'); }
  };

  const handleUpdate = async () => {
    if (!editingTransaction) return;
    
    let finalData = { ...editingTransaction };
    
    if (finalData.type === 'إضافي') {
      const emp = employees.find(e => e.id === finalData.employeeId);
      if (emp && finalData.overtimeHours && finalData.overtimeHours > 0) {
        const hourlyRate = emp.dailyRate / 10;
        finalData.amount = finalData.overtimeHours * (finalData.overtimeRate || 1.5) * hourlyRate;
      }
    }

    if (finalData.amount <= 0 && finalData.type !== 'إضافي') return;

    try {
      const { id, ...data } = finalData;
      await updateDoc(doc(db, 'hrTransactions', id), data);
      setEditingTransaction(null);
    } catch (err) { handleFirestoreError(err, 'update', 'hrTransactions'); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, 'hrTransactions', deletingId));
      setDeletingId(null);
    } catch (err) { handleFirestoreError(err, 'delete', 'hrTransactions'); }
  };

  const departments = ['الكل', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[]];

  const filteredTransactions = selectedDept === 'الكل'
    ? transactions
    : transactions.filter(tr => {
        const emp = employees.find(e => e.id === tr.employeeId);
        return emp?.department === selectedDept;
      });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">الحركات المالية</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">تسجيل المكافآت والخصومات والبدلات والوقت الإضافي</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="h-10 md:h-12 rounded-2xl border border-slate-200 px-4 bg-white font-bold text-sm"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <Button onClick={() => setShowAdd(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8">
            <Plus size={18} className="ml-2" />
            إضافة حركة جديدة
          </Button>
        </div>
      </div>

      <Card className="dribbble-card overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-right font-black text-slate-900 py-5">التاريخ</TableHead>
              <TableHead className="text-right font-black text-slate-900">الموظف</TableHead>
              <TableHead className="text-right font-black text-slate-900">النوع</TableHead>
              <TableHead className="text-right font-black text-slate-900">المبلغ</TableHead>
              <TableHead className="text-right font-black text-slate-900">الوصف</TableHead>
              <TableHead className="text-right font-black text-slate-900">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tr => (
              <TableRow key={tr.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-500">{tr.date}</TableCell>
                <TableCell className="font-black text-slate-900">{employees.find(e => e.id === tr.employeeId)?.name}</TableCell>
                <TableCell>
                  <Badge className={`rounded-lg px-3 py-1 border-none font-black text-[10px] uppercase tracking-widest ${
                    tr.type === 'مكافأة' ? 'bg-green-100 text-green-700' : 
                    tr.type === 'خصم' ? 'bg-red-100 text-red-700' :
                    tr.type === 'إضافي' ? 'bg-blue-100 text-blue-700' :
                    tr.type === 'مصروف' ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {tr.type}
                  </Badge>
                </TableCell>
                <TableCell className={`font-black ${tr.type === 'خصم' || tr.type === 'مصروف' ? 'text-red-600' : 'text-green-600'}`}>
                  {tr.type === 'خصم' || tr.type === 'مصروف' ? '-' : '+'}{tr.amount.toLocaleString()} ج.م
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {tr.description}
                  {tr.type === 'إضافي' && tr.overtimeHours && (
                    <span className="mr-2 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                      {tr.overtimeHours} س × {tr.overtimeRate}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setEditingTransaction(tr)} variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 rounded-xl">
                      <Edit2 size={16} />
                    </Button>
                    <Button onClick={() => setDeletingId(tr.id)} variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 rounded-xl">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">إضافة حركة مالية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الموظف</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                  <option value="">اختر موظف...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <Input type="date" className="rounded-xl h-11" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">النوع</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                  <option value="مكافأة">مكافأة</option>
                  <option value="خصم">خصم</option>
                  <option value="مصروف">مصروف (سلفة أسبوعية)</option>
                  <option value="بدل">بدل</option>
                  <option value="إضافي">وقت إضافي</option>
                </select>
              </div>

              {formData.type === 'إضافي' ? (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="font-black text-sm text-slate-900">تفاصيل الإضافي</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">عدد الساعات</label>
                      <Input type="number" step="any" className="rounded-xl h-11" value={formData.overtimeHours} onChange={e => setFormData({...formData, overtimeHours: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">المعدل</label>
                      <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={formData.overtimeRate} onChange={e => setFormData({...formData, overtimeRate: Number(e.target.value) as any})}>
                        <option value={1.33}>ساعة وثلث (1.33)</option>
                        <option value={1.5}>ساعة ونصف (1.5)</option>
                        <option value={2}>ساعتين (2.0)</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400">سيتم احتساب المبلغ تلقائياً بناءً على يومية الموظف (اليومية ÷ 10 ساعات)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المبلغ</label>
                  <Input type="number" step="any" className="rounded-xl h-11" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الوصف</label>
                <Input className="rounded-xl h-11" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="سبب الحركة..." />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button onClick={handleAdd} className="btn-primary px-10 h-12">حفظ الحركة</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editingTransaction && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تعديل حركة مالية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الموظف</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={editingTransaction.employeeId} onChange={e => setEditingTransaction({...editingTransaction, employeeId: e.target.value})}>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <Input type="date" className="rounded-xl h-11" value={editingTransaction.date} onChange={e => setEditingTransaction({...editingTransaction, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">النوع</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={editingTransaction.type} onChange={e => setEditingTransaction({...editingTransaction, type: e.target.value as any})}>
                  <option value="مكافأة">مكافأة</option>
                  <option value="خصم">خصم</option>
                  <option value="بدل">بدل</option>
                  <option value="إضافي">وقت إضافي</option>
                </select>
              </div>

              {editingTransaction.type === 'إضافي' ? (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="font-black text-sm text-slate-900">تفاصيل الإضافي</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">عدد الساعات</label>
                      <Input type="number" step="any" className="rounded-xl h-11" value={editingTransaction.overtimeHours || 0} onChange={e => setEditingTransaction({...editingTransaction, overtimeHours: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">المعدل</label>
                      <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={editingTransaction.overtimeRate || 1.5} onChange={e => setEditingTransaction({...editingTransaction, overtimeRate: Number(e.target.value) as any})}>
                        <option value={1.33}>ساعة وثلث (1.33)</option>
                        <option value={1.5}>ساعة ونصف (1.5)</option>
                        <option value={2}>ساعتين (2.0)</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400">سيتم احتساب المبلغ تلقائياً بناءً على يومية الموظف (اليومية ÷ 10 ساعات)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المبلغ</label>
                  <Input type="number" step="any" className="rounded-xl h-11" value={editingTransaction.amount} onChange={e => setEditingTransaction({...editingTransaction, amount: Number(e.target.value)})} />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الوصف</label>
                <Input className="rounded-xl h-11" value={editingTransaction.description} onChange={e => setEditingTransaction({...editingTransaction, description: e.target.value})} placeholder="سبب الحركة..." />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="btn-ghost" onClick={() => setEditingTransaction(null)}>إلغاء</Button>
                <Button onClick={handleUpdate} className="btn-primary px-10 h-12">حفظ التعديلات</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="dribbble-card w-full max-w-sm">
            <CardHeader>
              <CardTitle className="font-black text-xl text-red-600">تأكيد الحذف</CardTitle>
              <CardDescription className="font-bold">هل أنت متأكد من حذف هذه الحركة؟ لا يمكن التراجع عن هذا الإجراء.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setDeletingId(null)}>إلغاء</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 font-black">حذف نهائي</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

function PayrollView({ employees, attendance, transactions, loans, payrolls }: { employees: Employee[], attendance: Attendance[], transactions: FinancialTransaction[], loans: Loan[], payrolls: Payroll[] }) {
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>('الكل');
  const [genData, setGenData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    weekNumber: 1,
    year: new Date().getFullYear()
  });

  const handleGenerate = async () => {
    try {
      for (const emp of employees) {
        if (emp.status !== 'نشط') continue;
        
        // Calculate days worked and time-based deductions
        const empAttendance = attendance.filter(a => {
          if (a.employeeId !== emp.id || (a.status !== 'حضور' && a.status !== 'تأخير')) return false;
          return a.date >= genData.startDate && a.date <= genData.endDate;
        });

        const attendanceStats = empAttendance.reduce((acc, a) => {
          if (!a.checkIn || !a.checkOut) {
            acc.daysWorked += 1;
            return acc;
          }

          const [inH, inM] = a.checkIn.split(':').map(Number);
          const [outH, outM] = a.checkOut.split(':').map(Number);
          
          const checkInMins = inH * 60 + inM;
          const checkOutMins = outH * 60 + outM;
          
          // Parse dynamic shift times or fallback to 08:00 - 18:00
          const shiftStartStr = emp.shiftStart || '08:00';
          const shiftEndStr = emp.shiftEnd || '18:00';
          
          const [sH, sM] = shiftStartStr.split(':').map(Number);
          const [eH, eM] = shiftEndStr.split(':').map(Number);
          
          const officialStart = sH * 60 + sM;
          const officialEnd = eH * 60 + eM;
          const shiftDurationMins = officialEnd - officialStart;
          const gracePeriod = 15;
          
          // Special Rule: 12:00 PM half day if arrived on time (only if shift starts in morning)
          if (checkInMins <= officialStart + gracePeriod && a.checkOut === '12:00' && officialStart <= 12 * 60) {
            acc.daysWorked += 0.5;
            return acc;
          }
          
          // Late deduction: only if after grace period
          let lateMins = 0;
          if (checkInMins > officialStart + gracePeriod) {
            lateMins = checkInMins - officialStart;
          }
          
          // Early departure deduction
          const earlyMins = Math.max(0, officialEnd - checkOutMins);
          
          acc.daysWorked += 1;
          acc.timeDeduction += (lateMins + earlyMins) * (emp.dailyRate / (shiftDurationMins > 0 ? shiftDurationMins : 600));
          
          return acc;
        }, { daysWorked: 0, timeDeduction: 0 });

        const daysWorked = attendanceStats.daysWorked;
        const timeDeduction = attendanceStats.timeDeduction;

        // Calculate total overtime from transactions in the selected period
        const empTransactions = transactions.filter(t => {
          if (t.employeeId !== emp.id) return false;
          return t.date >= genData.startDate && t.date <= genData.endDate;
        });
        const totalOvertime = empTransactions.filter(t => t.type === 'إضافي').reduce((sum, t) => sum + t.amount, 0);
        
        // Basic logic for payroll calculation
        const totalBonuses = empTransactions.filter(t => t.type === 'مكافأة' || t.type === 'بدل').reduce((sum, t) => sum + t.amount, 0);
        const manualDeductions = empTransactions.filter(t => t.type === 'خصم' || t.type === 'مصروف').reduce((sum, t) => sum + t.amount, 0);
        const totalDeductions = manualDeductions + Math.round(timeDeduction * 100) / 100;
        
        const baseSalary = emp.dailyRate * daysWorked;
        const earningsBeforeLoans = baseSalary + totalBonuses + totalOvertime - totalDeductions;
        const availableForLoans = Math.max(0, earningsBeforeLoans);

        // Calculate loan deduction based on installments, capped by available earnings
        const empLoans = loans.filter(l => l.employeeId === emp.id && l.status === 'نشط');
        let calculatedLoans = empLoans.reduce((sum, l) => {
          let weeklyInstallment = 0;
          if (l.installments && l.installments > 0) {
            weeklyInstallment = l.amount / l.installments;
          } else {
            weeklyInstallment = (emp.dailyRate * daysWorked) * 0.1; // Fallback
          }
          return sum + Math.min(l.remainingAmount, weeklyInstallment);
        }, 0);

        // Prevent negative salary by capping loan deductions
        const totalLoans = Math.min(calculatedLoans, availableForLoans);
        
        // Final net salary (capped at 0 if deductions exceed earnings)
        const netSalary = Math.max(0, earningsBeforeLoans - totalLoans);

        await addDoc(collection(db, 'payrolls'), {
          employeeId: emp.id,
          weekNumber: genData.weekNumber,
          year: genData.year,
          startDate: genData.startDate,
          endDate: genData.endDate,
          dailyRate: emp.dailyRate,
          daysWorked,
          baseSalary,
          totalBonuses,
          totalOvertime,
          totalDeductions,
          totalLoans,
          netSalary,
          status: 'مسودة'
        });
      }
      setShowGenerate(false);
    } catch (err) { handleFirestoreError(err, 'write', 'payrolls'); }
  };

  const updateLoanBalances = async (payroll: Payroll) => {
    if (payroll.totalLoans <= 0) return;
    
    const empLoans = loans.filter(l => l.employeeId === payroll.employeeId && l.status === 'نشط');
    let remainingDeduction = payroll.totalLoans;
    
    for (const loan of empLoans) {
      if (remainingDeduction <= 0) break;
      const deduction = Math.min(loan.remainingAmount, remainingDeduction);
      const newRemaining = loan.remainingAmount - deduction;
      const newPaidAlready = (loan.paidAlready || 0) + deduction;
      await updateDoc(doc(db, 'loans', loan.id), {
        remainingAmount: newRemaining,
        paidAlready: newPaidAlready,
        status: newRemaining <= 0 ? 'مسدد' : 'نشط'
      });
      remainingDeduction -= deduction;
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const payroll = payrolls.find(p => p.id === id);
      if (payroll) await updateLoanBalances(payroll);
      await updateDoc(doc(db, 'payrolls', id), {
        status: 'مدفوع',
        paymentDate: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (err) { handleFirestoreError(err, 'update', 'payrolls'); }
  };

  const draftPayrolls = payrolls.filter(p => p.status === 'مسودة');
  const totalWeekly = draftPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

  const [showVouchers, setShowVouchers] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUpdatePayroll = async () => {
    if (!editingPayroll) return;
    try {
      const { id, ...data } = editingPayroll;
      // Recalculate net salary
      const netSalary = data.baseSalary + data.totalBonuses + data.totalOvertime - data.totalDeductions - data.totalLoans;
      await updateDoc(doc(db, 'payrolls', id), { ...data, netSalary });
      setEditingPayroll(null);
    } catch (err) { handleFirestoreError(err, 'update', 'payrolls'); }
  };

  const handleDeletePayroll = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, 'payrolls', deletingId));
      setDeletingId(null);
    } catch (err) { handleFirestoreError(err, 'delete', 'payrolls'); }
  };

  const handleBulkArchive = async () => {
    try {
      for (const p of draftPayrolls) {
        await updateLoanBalances(p);
        await updateDoc(doc(db, 'payrolls', p.id), {
          status: 'مدفوع',
          paymentDate: format(new Date(), 'yyyy-MM-dd')
        });
      }
    } catch (err) { handleFirestoreError(err, 'update', 'payrolls'); }
  };

  const handlePrint = () => {
    window.print();
  };

  const departments = ['الكل', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[]];

  const filteredDraftPayrolls = selectedDept === 'الكل'
    ? draftPayrolls
    : draftPayrolls.filter(p => {
        const emp = employees.find(e => e.id === p.employeeId);
        return emp?.department === selectedDept;
      });

  const filteredTotalWeekly = filteredDraftPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">كشوف الرواتب</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">إصدار ومراجعة كشوف الرواتب الأسبوعية (باليومية)</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="h-10 md:h-12 rounded-2xl border border-slate-200 px-4 bg-white font-bold text-sm"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <Button onClick={() => setShowVouchers(true)} variant="outline" className="h-10 md:h-12 px-6 rounded-2xl font-bold border-slate-200">
            <Printer size={18} className="ml-2" />
            قسائم الصرف
          </Button>
          <Button onClick={() => setShowGenerate(true)} className="btn-primary h-10 md:h-12 px-6 md:px-8">
            <BarChart3 size={18} className="ml-2" />
            إصدار رواتب أسبوع جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <DollarSign className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">إجمالي رواتب {selectedDept === 'الكل' ? 'الأسبوع' : selectedDept}</p>
            <p className="text-2xl font-black text-slate-900">{filteredTotalWeekly.toLocaleString()} ج.م</p>
          </div>
        </div>
        
        <div className="md:col-span-2 flex items-center justify-end">
          {draftPayrolls.length > 0 && (
            <Button onClick={handleBulkArchive} className="h-14 px-10 rounded-2xl font-black text-lg bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-200">
              <History size={20} className="ml-2" />
              ترحيل وأرشفة الكل
            </Button>
          )}
        </div>
      </div>

      <Card className="dribbble-card overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-right font-black text-slate-900 py-5">الأسبوع</TableHead>
              <TableHead className="text-right font-black text-slate-900">الموظف</TableHead>
              <TableHead className="text-right font-black text-slate-900">اليومية</TableHead>
              <TableHead className="text-right font-black text-slate-900">أيام العمل</TableHead>
              <TableHead className="text-right font-black text-slate-900">إجمالي اليوميات</TableHead>
              <TableHead className="text-right font-black text-slate-900">إضافي</TableHead>
              <TableHead className="text-right font-black text-slate-900">مكافآت</TableHead>
              <TableHead className="text-right font-black text-slate-900">خصومات</TableHead>
              <TableHead className="text-right font-black text-slate-900">سلف</TableHead>
              <TableHead className="text-right font-black text-slate-900">صافي الراتب</TableHead>
              <TableHead className="text-right font-black text-slate-900">الحالة</TableHead>
              <TableHead className="text-right font-black text-slate-900">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDraftPayrolls.slice().sort((a, b) => b.year - a.year || b.weekNumber - a.weekNumber).map(p => (
              <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-500">
                  <div className="flex flex-col">
                    <span>أسبوع {p.weekNumber}</span>
                    <span className="text-[10px] text-slate-400">{p.startDate} - {p.endDate}</span>
                  </div>
                </TableCell>
                <TableCell className="font-black text-slate-900">{employees.find(e => e.id === p.employeeId)?.name}</TableCell>
                <TableCell className="font-bold text-slate-600">{p.dailyRate?.toLocaleString()} ج.م</TableCell>
                <TableCell className="font-black text-blue-600">{(p.daysWorked || 0).toFixed(2)} يوم</TableCell>
                <TableCell className="font-bold text-slate-600">{p.baseSalary.toLocaleString()} ج.م</TableCell>
                <TableCell className="font-bold text-blue-600">+{p.totalOvertime?.toLocaleString() || 0}</TableCell>
                <TableCell className="font-bold text-green-600">+{p.totalBonuses.toLocaleString()}</TableCell>
                <TableCell className="font-bold text-red-600">-{p.totalDeductions.toLocaleString()}</TableCell>
                <TableCell className="font-bold text-orange-600">-{p.totalLoans.toLocaleString()}</TableCell>
                <TableCell className="font-black text-primary text-lg">{p.netSalary.toLocaleString()} ج.م</TableCell>
                <TableCell>
                  <Badge className="rounded-lg px-3 py-1 border-none font-black text-[10px] uppercase tracking-widest bg-slate-100 text-slate-700">
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleArchive(p.id)} variant="outline" size="sm" className="rounded-lg font-bold border-primary text-primary hover:bg-primary hover:text-white">
                      أرشفة وقبض
                    </Button>
                    <Button onClick={() => setEditingPayroll(p)} variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50">
                      <Edit2 size={16} />
                    </Button>
                    <Button onClick={() => setDeletingId(p.id)} variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {showVouchers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-auto">
          <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
              <h3 className="font-black text-2xl text-slate-900">قسائم صرف الرواتب</h3>
              <div className="flex gap-3">
                <div className="hidden md:flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-3 rounded-xl border border-orange-100">
                  <AlertCircle size={12} className="ml-1" />
                  لأفضل نتيجة، افتح التطبيق في نافذة جديدة
                </div>
                <Button onClick={handlePrint} className="btn-primary px-6 font-black">
                  <Printer size={18} className="ml-2" />
                  طباعة الكل
                </Button>
                <Button variant="ghost" onClick={() => setShowVouchers(false)} className="rounded-xl font-bold">إغلاق</Button>
              </div>
            </div>
            <div className="p-8 overflow-auto flex-1 bg-slate-100/30 space-y-8 print:p-0 print:bg-white print:space-y-0 print:overflow-visible print:grid print:grid-cols-2 print:gap-0">
              {draftPayrolls.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-20 text-slate-400">
                  <AlertCircle size={48} className="mb-4 opacity-20" />
                  <p className="font-bold text-xl">لا توجد كشوف رواتب (مسودات) حالياً للطباعة</p>
                  <p className="text-sm">قم بإصدار رواتب أسبوع جديد أولاً</p>
                </div>
              ) : (
                draftPayrolls.map((p, idx) => {
                  const emp = employees.find(e => e.id === p.employeeId);
                  return (
                    <div key={p.id} className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 relative print:border-solid print:border-slate-300 print:rounded-none print:shadow-none print:mb-0 print:p-4 print:h-[16.66vh] print:border-collapse print:overflow-hidden">
                      <div className="flex justify-between items-start mb-2 print:mb-1">
                        <div className="flex items-center gap-2 print:gap-1">
                          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg print:w-6 print:h-6 print:rounded-md">
                            <Package className="text-white" size={20} />
                          </div>
                          <div>
                            <h4 className="font-black text-lg text-slate-900 print:text-[10px] print:leading-tight">مصنع النجار للأثاث</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest print:text-[6px] print:leading-tight">قسيمة صرف راتب أسبوعي</p>
                          </div>
                        </div>
                        <div className="text-left bg-slate-50 p-2 rounded-xl border border-slate-100 print:p-1 print:rounded-md print:bg-transparent print:border-none">
                          <p className="font-black text-slate-900 text-sm print:text-[8px]">#W{p.weekNumber}-{p.id.slice(-4)}</p>
                          <p className="font-bold text-slate-600 text-[10px] print:text-[7px]">أسبوع {p.weekNumber} / {p.year}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 print:gap-2 print:mb-1">
                        <div className="space-y-2 print:space-y-0.5">
                          <div className="flex justify-between border-b border-slate-100 pb-1 print:pb-0">
                            <span className="text-slate-500 font-bold text-xs print:text-[7px]">الاسم:</span>
                            <span className="font-black text-slate-900 text-sm print:text-[8px]">{emp?.name}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-1 print:pb-0">
                            <span className="text-slate-500 font-bold text-xs print:text-[7px]">المهنة:</span>
                            <span className="font-black text-slate-900 text-xs print:text-[7px]">{emp?.position}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-1 print:pb-0">
                            <span className="text-slate-500 font-bold text-xs print:text-[7px]">اليومية:</span>
                            <span className="font-black text-slate-900 text-xs print:text-[7px]">{p.dailyRate.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-1 print:pb-0">
                            <span className="text-slate-500 font-bold text-xs print:text-[7px]">أيام العمل:</span>
                            <span className="font-black text-blue-600 text-xs print:text-[7px]">{(p.daysWorked || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner space-y-1 print:p-1 print:rounded-md print:bg-transparent print:border-none print:shadow-none">
                          <div className="flex justify-between text-[10px] print:text-[6px]">
                            <span className="text-slate-500 font-bold">إجمالي:</span>
                            <span className="font-black text-slate-900">{p.baseSalary.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-green-600 print:text-[6px]">
                            <span className="font-bold">إضافي (+):</span>
                            <span className="font-black">{p.totalOvertime.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-red-600 print:text-[6px]">
                            <span className="font-bold">خصم (-):</span>
                            <span className="font-black">{p.totalDeductions.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-orange-600 print:text-[6px]">
                            <span className="font-bold">سلف (-):</span>
                            <span className="font-black">{p.totalLoans.toLocaleString()}</span>
                          </div>
                          <div className="pt-1 border-t border-slate-300 flex justify-between items-center print:pt-0.5">
                            <span className="font-black text-slate-900 text-xs print:text-[7px]">الصافي:</span>
                            <span className="text-lg font-black text-primary print:text-[10px]">{p.netSalary.toLocaleString()} ج.م</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 print:pt-1 print:gap-1">
                        <div className="text-center">
                          <p className="text-[8px] font-black text-slate-900 print:text-[5px]">توقيع الموظف</p>
                          <div className="border-b border-slate-200 w-full mx-auto h-4 print:h-2"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-black text-slate-900 print:text-[5px]">المحاسب</p>
                          <div className="border-b border-slate-200 w-full mx-auto h-4 print:h-2"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-black text-slate-900 print:text-[5px]">الاعتماد</p>
                          <div className="border-b border-slate-200 w-full mx-auto h-4 print:h-2"></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {editingPayroll && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <Card className="dribbble-card w-full max-w-lg">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تعديل كشف الراتب</CardTitle>
              <CardDescription className="font-bold">يمكنك تعديل القيم يدوياً لهذا الموظف فقط.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">أيام العمل</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.daysWorked} onChange={e => setEditingPayroll({...editingPayroll, daysWorked: Number(e.target.value), baseSalary: Number(e.target.value) * editingPayroll.dailyRate})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">إجمالي اليوميات</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.baseSalary} onChange={e => setEditingPayroll({...editingPayroll, baseSalary: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الوقت الإضافي</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.totalOvertime} onChange={e => setEditingPayroll({...editingPayroll, totalOvertime: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المكافآت</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.totalBonuses} onChange={e => setEditingPayroll({...editingPayroll, totalBonuses: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الخصومات</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.totalDeductions} onChange={e => setEditingPayroll({...editingPayroll, totalDeductions: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">السلف</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.totalLoans} onChange={e => setEditingPayroll({...editingPayroll, totalLoans: Number(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="text-slate-500 font-bold">صافي الراتب المتوقع:</div>
                <div className="text-2xl font-black text-primary">
                  {(editingPayroll.baseSalary + editingPayroll.totalBonuses + editingPayroll.totalOvertime - editingPayroll.totalDeductions - editingPayroll.totalLoans).toLocaleString()} ج.م
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setEditingPayroll(null)}>إلغاء</Button>
                <Button onClick={handleUpdatePayroll} className="btn-primary px-10 h-12 font-black">حفظ التعديلات</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
          <Card className="dribbble-card w-full max-w-sm">
            <CardHeader>
              <CardTitle className="font-black text-xl text-red-600">تأكيد الحذف</CardTitle>
              <CardDescription className="font-bold text-slate-600">هل أنت متأكد من حذف كشف الراتب هذا؟ لا يمكن التراجع عن هذا الإجراء.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setDeletingId(null)}>إلغاء</Button>
              <Button onClick={handleDeletePayroll} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black px-8">حذف نهائي</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {showGenerate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">إصدار رواتب أسبوعية</CardTitle>
              <CardDescription className="font-bold">سيتم احتساب الرواتب لجميع الموظفين النشطين بناءً على الحركات المالية والسلف المسجلة في الفترة المحددة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">من تاريخ</label>
                  <Input type="date" className="rounded-xl h-11" value={genData.startDate} onChange={e => setGenData({...genData, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">إلى تاريخ</label>
                  <Input type="date" className="rounded-xl h-11" value={genData.endDate} onChange={e => setGenData({...genData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رقم الأسبوع</label>
                  <Input type="number" className="rounded-xl h-11" value={genData.weekNumber} onChange={e => setGenData({...genData, weekNumber: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">السنة</label>
                  <select className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white font-bold" value={genData.year} onChange={e => setGenData({...genData, year: Number(e.target.value)})}>
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="btn-ghost" onClick={() => setShowGenerate(false)}>إلغاء</Button>
                <Button onClick={handleGenerate} className="btn-primary px-10 h-12">بدء الإصدار</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ArchiveView({ employees, payrolls }: { employees: Employee[], payrolls: Payroll[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('الكل');
  
  const archivedPayrolls = payrolls.filter(p => p.status === 'مدفوع');
  const totalArchived = archivedPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

  const departments = ['الكل', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[]];
  
  const filtered = archivedPayrolls.filter(p => {
    const emp = employees.find(e => e.id === p.employeeId);
    const matchesSearch = emp?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'الكل' || emp?.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleUpdatePayroll = async () => {
    if (!editingPayroll) return;
    try {
      const { id, ...data } = editingPayroll;
      // Recalculate net salary
      const netSalary = data.baseSalary + data.totalBonuses + data.totalOvertime - data.totalDeductions - data.totalLoans;
      await updateDoc(doc(db, 'payrolls', id), { ...data, netSalary });
      setEditingPayroll(null);
    } catch (err) { handleFirestoreError(err, 'update', 'payrolls'); }
  };

  const handleDeletePayroll = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, 'payrolls', deletingId));
      setDeletingId(null);
    } catch (err) { handleFirestoreError(err, 'delete', 'payrolls'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">الأرشيف</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">مرحباً بك.. إليك ملخص الحالة المالية الحالية.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">إجمالي المصروفات المؤرشفة</p>
            <p className="text-2xl font-black text-slate-900">{totalArchived.toLocaleString()} ج.م</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input 
            className="h-14 pr-12 rounded-2xl border-none shadow-sm bg-white font-bold text-lg" 
            placeholder="ابحث باسم الموظف في الأرشيف..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="h-14 rounded-2xl border-none shadow-sm bg-white font-bold text-lg px-6 min-w-[200px]"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <Card className="dribbble-card overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-right font-black text-slate-900 py-5">الموظف والمهنة</TableHead>
              <TableHead className="text-right font-black text-slate-900">تاريخ الأرشفة</TableHead>
              <TableHead className="text-right font-black text-slate-900">الفترة الأسبوعية</TableHead>
              <TableHead className="text-right font-black text-slate-900">الصافي</TableHead>
              <TableHead className="text-right font-black text-slate-900">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? filtered.map(p => {
              const emp = employees.find(e => e.id === p.employeeId);
              return (
                <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900">{emp?.name}</span>
                      <span className="text-xs font-bold text-slate-400">{emp?.position}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-500">{p.paymentDate || '-'}</TableCell>
                  <TableCell className="font-bold text-slate-600">
                    من {p.startDate} إلى {p.endDate}
                  </TableCell>
                  <TableCell className="font-black text-primary">{p.netSalary.toLocaleString()} ج.م</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => setSelectedPayroll(p)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50">
                        <FileText size={16} />
                      </Button>
                      <Button onClick={() => setEditingPayroll(p)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50">
                        <Edit2 size={16} />
                      </Button>
                      <Button onClick={() => setDeletingId(p.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 font-bold text-slate-400">
                  لا توجد بيانات مؤرشفة حالياً
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {selectedPayroll && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="font-black text-2xl">تفاصيل كشف الراتب</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPayroll(null)} className="rounded-full hover:bg-slate-100">
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xl">
                  {employees.find(e => e.id === selectedPayroll.employeeId)?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">{employees.find(e => e.id === selectedPayroll.employeeId)?.name}</h3>
                  <p className="text-sm font-bold text-slate-500">أسبوع {selectedPayroll.weekNumber} - {selectedPayroll.year}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-600">أيام العمل</span>
                  <span className="font-black text-slate-900">{selectedPayroll.daysWorked.toFixed(2)} يوم</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-600">الراتب الأساسي</span>
                  <span className="font-black text-slate-900">{selectedPayroll.baseSalary.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <span className="font-bold text-green-700">مكافآت وبدلات</span>
                  <span className="font-black text-green-700">+{selectedPayroll.totalBonuses.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="font-bold text-blue-700">وقت إضافي</span>
                  <span className="font-black text-blue-700">+{selectedPayroll.totalOvertime.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="font-bold text-red-700">خصومات (تأخير + يدوي)</span>
                  <span className="font-black text-red-700">-{selectedPayroll.totalDeductions.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                  <span className="font-bold text-orange-700">سداد سلف</span>
                  <span className="font-black text-orange-700">-{selectedPayroll.totalLoans.toLocaleString()} ج.م</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="font-black text-lg text-slate-900">صافي الراتب المستحق</span>
                <span className="font-black text-2xl text-primary">{selectedPayroll.netSalary.toLocaleString()} ج.م</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editingPayroll && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-black text-2xl">تعديل كشف الراتب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">أيام العمل</label>
                  <Input type="number" step="0.25" className="rounded-xl h-11" value={editingPayroll.daysWorked} onChange={e => setEditingPayroll({...editingPayroll, daysWorked: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اليومية</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.dailyRate} onChange={e => setEditingPayroll({...editingPayroll, dailyRate: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المكافآت</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.totalBonuses} onChange={e => setEditingPayroll({...editingPayroll, totalBonuses: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الإضافي</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.totalOvertime} onChange={e => setEditingPayroll({...editingPayroll, totalOvertime: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الخصومات</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.totalDeductions} onChange={e => setEditingPayroll({...editingPayroll, totalDeductions: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">السلف</label>
                  <Input type="number" className="rounded-xl h-11" value={editingPayroll.totalLoans} onChange={e => setEditingPayroll({...editingPayroll, totalLoans: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setEditingPayroll(null)}>إلغاء</Button>
                <Button onClick={handleUpdatePayroll} className="btn-primary px-10 h-12 font-black">حفظ التعديلات</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!deletingId}
        title="حذف من الأرشيف"
        message="هل أنت متأكد من حذف هذا السجل نهائياً من الأرشيف؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDeletePayroll}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

function SettingsView({ items, suppliers, warehouses, units, costCenters }: { items: Item[], suppliers: Supplier[], warehouses: Warehouse[], units: Unit[], costCenters: CostCenter[] }) {
  const [activeSettingTab, setActiveSettingTab] = useState('general');
  const [companyInfo, setCompanyInfo] = useState({
    name: 'شركة المصطفى للتجارة والصناعة',
    address: 'المنطقة الصناعية، القاهرة',
    phone: '01000000000',
    taxId: '123-456-789'
  });

  const [showItemAdd, setShowItemAdd] = useState(false);
  const [showSupplierAdd, setShowSupplierAdd] = useState(false);
  const [showWarehouseAdd, setShowWarehouseAdd] = useState(false);
  const [showUnitAdd, setShowUnitAdd] = useState(false);
  const [showCostCenterAdd, setShowCostCenterAdd] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ collection: string, id: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        for (const row of data) {
          const warehouse = warehouses.find(w => w.name === row['المخزن']);
          if (row['الاسم'] && warehouse) {
            await addDoc(collection(db, 'items'), {
              name: row['الاسم'],
              unit: row['الوحدة'] || 'قطعة',
              price: Number(row['السعر']) || 0,
              warehouseId: warehouse.id,
              openingBalance: Number(row['رصيد أول']) || 0,
              safetyLimit: Number(row['حد الأمان']) || 5,
              inward: 0,
              outward: 0,
              returned: 0,
              currentBalance: Number(row['رصيد أول']) || 0,
              department: row['القسم'] || 'عام'
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const [itemForm, setItemForm] = useState({
    name: '',
    unit: '',
    price: 0,
    department: '',
    warehouseId: '',
    openingBalance: 0,
    safetyLimit: 5
  });

  useEffect(() => {
    if (units.length > 0 && !itemForm.unit) {
      setItemForm(prev => ({ ...prev, unit: units[0].name }));
    }
    if (costCenters.length > 0 && !itemForm.department) {
      setItemForm(prev => ({ ...prev, department: costCenters[0].name }));
    }
  }, [units, costCenters]);

  const [supplierForm, setSupplierForm] = useState({
    name: ''
  });

  const [warehouseForm, setWarehouseForm] = useState({
    name: ''
  });

  const [unitForm, setUnitForm] = useState({
    name: ''
  });

  const [costCenterForm, setCostCenterForm] = useState({
    name: ''
  });

  const handleAddItem = async () => {
    if (!itemForm.name || !itemForm.warehouseId || !itemForm.unit) return;
    try {
      await addDoc(collection(db, 'items'), {
        ...itemForm,
        inward: 0,
        outward: 0,
        returned: 0,
        currentBalance: itemForm.openingBalance
      });
      setShowItemAdd(false);
    } catch (err) { handleFirestoreError(err, 'write', 'items'); }
  };

  const handleAddSupplier = async () => {
    if (!supplierForm.name) return;
    try {
      await addDoc(collection(db, 'suppliers'), {
        ...supplierForm,
        totalPurchases: 0,
        totalPayments: 0,
        balance: 0
      });
      setShowSupplierAdd(false);
    } catch (err) { handleFirestoreError(err, 'write', 'suppliers'); }
  };

  const handleAddWarehouse = async () => {
    if (!warehouseForm.name) return;
    try {
      await addDoc(collection(db, 'warehouses'), {
        ...warehouseForm
      });
      setShowWarehouseAdd(false);
      setWarehouseForm({ name: '' });
    } catch (err) { handleFirestoreError(err, 'write', 'warehouses'); }
  };

  const handleAddUnit = async () => {
    if (!unitForm.name) return;
    try {
      await addDoc(collection(db, 'units'), {
        ...unitForm
      });
      setShowUnitAdd(false);
      setUnitForm({ name: '' });
    } catch (err) { handleFirestoreError(err, 'write', 'units'); }
  };

  const handleAddCostCenter = async () => {
    if (!costCenterForm.name) return;
    try {
      await addDoc(collection(db, 'costCenters'), {
        ...costCenterForm
      });
      setShowCostCenterAdd(false);
      setCostCenterForm({ name: '' });
    } catch (err) { handleFirestoreError(err, 'write', 'costCenters'); }
  };

  const handleDeleteEntity = async () => {
    if (!showDeleteConfirm) return;
    try {
      await deleteDoc(doc(db, showDeleteConfirm.collection, showDeleteConfirm.id));
      setShowDeleteConfirm(null);
    } catch (err) { handleFirestoreError(err, 'delete', showDeleteConfirm.collection); }
  };

  const handleResetAllData = async () => {
    setIsResetting(true);
    const collectionsToClear = [
      'items', 'suppliers', 'warehouses', 'units', 'costCenters', 
      'purchases', 'issuances', 'productionJobs', 'loadingManifests', 
      'waste', 'bladeSharpening', 'plateSharpening', 'machineMaintenance'
    ];

    try {
      for (const colName of collectionsToClear) {
        // We use a simple approach: delete documents we have in state or fetch them
        // For simplicity and safety in this environment, we'll use the ones passed in props where possible
        // and for others we'll just inform the user or fetch them.
        // However, a better way is to just delete the ones we know about.
        
        // Note: In a real app, you'd use a cloud function or a batch delete.
        // Here we'll just delete the ones we have access to in the current view's context if possible,
        // but since we want a FULL reset, we should ideally fetch all.
        
        // Since I don't have all collections in props, I'll just use a generic fetch and delete for each.
        const { getDocs, query, collection, writeBatch } = await import('firebase/firestore');
        const querySnapshot = await getDocs(query(collection(db, colName)));
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
      setShowResetConfirm(false);
      alert('تم تصفير كافة بيانات البرنامج بنجاح');
    } catch (err) {
      handleFirestoreError(err, 'delete', 'all');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">الإعدادات</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">تهيئة النظام وإدارة البيانات الأساسية</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
           <div className="flex flex-col gap-2 sticky top-6">
              <button onClick={() => setActiveSettingTab('general')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeSettingTab === 'general' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-100'}`}>
                 <Settings size={18} />
                 إعدادات عامة
              </button>
              <button onClick={() => setActiveSettingTab('company')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeSettingTab === 'company' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-100'}`}>
                 <Building2 size={18} />
                 بيانات الشركة
              </button>
              <button onClick={() => setActiveSettingTab('infrastructure')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeSettingTab === 'infrastructure' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-100'}`}>
                 <Layers size={18} />
                 البيانات الأساسية
              </button>
              <button onClick={() => setActiveSettingTab('items')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeSettingTab === 'items' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-100'}`}>
                 <Package size={18} />
                 إدارة الأصناف
              </button>
              <button onClick={() => setActiveSettingTab('suppliers')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeSettingTab === 'suppliers' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-100'}`}>
                 <Users size={18} />
                 إدارة الموردين
              </button>
              <button onClick={() => setActiveSettingTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeSettingTab === 'security' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-red-500 hover:bg-red-50'}`}>
                 <ShieldAlert size={18} />
                 الأمان والبيانات
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSettingTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="dribbble-card border-none bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
                <CardHeader>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                    <Upload className="text-primary" size={24} />
                  </div>
                  <CardTitle className="text-2xl font-black">استيراد بيانات من إكسيل</CardTitle>
                  <CardDescription className="text-slate-400 font-medium">يمكنك رفع ملف إكسيل يحتوي على الأصناف لتعريفها دفعة واحدة وتوفير الوقت</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6">
                    <div className="relative group">
                      <Input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={handleImportExcel} 
                        className="bg-white/10 border-white/20 text-white h-14 rounded-2xl cursor-pointer file:bg-primary file:text-white file:border-none file:h-full file:px-6 file:ml-4 file:font-black hover:bg-white/15 transition-all"
                        disabled={isImporting}
                      />
                    </div>
                    {isImporting && (
                      <div className="flex items-center gap-3 text-primary animate-pulse font-black bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
                        جاري معالجة البيانات واستيرادها...
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-xs text-slate-400 font-medium bg-white/5 p-4 rounded-2xl border border-white/10 flex items-start gap-3">
                        <AlertCircle size={16} className="text-primary shrink-0" />
                        <div>
                          <p className="text-primary font-black mb-1">تنبيه الهيكل:</p>
                          يجب أن يحتوي الملف على أعمدة: (الاسم، الوحدة، السعر، المخزن، رصيد أول، حد الأمان)
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 font-medium bg-white/5 p-4 rounded-2xl border border-white/10 flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-emerald-500 font-black mb-1">نصيحة:</p>
                          تأكد من تعريف المخازن أولاً قبل عملية الاستيراد لضمان ربط الأصناف بشكل صحيح.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dribbble-card border-none bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-slate-900">إحصائيات النظام</CardTitle>
                  <CardDescription className="font-medium">نظرة سريعة على حجم البيانات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <Package size={20} />
                      </div>
                      <span className="font-bold text-slate-600">الأصناف</span>
                    </div>
                    <span className="text-xl font-black text-slate-900">{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Users size={20} />
                      </div>
                      <span className="font-bold text-slate-600">الموردين</span>
                    </div>
                    <span className="text-xl font-black text-slate-900">{suppliers.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <Layers size={20} />
                      </div>
                      <span className="font-bold text-slate-600">المخازن</span>
                    </div>
                    <span className="text-xl font-black text-slate-900">{warehouses.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSettingTab === 'company' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="dribbble-card border-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-slate-900">بيانات الشركة</CardTitle>
                  <CardDescription className="font-medium">إعدادات وبيانات الشركة التي تظهر في التقارير والفواتير</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">اسم الشركة</label>
                    <Input className="rounded-xl h-12" value={companyInfo.name} onChange={e => setCompanyInfo({...companyInfo, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">العنوان</label>
                    <Input className="rounded-xl h-12" value={companyInfo.address} onChange={e => setCompanyInfo({...companyInfo, address: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                      <Input className="rounded-xl h-12" value={companyInfo.phone} onChange={e => setCompanyInfo({...companyInfo, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">الرقم الضريبي</label>
                      <Input className="rounded-xl h-12" value={companyInfo.taxId} onChange={e => setCompanyInfo({...companyInfo, taxId: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button className="btn-primary h-12 px-8 rounded-2xl font-black flex items-center gap-2">
                      <Save size={18} />
                      حفظ التغييرات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSettingTab === 'items' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="dribbble-card border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">إدارة الأصناف</CardTitle>
                <CardDescription className="font-medium">إضافة وتعديل الخامات المتوفرة في النظام</CardDescription>
              </div>
              <Button onClick={() => setShowItemAdd(true)} className="btn-primary h-12 px-6 rounded-2xl font-black flex items-center gap-2">
                <Plus size={20} />
                إضافة صنف جديد
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(i => (
                  <div key={i.id} className="flex flex-col p-5 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-black text-lg text-slate-900 group-hover:text-primary transition-colors">{i.name}</p>
                        <Badge variant="outline" className="mt-1 text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-400">
                          {warehouses.find(w => w.id === i.warehouseId)?.name}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" onClick={() => setEditingItem(i)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-primary hover:bg-blue-50">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm({ collection: 'items', id: i.id })} className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">السعر</span>
                        <span className="font-black text-primary text-sm">{i.price.toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">الرصيد</span>
                        <span className="font-black text-slate-700 text-sm">{i.currentBalance} {i.unit}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">الوحدة</span>
                        <span className="font-black text-slate-700 text-sm">{i.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <Package size={40} />
                    </div>
                    <p className="text-slate-400 font-black text-xl">لا يوجد أصناف معرفة حالياً</p>
                    <Button onClick={() => setShowItemAdd(true)} variant="outline" className="rounded-xl font-bold">ابدأ بإضافة أول صنف</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSettingTab === 'suppliers' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="dribbble-card border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">الموردين</CardTitle>
                <CardDescription className="font-medium">إدارة قائمة الموردين والتعاملات المالية</CardDescription>
              </div>
              <Button onClick={() => setShowSupplierAdd(true)} className="btn-primary h-12 px-6 rounded-2xl font-black flex items-center gap-2">
                <Plus size={20} />
                إضافة مورد
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {suppliers.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <Users size={24} />
                      </div>
                      <span className="font-black text-slate-700">{s.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" onClick={() => setEditingSupplier(s)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-primary hover:bg-blue-50">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm({ collection: 'suppliers', id: s.id })} className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {suppliers.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <Users size={40} />
                    </div>
                    <p className="text-slate-400 font-black text-xl">لا يوجد موردين معرفين</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSettingTab === 'infrastructure' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Warehouse Management */}
            <Card className="dribbble-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">المخازن</CardTitle>
                  <CardDescription className="font-medium">تعريف المخازن المختلفة</CardDescription>
                </div>
                <Button size="icon" onClick={() => setShowWarehouseAdd(true)} className="btn-primary h-10 w-10 rounded-xl">
                  <Plus size={20} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {warehouses.map(w => (
                    <div key={w.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <Layers size={16} />
                        </div>
                        <span className="font-black text-slate-700">{w.name}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => setEditingWarehouse(w)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50">
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm({ collection: 'warehouses', id: w.id })} className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {warehouses.length === 0 && <p className="text-center text-slate-400 py-8 font-medium">لا يوجد مخازن معرفة</p>}
                </div>
              </CardContent>
            </Card>

            {/* Units Management */}
            <Card className="dribbble-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">الوحدات</CardTitle>
                  <CardDescription className="font-medium">تعريف وحدات القياس</CardDescription>
                </div>
                <Button size="icon" onClick={() => setShowUnitAdd(true)} className="btn-primary h-10 w-10 rounded-xl">
                  <Plus size={20} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {units.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <Package size={16} />
                        </div>
                        <span className="font-black text-slate-700">{u.name}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => setEditingUnit(u)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50">
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm({ collection: 'units', id: u.id })} className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {units.length === 0 && <p className="text-center text-slate-400 py-8 font-medium">لا يوجد وحدات معرفة</p>}
                </div>
              </CardContent>
            </Card>

            {/* Cost Centers Management */}
            <Card className="dribbble-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">مراكز التكلفة</CardTitle>
                  <CardDescription className="font-medium">تعريف مراحل الإنتاج</CardDescription>
                </div>
                <Button size="icon" onClick={() => setShowCostCenterAdd(true)} className="btn-primary h-10 w-10 rounded-xl">
                  <Plus size={20} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costCenters.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <BarChart3 size={16} />
                        </div>
                        <span className="font-black text-slate-700">{c.name}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => setEditingCostCenter(c)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50">
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm({ collection: 'costCenters', id: c.id })} className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {costCenters.length === 0 && <p className="text-center text-slate-400 py-8 font-medium">لا يوجد مراحل معرفة</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeSettingTab === 'security' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="dribbble-card border-red-100 bg-red-50/30">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-red-700 flex items-center gap-2">
                    <ShieldAlert size={24} />
                    منطقة الخطورة
                  </CardTitle>
                  <CardDescription className="font-medium text-red-600/70">إجراءات حساسة تؤثر على قاعدة البيانات بأكملها</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-6 rounded-2xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">تصفير كافة بيانات البرنامج</h4>
                      <p className="text-slate-500 text-sm mt-1">سيؤدي هذا الإجراء إلى مسح كافة الأصناف، الموردين، الفواتير، والعمليات نهائياً. لا يمكن التراجع عن هذا الإجراء.</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="shrink-0 h-12 px-8 rounded-2xl font-black bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                      onClick={() => setShowResetConfirm(true)}
                    >
                      تصفير الكل نهائياً
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Edit Item Dialog */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader><CardTitle className="font-black text-2xl">تعديل صنف</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم الصنف</label>
                <Input className="rounded-xl h-11" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المخزن</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={editingItem.warehouseId} 
                    onChange={e => setEditingItem({...editingItem, warehouseId: e.target.value})}
                  >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الوحدة</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={editingItem.unit} 
                    onChange={e => setEditingItem({...editingItem, unit: e.target.value})}
                  >
                    {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">السعر</label>
                  <Input type="number" className="rounded-xl h-11" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">مركز التكلفة</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={editingItem.department} 
                    onChange={e => setEditingItem({...editingItem, department: e.target.value})}
                  >
                    {costCenters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="rounded-xl font-bold h-11 px-6" onClick={() => setEditingItem(null)}>إلغاء</Button>
                <Button onClick={async () => {
                  try {
                    const { id, ...data } = editingItem;
                    await updateDoc(doc(db, 'items', id), data);
                    setEditingItem(null);
                  } catch (err) { handleFirestoreError(err, 'write', 'items'); }
                }} className="btn-primary px-10 h-11 font-black">حفظ التعديلات</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Warehouse Dialog */}
      {editingWarehouse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader><CardTitle className="font-black text-2xl">تعديل مخزن</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم المخزن</label>
                <Input className="rounded-xl h-11" value={editingWarehouse.name} onChange={e => setEditingWarehouse({...editingWarehouse, name: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setEditingWarehouse(null)}>إلغاء</Button>
                <Button onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'warehouses', editingWarehouse.id), { name: editingWarehouse.name });
                    setEditingWarehouse(null);
                  } catch (err) { handleFirestoreError(err, 'write', 'warehouses'); }
                }} className="btn-primary px-8 h-11 font-black">حفظ</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Unit Dialog */}
      {editingUnit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader><CardTitle className="font-black text-2xl">تعديل وحدة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم الوحدة</label>
                <Input className="rounded-xl h-11" value={editingUnit.name} onChange={e => setEditingUnit({...editingUnit, name: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setEditingUnit(null)}>إلغاء</Button>
                <Button onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'units', editingUnit.id), { name: editingUnit.name });
                    setEditingUnit(null);
                  } catch (err) { handleFirestoreError(err, 'write', 'units'); }
                }} className="btn-primary px-8 h-11 font-black">حفظ</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Cost Center Dialog */}
      {editingCostCenter && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader><CardTitle className="font-black text-2xl">تعديل مركز تكلفة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم مركز التكلفة</label>
                <Input className="rounded-xl h-11" value={editingCostCenter.name} onChange={e => setEditingCostCenter({...editingCostCenter, name: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setEditingCostCenter(null)}>إلغاء</Button>
                <Button onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'costCenters', editingCostCenter.id), { name: editingCostCenter.name });
                    setEditingCostCenter(null);
                  } catch (err) { handleFirestoreError(err, 'write', 'costCenters'); }
                }} className="btn-primary px-8 h-11 font-black">حفظ</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Supplier Dialog */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="dribbble-card w-full max-w-sm">
            <CardHeader><CardTitle className="font-black">تعديل مورد</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم المورد</label>
                <Input className="rounded-xl h-11" value={editingSupplier.name} onChange={e => setEditingSupplier({...editingSupplier, name: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setEditingSupplier(null)}>إلغاء</Button>
                <Button onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'suppliers', editingSupplier.id), { name: editingSupplier.name });
                    setEditingSupplier(null);
                  } catch (err) { handleFirestoreError(err, 'write', 'suppliers'); }
                }} className="btn-primary px-8 h-11 font-black">حفظ</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Warehouse Dialog */}
      {showWarehouseAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader><CardTitle className="font-black text-2xl">إضافة مخزن جديد</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم المخزن</label>
                <Input className="rounded-xl h-11" value={warehouseForm.name} onChange={e => setWarehouseForm({...warehouseForm, name: e.target.value})} placeholder="مثال: مخزن الخامات" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="btn-ghost" onClick={() => setShowWarehouseAdd(false)}>إلغاء</Button>
                <Button onClick={handleAddWarehouse} className="btn-primary px-8 h-11">حفظ المخزن</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Unit Dialog */}
      {showUnitAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader><CardTitle className="font-black text-2xl">إضافة وحدة جديدة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم الوحدة</label>
                <Input className="rounded-xl h-11" value={unitForm.name} onChange={e => setUnitForm({...unitForm, name: e.target.value})} placeholder="مثال: كيلو، متر، قطعة" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="btn-ghost" onClick={() => setShowUnitAdd(false)}>إلغاء</Button>
                <Button onClick={handleAddUnit} className="btn-primary px-8 h-11">حفظ الوحدة</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Cost Center Dialog */}
      {showCostCenterAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader><CardTitle className="font-black text-2xl">إضافة مركز تكلفة جديد</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم مركز التكلفة</label>
                <Input className="rounded-xl h-11" value={costCenterForm.name} onChange={e => setCostCenterForm({...costCenterForm, name: e.target.value})} placeholder="مثال: ورشة النجارة" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="btn-ghost" onClick={() => setShowCostCenterAdd(false)}>إلغاء</Button>
                <Button onClick={handleAddCostCenter} className="btn-primary px-8 h-11">حفظ مركز التكلفة</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Item Dialog */}
      {showItemAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader><CardTitle className="font-black text-2xl">إضافة صنف جديد</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم الصنف</label>
                <Input className="rounded-xl h-11" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المخزن</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={itemForm.warehouseId} 
                    onChange={e => setItemForm({...itemForm, warehouseId: e.target.value})}
                  >
                    <option value="">اختر المخزن...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الوحدة</label>
                  <select className="w-full h-11 rounded-xl border border-slate-200 px-3 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none" value={itemForm.unit} onChange={e => setItemForm({...itemForm, unit: e.target.value})}>
                    <option value="">اختر الوحدة...</option>
                    {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">السعر الافتراضي</label>
                  <Input type="number" className="rounded-xl h-11" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">مركز التكلفة</label>
                  <select className="w-full h-11 rounded-xl border border-slate-200 px-3 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none" value={itemForm.department} onChange={e => setItemForm({...itemForm, department: e.target.value})}>
                    <option value="">اختر مركز التكلفة...</option>
                    {costCenters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الكمية (رصيد أول المدة)</label>
                  <Input type="number" className="rounded-xl h-11" value={itemForm.openingBalance} onChange={e => setItemForm({...itemForm, openingBalance: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">حد الأمان</label>
                  <Input type="number" className="rounded-xl h-11" value={itemForm.safetyLimit} onChange={e => setItemForm({...itemForm, safetyLimit: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="btn-ghost h-11 px-6" onClick={() => setShowItemAdd(false)}>إلغاء</Button>
                <Button onClick={handleAddItem} className="btn-primary px-10 h-11">حفظ الصنف</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Supplier Dialog */}
      {showSupplierAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
          <Card className="dribbble-card w-full max-w-sm max-h-[90vh] overflow-auto">
            <CardHeader><CardTitle className="font-black text-2xl">إضافة مورد جديد</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم المورد</label>
                <Input className="rounded-xl h-11" value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowSupplierAdd(false)}>إلغاء</Button>
                <Button onClick={handleAddSupplier} className="btn-primary px-8 h-11 font-black">إضافة</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      <ConfirmDialog 
        isOpen={showResetConfirm}
        title="تصفير البرنامج بالكامل"
        message="هل أنت متأكد من رغبتك في حذف كافة بيانات البرنامج؟ سيتم مسح الأصناف، الموردين، المخازن، وكافة العمليات المسجلة نهائياً. لا يمكن التراجع عن هذا الإجراء."
        confirmText={isResetting ? "جاري التصفير..." : "نعم، تصفير الكل"}
        onConfirm={handleResetAllData}
        onCancel={() => !isResetting && setShowResetConfirm(false)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog 
        isOpen={!!showDeleteConfirm}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDeleteEntity}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </div>
  );
}

function JobCostModal({ 
  job, 
  onClose, 
  issuances, 
  employees, 
  jobLabors, 
  jobOtherCosts 
}: { 
  job: ProductionJob, 
  onClose: () => void,
  issuances: Issuance[],
  employees: Employee[],
  jobLabors: JobLabor[],
  jobOtherCosts: JobOtherCost[]
}) {
  const [activeTab, setActiveTab] = useState('summary');
  const [showAddLabor, setShowAddLabor] = useState(false);
  const [showAddOther, setShowAddOther] = useState(false);
  
  const [laborForm, setLaborForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    notes: ''
  });
  
  const [otherForm, setOtherForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    notes: ''
  });

  const jobMaterials = issuances.filter(i => i.jobOrderNo === job.orderNo);
  const jobLaborsList = jobLabors.filter(l => l.jobId === job.id);
  const jobOtherCostsList = jobOtherCosts.filter(o => o.jobId === job.id);

  const materialCost = jobMaterials.reduce((sum, m) => sum + m.total, 0);
  const laborCost = jobLaborsList.reduce((sum, l) => sum + l.total, 0);
  const otherCost = jobOtherCostsList.reduce((sum, o) => sum + o.amount, 0);
  const totalCost = materialCost + laborCost + otherCost;

  const handleAddLabor = async () => {
    if (!laborForm.employeeId || laborForm.hours <= 0) return;
    const emp = employees.find(e => e.id === laborForm.employeeId);
    if (!emp) return;
    
    const rate = emp.dailyRate / 8; // Assume 8 hours work day
    const total = laborForm.hours * rate;
    
    try {
      await addDoc(collection(db, 'jobLabors'), {
        ...laborForm,
        jobId: job.id,
        rate,
        total,
        createdAt: serverTimestamp()
      });
      setShowAddLabor(false);
      setLaborForm({ employeeId: '', date: new Date().toISOString().split('T')[0], hours: 0, notes: '' });
    } catch (err) { handleFirestoreError(err, 'write', 'jobLabors'); }
  };

  const handleAddOther = async () => {
    if (!otherForm.description || otherForm.amount <= 0) return;
    try {
      await addDoc(collection(db, 'jobOtherCosts'), {
        ...otherForm,
        jobId: job.id,
        createdAt: serverTimestamp()
      });
      setShowAddOther(false);
      setOtherForm({ date: new Date().toISOString().split('T')[0], description: '', amount: 0, notes: '' });
    } catch (err) { handleFirestoreError(err, 'write', 'jobOtherCosts'); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto">
      <Card className="dribbble-card w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="border-b border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-black text-2xl">تحليل تكاليف الإنتاج</CardTitle>
              <CardDescription className="font-bold">أمر إنتاج رقم: {job.orderNo} - {job.productName}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X size={20} />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button 
              variant={activeTab === 'summary' ? 'default' : 'ghost'} 
              className={`rounded-xl font-bold flex-1 ${activeTab === 'summary' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('summary')}
            >الملخص</Button>
            <Button 
              variant={activeTab === 'materials' ? 'default' : 'ghost'} 
              className={`rounded-xl font-bold flex-1 ${activeTab === 'materials' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('materials')}
            >الخامات</Button>
            <Button 
              variant={activeTab === 'labor' ? 'default' : 'ghost'} 
              className={`rounded-xl font-bold flex-1 ${activeTab === 'labor' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('labor')}
            >العمالة</Button>
            <Button 
              variant={activeTab === 'other' ? 'default' : 'ghost'} 
              className={`rounded-xl font-bold flex-1 ${activeTab === 'other' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('other')}
            >تكاليف أخرى</Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">تكلفة الخامات</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">{materialCost.toLocaleString()} ج.م</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">تكلفة العمالة</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{laborCost.toLocaleString()} ج.م</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-widest">تكاليف أخرى</span>
                  <div className="text-2xl font-black text-orange-600 mt-1">{otherCost.toLocaleString()} ج.م</div>
                </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-3xl text-center">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">إجمالي تكلفة الإنتاج</span>
                <div className="text-5xl font-black text-white mt-2">{totalCost.toLocaleString()} ج.م</div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الصنف</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobMaterials.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-bold">{m.itemId}</TableCell>
                      <TableCell className="font-bold">{m.quantity} {m.unit}</TableCell>
                      <TableCell className="font-bold">{m.price.toLocaleString()} ج.م</TableCell>
                      <TableCell className="font-black text-primary">{m.total.toLocaleString()} ج.م</TableCell>
                    </TableRow>
                  ))}
                  {jobMaterials.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">لا توجد خامات منصرفة لهذا الطلب</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'labor' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-slate-900">سجلات العمالة</h4>
                <Button size="sm" onClick={() => setShowAddLabor(true)} className="btn-primary">إضافة سجل</Button>
              </div>
              
              {showAddLabor && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold">الموظف</label>
                      <select className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white" value={laborForm.employeeId} onChange={e => setLaborForm({...laborForm, employeeId: e.target.value})}>
                        <option value="">اختر الموظف</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold">عدد الساعات</label>
                      <Input type="number" className="h-10 rounded-xl" value={laborForm.hours} onChange={e => setLaborForm({...laborForm, hours: parseFloat(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowAddLabor(false)}>إلغاء</Button>
                    <Button size="sm" onClick={handleAddLabor} className="btn-primary">حفظ</Button>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الساعات</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobLaborsList.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-bold">{employees.find(e => e.id === l.employeeId)?.name || 'غير معروف'}</TableCell>
                      <TableCell className="font-bold">{l.date}</TableCell>
                      <TableCell className="font-bold">{l.hours} ساعة</TableCell>
                      <TableCell className="font-black text-emerald-600">{l.total.toLocaleString()} ج.م</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'other' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-slate-900">تكاليف متنوعة</h4>
                <Button size="sm" onClick={() => setShowAddOther(true)} className="btn-primary">إضافة تكلفة</Button>
              </div>

              {showAddOther && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold">الوصف</label>
                    <Input className="h-10 rounded-xl" value={otherForm.description} onChange={e => setOtherForm({...otherForm, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold">المبلغ</label>
                    <Input type="number" className="h-10 rounded-xl" value={otherForm.amount} onChange={e => setOtherForm({...otherForm, amount: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowAddOther(false)}>إلغاء</Button>
                    <Button size="sm" onClick={handleAddOther} className="btn-primary">حفظ</Button>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobOtherCostsList.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-bold">{o.description}</TableCell>
                      <TableCell className="font-bold">{o.date}</TableCell>
                      <TableCell className="font-black text-orange-600">{o.amount.toLocaleString()} ج.م</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

