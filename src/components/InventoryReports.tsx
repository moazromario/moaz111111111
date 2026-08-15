import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Item, Warehouse, Purchase, Issuance, Waste } from '../types';
import { Box, TrendingUp, AlertCircle, DollarSign, CheckCircle, RefreshCw, Play, ShieldCheck } from 'lucide-react';
import { useInventory } from '../modules/inventory/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InventoryReportsProps {
  items: Item[];
  warehouses: Warehouse[];
  purchases: Purchase[];
  issuances: Issuance[];
  wasteRecords: Waste[];
}

export function InventoryReports({ items, warehouses, purchases, issuances, wasteRecords }: InventoryReportsProps) {
  const { 
    generateReconciliationReport, 
    verifyAndSyncItem, 
    runMigrationTests 
  } = useInventory();

  const [reconciliationData, setReconciliationData] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null);
  const [refreshingReport, setRefreshingReport] = useState(false);

  // Load reconciliation report on load
  const fetchReport = async () => {
    try {
      setRefreshingReport(true);
      const data = await generateReconciliationReport();
      setReconciliationData(data || []);
    } catch (err) {
      console.error('Failed to load reconciliation report', err);
    } finally {
      setRefreshingReport(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleRunTests = async () => {
    try {
      setRunningTests(true);
      const results = await runMigrationTests();
      setTestResults(results || []);
    } catch (err) {
      console.error('Failed to run migration tests', err);
    } finally {
      setRunningTests(false);
    }
  };

  const handleSyncItem = async (itemId: string) => {
    try {
      setSyncingItemId(itemId);
      await verifyAndSyncItem(itemId);
      await fetchReport(); // reload report
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setSyncingItemId(null);
    }
  };

  // Inventory Value and Totals
  const totalValue = useMemo(() => items.reduce((sum, item) => sum + (item.price * item.openingBalance), 0), [items]);
  const totalItems = useMemo(() => items.length, [items]);

  // Inventory by Warehouse
  const inventoryByWarehouse = useMemo(() => {
    return warehouses.map(w => {
      const warehouseItems = items.filter(i => i.warehouseId === w.id);
      return {
        name: w.name,
        value: warehouseItems.reduce((sum, i) => sum + (i.price * i.openingBalance), 0)
      };
    });
  }, [items, warehouses]);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#10b981', '#34d399', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">إجمالي قيمة المخزون</CardTitle>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">عدد الأصناف</CardTitle>
            <Box className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع المخزون حسب المستودع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={inventoryByWarehouse} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {inventoryByWarehouse.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>الأصناف ذات القيمة العالية</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصنف</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">القيمة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.sort((a,b) => (b.price * b.openingBalance) - (a.price * a.openingBalance)).slice(0, 5).map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.openingBalance}</TableCell>
                      <TableCell className="text-right">{(item.price * item.openingBalance).toLocaleString('ar-EG')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modern Stock Ledger Reconciliation & Migration Verification Dashboard */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600 w-5 h-5" />
                بوابة التحقق ومطابقة دفتر الأستاذ المخزني (Dual Read Reconciliation)
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                تطابق الأرصدة التراكمية التاريخية (Legacy Balance) مع المجموع الفعلي لحركات دفتر الأستاذ الجديد (Ledger Balance) لضمان أمان البيانات.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchReport} 
                disabled={refreshingReport}
                className="h-9 gap-1 font-bold text-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingReport ? 'animate-spin' : ''}`} />
                تحديث التقرير
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleRunTests} 
                disabled={runningTests}
                className="h-9 gap-1 font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                تشغيل اختبارات المطابقة
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Automated test results checklist */}
            {testResults.length > 0 && (
              <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="text-green-600 w-4 h-4" />
                  تقرير فحص بنية المهاجرة والاختبارات التلقائية:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testResults.map((t, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-start justify-between p-3 rounded-lg border text-xs font-bold ${
                        t.status === 'PASSED' 
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                          : 'bg-red-50/50 border-red-100 text-red-800'
                      }`}
                    >
                      <div>
                        <div className="font-black">{t.testName}</div>
                        <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">{t.message}</div>
                      </div>
                      <Badge className={t.status === 'PASSED' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}>
                        {t.status === 'PASSED' ? 'ناجح' : 'فشل'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reconciliation table */}
            <div className="overflow-hidden border border-slate-100 rounded-xl">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black text-slate-800 text-right">كود الصنف</TableHead>
                    <TableHead className="font-black text-slate-800 text-right">اسم الصنف</TableHead>
                    <TableHead className="font-black text-slate-800 className='text-center'">الرصيد التراكمي (Legacy)</TableHead>
                    <TableHead className="font-black text-slate-800 className='text-center'">رصيد دفتر الأستاذ (Ledger)</TableHead>
                    <TableHead className="font-black text-slate-800 className='text-center'">الفارق (Variance)</TableHead>
                    <TableHead className="font-black text-slate-800 className='text-center'">حالة المطابقة (Status)</TableHead>
                    <TableHead className="font-black text-slate-800 text-left">إجراءات المزامنة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliationData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-400 font-bold text-xs">
                        {refreshingReport ? 'جاري استدعاء البيانات ومطابقتها...' : 'لا يوجد أصناف لعرضها.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    reconciliationData.map((row) => (
                      <TableRow key={row.itemId} className="hover:bg-slate-50/30">
                        <TableCell className="font-black text-slate-900">{row.itemCode}</TableCell>
                        <TableCell className="font-bold text-slate-700">{row.itemName}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{row.legacyBalance}</TableCell>
                        <TableCell className="text-center font-bold text-indigo-700">{row.ledgerBalance}</TableCell>
                        <TableCell className={`text-center font-black ${row.variance === 0 ? 'text-slate-500' : 'text-amber-600'}`}>
                          {row.variance}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`font-black ${
                              row.status === 'MATCHED' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}
                          >
                            {row.status === 'MATCHED' ? 'متطابق (PASS)' : 'عدم تطابق (FAIL)'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          {row.status !== 'MATCHED' && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleSyncItem(row.itemId)}
                              disabled={syncingItemId === row.itemId}
                              className="h-7 text-[10px] font-black border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            >
                              {syncingItemId === row.itemId ? 'جاري المزامنة...' : 'مزامنة مع الأستاذ'}
                            </Button>
                          )}
                          {row.status === 'MATCHED' && (
                            <span className="text-[10px] font-black text-emerald-600">الأرصدة سليمة ✓</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
