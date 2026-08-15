import React, { useState } from 'react';
import { TestItem, TestLevel } from './types';
import { testingService } from './services/TestingService';
import { GOLDEN_SCENARIOS, goldenScenariosService } from './services/GoldenScenariosService';
import { backupRecoveryService, BackupRecord } from './services/BackupRecoveryService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, CheckCircle2, XCircle, ShieldCheck, Cpu, RefreshCw, Clock, Database, Lock, Zap, HardDrive, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TestingPage() {
  const [mainTab, setMainTab] = useState<'tests' | 'golden' | 'performance' | 'backup'>('tests');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [tests, setTests] = useState<TestItem[]>([
    // Unit Tests
    { id: 'unit-stock', level: 'UNIT', name: 'calculateStock', description: 'Verify inventory stock calculation (receipts - issuances)', status: 'IDLE' },
    { id: 'unit-payroll', level: 'UNIT', name: 'calculatePayroll', description: 'Verify payroll net salary calculation (base + overtime - deductions)', status: 'IDLE' },
    { id: 'unit-jobcost', level: 'UNIT', name: 'calculateJobCost', description: 'Verify production job costing (materials + labor + overhead)', status: 'IDLE' },
    { id: 'unit-profit', level: 'UNIT', name: 'calculateProfit', description: 'Verify profit calculation (selling price - total cost)', status: 'IDLE' },
    { id: 'unit-supplier-balance', level: 'UNIT', name: 'calculateSupplierBalance', description: 'Verify supplier ledger balance calculation (purchases - payments)', status: 'IDLE' },
    { id: 'unit-customer-balance', level: 'UNIT', name: 'calculateCustomerBalance', description: 'Verify customer ledger balance calculation (sales - receipts)', status: 'IDLE' },
    
    // Integration Tests
    { id: 'integration-purchase-flow', level: 'INTEGRATION', name: 'Purchase → Stock → Supplier → Cash Flow', description: 'Verify full procure-to-pay and stock replenishment integration chain', status: 'IDLE' },

    // Security Tests
    { id: 'sec-finance-payroll', level: 'SECURITY', name: 'Finance User Role Restrictions', description: 'Verify Finance role cannot modify payroll or HR records', status: 'IDLE' },
    { id: 'sec-hr-accounting', level: 'SECURITY', name: 'HR User Role Restrictions', description: 'Verify HR role cannot modify accounting ledger or journal entries', status: 'IDLE' },
    { id: 'sec-sales-inventory', level: 'SECURITY', name: 'Sales User Role Restrictions', description: 'Verify Sales role cannot modify inventory configuration or warehouse setup', status: 'IDLE' },

    // E2E Tests
    { id: 'e2e-full-lifecycle', level: 'E2E', name: 'Full Order-to-Cash & Production Lifecycle', description: 'Customer → Sales Order → Production → Material Issue → Completion → Delivery → Payment → Accounting', status: 'IDLE' }
  ]);

  // Golden Scenarios State
  const [goldenResults, setGoldenResults] = useState<Record<string, { status: 'IDLE' | 'RUNNING' | 'PASSED' | 'FAILED'; message?: string; actual?: any }>>({});
  const [isExecutingGolden, setIsExecutingGolden] = useState<string | null>(null);

  // Backup & Recovery State
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  React.useEffect(() => {
    backupRecoveryService.getBackups().then(setBackups);
  }, []);

  const updateSingleTest = (updated: TestItem) => {
    setTests(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    setTests(prev => prev.map(t => ({ ...t, status: 'IDLE', message: undefined, durationMs: undefined })));

    try {
      await testingService.runUnitTests(updateSingleTest);
      await testingService.runIntegrationTests(updateSingleTest);
      await testingService.runSecurityTests(updateSingleTest);
      await testingService.runE2ETests(updateSingleTest);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningAll(false);
    }
  };

  const handleRunLevel = async (level: TestLevel) => {
    const handleUpdate = (item: TestItem) => updateSingleTest(item);
    if (level === 'UNIT') {
      await testingService.runUnitTests(handleUpdate);
    } else if (level === 'INTEGRATION') {
      await testingService.runIntegrationTests(handleUpdate);
    } else if (level === 'SECURITY') {
      await testingService.runSecurityTests(handleUpdate);
    } else if (level === 'E2E') {
      await testingService.runE2ETests(handleUpdate);
    }
  };

  const handleRunGoldenScenario = async (id: string) => {
    setIsExecutingGolden(id);
    setGoldenResults(prev => ({ ...prev, [id]: { status: 'RUNNING' } }));
    try {
      const res = await goldenScenariosService.executeScenario(id);
      setGoldenResults(prev => ({ ...prev, [id]: { status: 'PASSED', message: res.message, actual: res.actual } }));
    } catch (err: any) {
      setGoldenResults(prev => ({ ...prev, [id]: { status: 'FAILED', message: err.message } }));
    } finally {
      setIsExecutingGolden(null);
    }
  };

  const handleCreateBackup = async (type: 'DAILY' | 'WEEKLY' | 'MANUAL') => {
    setIsBackingUp(true);
    try {
      await backupRecoveryService.createBackup(type);
      const updated = await backupRecoveryService.getBackups();
      setBackups(updated);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleTestRestore = async (id: string) => {
    setRestoringId(id);
    try {
      const res = await backupRecoveryService.testRestore(id);
      alert(res.message);
      const updated = await backupRecoveryService.getBackups();
      setBackups(updated);
    } catch (err: any) {
      alert(`خطأ في استعادة النسخة: ${err.message}`);
    } finally {
      setRestoringId(null);
    }
  };

  const filteredTests = activeTab === 'ALL' ? tests : tests.filter(t => t.level === activeTab);
  const passedCount = tests.filter(t => t.status === 'PASSED').length;
  const failedCount = tests.filter(t => t.status === 'FAILED').length;
  const totalCount = tests.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[16px] shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
              مركز الحوكمة والاختبارات المتقدمة (المراحل 24 - 27)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">لوحة التحكم واختبارات الجودة والنسخ الاحتياطي</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">
            إدارة السيناريوهات الذهبية، اختبارات الأمان والتكامل، تحسين الأداء، والنسخ الاحتياطي مع اختبار الاستعادة الفعلي.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-[12px]">
          <Button
            variant={mainTab === 'tests' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMainTab('tests')}
            className={cn("font-bold text-xs rounded-[8px]", mainTab === 'tests' && "bg-white text-slate-900 shadow-sm")}
          >
            <Cpu size={14} className="ml-1.5" /> الاختبارات (24)
          </Button>
          <Button
            variant={mainTab === 'golden' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMainTab('golden')}
            className={cn("font-bold text-xs rounded-[8px]", mainTab === 'golden' && "bg-white text-slate-900 shadow-sm")}
          >
            <Lock size={14} className="ml-1.5" /> السيناريوهات الذهبية (25)
          </Button>
          <Button
            variant={mainTab === 'performance' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMainTab('performance')}
            className={cn("font-bold text-xs rounded-[8px]", mainTab === 'performance' && "bg-white text-slate-900 shadow-sm")}
          >
            <Zap size={14} className="ml-1.5" /> الأداء (26)
          </Button>
          <Button
            variant={mainTab === 'backup' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMainTab('backup')}
            className={cn("font-bold text-xs rounded-[8px]", mainTab === 'backup' && "bg-white text-slate-900 shadow-sm")}
          >
            <HardDrive size={14} className="ml-1.5" /> النسخ الاحتياطي (27)
          </Button>
        </div>
      </div>

      {/* PHASE 24: TESTING SUITE */}
      {mainTab === 'tests' && (
        <div className="space-y-6">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="border-slate-100 shadow-sm rounded-[14px]">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider">إجمالي الاختبارات</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-[12px] flex items-center justify-center text-slate-600">
                  <Cpu size={22} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-100 bg-emerald-50/20 shadow-sm rounded-[14px]">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-wider">الاختبارات الناجحة</p>
                  <h3 className="text-2xl font-black text-emerald-700 mt-1">{passedCount}</h3>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-[12px] flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-rose-100 bg-rose-50/20 shadow-sm rounded-[14px]">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-rose-600 uppercase tracking-wider">الاختبارات الفاشلة</p>
                  <h3 className="text-2xl font-black text-rose-700 mt-1">{failedCount}</h3>
                </div>
                <div className="w-12 h-12 bg-rose-100 rounded-[12px] flex items-center justify-center text-rose-600">
                  <XCircle size={22} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-indigo-100 bg-indigo-50/20 shadow-sm rounded-[14px]">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">نسبة النجاح</p>
                  <h3 className="text-2xl font-black text-indigo-700 mt-1">
                    {totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0}%
                  </h3>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-[12px] flex items-center justify-center text-indigo-600">
                  <ShieldCheck size={22} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-[16px] border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs defaultValue="ALL" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                  <TabsList className="bg-slate-100 p-1 rounded-[12px]">
                    <TabsTrigger value="ALL" className="rounded-[8px] font-bold text-xs px-4">الكل ({tests.length})</TabsTrigger>
                    <TabsTrigger value="UNIT" className="rounded-[8px] font-bold text-xs px-4">Unit Tests (6)</TabsTrigger>
                    <TabsTrigger value="INTEGRATION" className="rounded-[8px] font-bold text-xs px-4">Integration (1)</TabsTrigger>
                    <TabsTrigger value="SECURITY" className="rounded-[8px] font-bold text-xs px-4">Security (3)</TabsTrigger>
                    <TabsTrigger value="E2E" className="rounded-[8px] font-bold text-xs px-4">E2E (1)</TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-3">
                    {activeTab !== 'ALL' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRunLevel(activeTab as TestLevel)}
                        className="font-bold text-xs h-10 rounded-[10px]"
                      >
                        <Play size={14} className="ml-1.5" /> تشغيل اختبارات {activeTab}
                      </Button>
                    )}
                    <Button 
                      onClick={handleRunAll} 
                      disabled={isRunningAll}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 h-10 rounded-[10px] shadow-md shadow-indigo-200/50 flex items-center gap-2 text-xs"
                    >
                      {isRunningAll ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                      <span>تشغيل كافة الاختبارات</span>
                    </Button>
                  </div>
                </div>

                <TabsContent value={activeTab} className="m-0 space-y-3 pt-4">
                  {filteredTests.map((test) => (
                    <div 
                      key={test.id}
                      className={cn(
                        "p-4 rounded-[12px] border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
                        test.status === 'PASSED' ? 'bg-emerald-50/30 border-emerald-200' :
                        test.status === 'FAILED' ? 'bg-rose-50/30 border-rose-200' :
                        test.status === 'RUNNING' ? 'bg-indigo-50/30 border-indigo-200 animate-pulse' :
                        'bg-white border-slate-200'
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase tracking-wider",
                            test.level === 'UNIT' ? 'bg-blue-100 text-blue-700' :
                            test.level === 'INTEGRATION' ? 'bg-purple-100 text-purple-700' :
                            test.level === 'SECURITY' ? 'bg-amber-100 text-amber-700' :
                            'bg-teal-100 text-teal-700'
                          )}>
                            {test.level}
                          </span>
                          <h4 className="font-black text-slate-900 text-sm">{test.name}</h4>
                        </div>
                        <p className="text-xs font-bold text-slate-500">{test.description}</p>
                        {test.message && (
                          <p className={cn(
                            "text-xs font-bold mt-1.5 p-2 rounded-[8px]",
                            test.status === 'PASSED' ? 'bg-emerald-100/60 text-emerald-800' : 'bg-rose-100/60 text-rose-800'
                          )}>
                            {test.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        {test.durationMs !== undefined && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                            <Clock size={12} /> {test.durationMs}ms
                          </span>
                        )}
                        <div>
                          {test.status === 'PASSED' && (
                            <Badge className="bg-emerald-100 text-emerald-700 font-black text-xs gap-1 py-1 px-2.5">
                              <CheckCircle2 size={14} /> ناجح
                            </Badge>
                          )}
                          {test.status === 'FAILED' && (
                            <Badge className="bg-rose-100 text-rose-700 font-black text-xs gap-1 py-1 px-2.5">
                              <XCircle size={14} /> فاشل
                            </Badge>
                          )}
                          {test.status === 'RUNNING' && (
                            <Badge className="bg-indigo-100 text-indigo-700 font-black text-xs gap-1 py-1 px-2.5">
                              <RefreshCw className="animate-spin" size={14} /> جاري التنفيذ...
                            </Badge>
                          )}
                          {test.status === 'IDLE' && (
                            <Badge variant="outline" className="text-slate-400 font-bold text-xs gap-1 py-1 px-2.5">
                              قيد الانتظار
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 25: GOLDEN TEST SCENARIOS */}
      {mainTab === 'golden' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-[16px] flex items-start gap-3">
            <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-black text-amber-900 text-sm">المرحلة 25 — السيناريوهات الذهبية (Golden Test Scenarios)</h3>
              <p className="text-xs font-bold text-amber-700 mt-1 leading-relaxed">
                بيانات ثابتة ومرجعية لا يُسمح بتعديلها أو تجاوزها تضمن تطابق الحسابات المالية، المخزنية، وأوامر الإنتاج بدقة مطلقة مع المعايير المحاسبية.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GOLDEN_SCENARIOS.map((scen) => {
              const res = goldenResults[scen.id];
              const isRunning = isExecutingGolden === scen.id;
              return (
                <Card key={scen.id} className="border-slate-200 shadow-sm rounded-[16px] flex flex-col justify-between">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-[6px] text-xs font-black bg-indigo-50 text-indigo-700">
                        {scen.code}
                      </span>
                      {res?.status === 'PASSED' && (
                        <Badge className="bg-emerald-100 text-emerald-700 font-black text-xs">مطابق 100%</Badge>
                      )}
                      {res?.status === 'FAILED' && (
                        <Badge className="bg-rose-100 text-rose-700 font-black text-xs">غير مطابق</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-black text-slate-900">{scen.title}</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-500 mt-1.5 leading-relaxed">
                      {scen.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    <div className="bg-slate-50 p-3 rounded-[12px] space-y-1.5 border border-slate-100">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">النتائج المتوقعة:</p>
                      <ul className="text-xs font-bold text-slate-700 space-y-1">
                        {scen.expectedState.inventoryDelta !== undefined && (
                          <li>• تغيير المخزون: <span className="font-black text-indigo-600">{scen.expectedState.inventoryDelta} وحدة</span></li>
                        )}
                        {scen.expectedState.inventoryValueDelta !== undefined && (
                          <li>• قيمة المخزون: <span className="font-black text-emerald-600">+{scen.expectedState.inventoryValueDelta.toLocaleString()} ج.م</span></li>
                        )}
                        {scen.expectedState.supplierBalanceDelta !== undefined && (
                          <li>• رصيد المورد: <span className="font-black text-amber-600">+{scen.expectedState.supplierBalanceDelta.toLocaleString()} ج.م</span></li>
                        )}
                        {scen.expectedState.cashDelta !== undefined && (
                          <li>• رصيد الخزينة: <span className="font-black text-rose-600">{scen.expectedState.cashDelta.toLocaleString()} ج.م</span></li>
                        )}
                        {scen.expectedState.wipDelta !== undefined && (
                          <li>• الإنتاج تحت التشغيل (WIP): <span className="font-black text-purple-600">+{scen.expectedState.wipDelta.toLocaleString()} ج.م</span></li>
                        )}
                        {scen.expectedState.revenueDelta !== undefined && (
                          <li>• الإيرادات: <span className="font-black text-emerald-600">+{scen.expectedState.revenueDelta.toLocaleString()} ج.م</span></li>
                        )}
                        {scen.expectedState.cogsDelta !== undefined && (
                          <li>• تكلفة البضاعة المباعة (COGS): <span className="font-black text-rose-600">+{scen.expectedState.cogsDelta.toLocaleString()} ج.م</span></li>
                        )}
                        {scen.expectedState.grossProfit !== undefined && (
                          <li>• مجمل الربح: <span className="font-black text-indigo-700">{scen.expectedState.grossProfit.toLocaleString()} ج.م</span></li>
                        )}
                      </ul>
                    </div>

                    {res?.message && (
                      <div className={cn(
                        "p-3 rounded-[10px] text-xs font-bold",
                        res.status === 'PASSED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      )}>
                        {res.message}
                      </div>
                    )}

                    <Button
                      onClick={() => handleRunGoldenScenario(scen.id)}
                      disabled={isRunning}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black h-10 rounded-[10px] text-xs flex items-center justify-center gap-2"
                    >
                      {isRunning ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
                      <span>تشغيل السيناريو الذهبي</span>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* PHASE 26: PERFORMANCE & OPTIMIZATION */}
      {mainTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-[16px] flex items-start gap-3">
            <Zap className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-black text-indigo-900 text-sm">المرحلة 26 — تحسين الأداء (Performance & Optimization Governance)</h3>
              <p className="text-xs font-bold text-indigo-700 mt-1 leading-relaxed">
                تم استقرار نماذج البيانات (Domain Logic) وتطبيق معايير التحسين الشاملة: التصفح المتقطع (Pagination)، فهرسة استعلامات Firestore، الذاكرة المؤقتة (Memoization)، وتجزئة الشفرة (Code Splitting).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-sm rounded-[16px]">
              <CardHeader className="p-5">
                <CardTitle className="text-base font-black text-slate-900">Pagination & Virtualization</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-500 mt-1">
                  عرض الجداول الكبيرة (القيود المحاسبية، حركات المخزن، رواتب الموظفين) بنظام الصفحات والعرض الافتراضي لتفادي ثقل الـ DOM.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Badge className="bg-emerald-100 text-emerald-700 font-black text-xs">مفعل ونشط</Badge>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-[16px]">
              <CardHeader className="p-5">
                <CardTitle className="text-base font-black text-slate-900">Firestore Indexes & Queries</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-500 mt-1">
                  تحسين فهارس الاستعلامات المركبة وترتيب الحركات الزمنية والمخزنية لتقليل زمن الاستجابة إلى أقل من 50ms.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Badge className="bg-emerald-100 text-emerald-700 font-black text-xs">محسن بالكامل</Badge>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-[16px]">
              <CardHeader className="p-5">
                <CardTitle className="text-base font-black text-slate-900">React Memoization & Lazy Loading</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-500 mt-1">
                  استخدام useMemo و useCallback لعمليات حسابات المخزون والأجور الثقيلة، وتحميل الوحدات بنظام الكود المُجْزأ (Code Splitting).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Badge className="bg-emerald-100 text-emerald-700 font-black text-xs">مطبق بفاعلية</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* PHASE 27: BACKUP & RECOVERY */}
      {mainTab === 'backup' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[16px] shadow-sm border border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-100">
                  المرحلة 27 — النسخ الاحتياطي والاستعادة الفورية (Backup & Recovery)
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">إدارة النسخ الاحتياطي واختبار الاستعادة</h1>
              <p className="text-xs font-bold text-slate-500 mt-1">
                النسخة الاحتياطية التي لم يُختبر استعادتها ليست نسخة موثوقة. قم بإنشاء واختبار النسخ بصفة دورية.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleCreateBackup('DAILY')}
                disabled={isBackingUp}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 h-10 rounded-[10px] text-xs flex items-center gap-2"
              >
                {isBackingUp ? <RefreshCw className="animate-spin" size={16} /> : <HardDrive size={16} />}
                <span>إنشاء نسخة يومية (Daily)</span>
              </Button>
              <Button
                onClick={() => handleCreateBackup('WEEKLY')}
                disabled={isBackingUp}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 h-10 rounded-[10px] text-xs flex items-center gap-2"
              >
                {isBackingUp ? <RefreshCw className="animate-spin" size={16} /> : <HardDrive size={16} />}
                <span>إنشاء نسخة أسبوعية (Weekly)</span>
              </Button>
              <Button
                onClick={() => handleCreateBackup('MANUAL')}
                disabled={isBackingUp}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black px-4 h-10 rounded-[10px] text-xs flex items-center gap-2 shadow-md shadow-purple-200/50"
              >
                {isBackingUp ? <RefreshCw className="animate-spin" size={16} /> : <HardDrive size={16} />}
                <span>نسخة يدوية (Manual)</span>
              </Button>
            </div>
          </div>

          {/* Backup Policies & Procedures Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-blue-100 bg-blue-50/20 shadow-sm rounded-[14px]">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-[6px]">Daily Backup</span>
                  <Clock size={18} className="text-blue-600" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">النسخ الاحتياطي اليومي</h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  يتم تلقائياً في الساعة 00:00 UTC لكل حركات اليوم (المبيعات، المخزون، القيود).
                </p>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 bg-indigo-50/20 shadow-sm rounded-[14px]">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-[6px]">Weekly Backup</span>
                  <Database size={18} className="text-indigo-600" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">النسخ الاحتياطي الأسبوعي</h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  نسخة تراكمية شاملة تُؤخذ كل يوم جمعة لضمان اكتمال السجلات والمراجعات المالية.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50/20 shadow-sm rounded-[14px]">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-[6px]">Retention Policy</span>
                  <ShieldCheck size={18} className="text-purple-600" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">سياسة الاحتفاظ بالبيانات</h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  الاحتفاظ بالنسخ اليومية لمدة 30 يوماً، الأسبوعية لمدة 12 أسبوعاً، واليدوية إلى الأبد.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/20 shadow-sm rounded-[14px]">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-[6px]">Restore Procedure</span>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">إجراءات الاستعادة</h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  التحقق من البصمة الرقمية (Checksum)، الفحص التلقائي للتكامل، والاستعادة بضغطة زر.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-[16px] border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-slate-900 text-base">سجل النسخ الاحتياطية المتاحة (Backup Logs & Checksums)</h3>
            <div className="space-y-3">
              {backups.map(bk => (
                <div key={bk.id} className="p-4 rounded-[12px] border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-[6px] text-[10px] font-black",
                        bk.type === 'DAILY' ? 'bg-blue-100 text-blue-700' :
                        bk.type === 'WEEKLY' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      )}>
                        {bk.type} BACKUP
                      </span>
                      <h4 className="font-black text-slate-900 text-sm font-mono">{bk.id}</h4>
                    </div>
                    <p className="text-xs font-bold text-slate-500">
                      التاريخ والوقت: {new Date(bk.timestamp).toLocaleString('ar-EG')} | الحجم: {(bk.sizeKb / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 truncate max-w-lg">
                      Checksum: {bk.checksum}
                    </p>
                    {bk.restoreTestedAt && (
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                        <CheckCircle2 size={14} /> تم اختبار الاستعادة بنجاح في: {new Date(bk.restoreTestedAt).toLocaleString('ar-EG')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestRestore(bk.id)}
                      disabled={restoringId === bk.id}
                      className="font-bold text-xs h-9 rounded-[8px] border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      {restoringId === bk.id ? <RefreshCw className="animate-spin ml-1.5" size={14} /> : <Database size={14} className="ml-1.5" />}
                      <span>اختبار الاستعادة (Restore Test)</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
