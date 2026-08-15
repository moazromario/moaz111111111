import React, { useState, useMemo } from 'react';
import { useWorkOrdersData } from './hooks/useWorkOrdersData';
import { workOrdersService } from './services/workOrdersService';
import { FurnitureWorkOrder } from '../../types';

// Icons & UI
import { 
  Table, FolderKanban, Plus, Printer, CheckCircle2, 
  Users, Layers, Truck, MessageSquare, Archive, BarChart3
} from 'lucide-react';
import { Button } from './ui/WorkOrderCardUI';

// Modular Tab Components
import { WorkOrderTable } from './WorkOrderTable';
import { WorkOrderForm } from './WorkOrderForm';
import { WorkOrderDetails } from './WorkOrderDetails';
import { WorkOrderProductionLine } from './WorkOrderProductionLine';
import { WorkOrderCustomerAccounts } from './WorkOrderCustomerAccounts';
import { WorkOrderWhatsappHub } from './WorkOrderWhatsappHub';
import { WorkOrderMonthlyFolders } from './WorkOrderMonthlyFolders';
import { WorkOrderShippingHub } from './WorkOrderShippingHub';
import { WorkOrderAnalyticsHub } from './WorkOrderAnalyticsHub';
import { WorkOrderDeliveredArchive } from './WorkOrderDeliveredArchive';
import { WorkOrderPrintTemplates } from './WorkOrderPrintTemplates';

export function WorkOrdersPage() {
  const {
    workOrders,
    customers,
    costCenters,
    recipes,
    customerPayments,
    safes,
    whatsappDrafts,
    shippingManifests,
    deliveryReceipts,
    deliveryLogs,
    loading,
    refresh
  } = useWorkOrdersData();

  // Navigation Sub-Tabs State
  const [activeSubTab, setActiveSubTab] = useState<
    | 'orders_list'
    | 'kanban_board'
    | 'customer_accounts'
    | 'whatsapp_import'
    | 'monthly_folders'
    | 'shipping_hub'
    | 'delivered_archive'
    | 'analytics_hub'
  >('orders_list');

  // Modal & Selection States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<FurnitureWorkOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<FurnitureWorkOrder | null>(null);
  const [printingRoom, setPrintingRoom] = useState<any | null>(null);

  // Delivery Edit Modal State
  const [showEditDeliveryModal, setShowEditDeliveryModal] = useState(false);
  const [editingDeliveryLog, setEditingDeliveryLog] = useState<any | null>(null);

  // Print Selection States
  const [selectedManifestForPrint, setSelectedManifestForPrint] = useState<any | null>(null);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<any | null>(null);
  const [selectedDeliveryLogForPrint, setSelectedDeliveryLogForPrint] = useState<any | null>(null);

  // Derived list of rooms across work orders
  const productionRooms = useMemo(() => {
    const list: any[] = [];
    workOrders.forEach(o => {
      if (o.rooms && o.rooms.length > 0) {
        o.rooms.forEach((r, idx) => {
          list.push({
            ...r,
            orderId: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            customerId: o.customerId,
            deliveryDate: o.deliveryDate,
            salesPerson: o.salesPerson,
            roomIndex: idx,
            status: r.status || o.status
          });
        });
      } else if (o.roomCode) {
        list.push({
          roomCode: o.roomCode,
          status: o.status,
          generalSpecs: o.generalSpecs,
          dimensionsAndStructure: o.dimensionsAndStructure,
          paintSpecs: o.paintSpecs,
          upholsterySpecs: o.upholsterySpecs,
          orderId: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerId: o.customerId,
          deliveryDate: o.deliveryDate,
          salesPerson: o.salesPerson,
          roomIndex: 0
        });
      }
    });
    return list;
  }, [workOrders]);

  // Handlers
  const handleCreateNew = () => {
    setEditingOrder(null);
    setShowAddModal(true);
  };

  const handleEditOrder = (order: FurnitureWorkOrder) => {
    setEditingOrder(order);
    setShowAddModal(true);
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('هل أنت تأكد من حذف أمر التشغيل هذا نهائياً؟')) {
      try {
        await workOrdersService.deleteWorkOrder(id);
        refresh();
      } catch (err) {
        console.error('Failed to delete work order', err);
      }
    }
  };

  const handleRoomStatusChange = async (orderId: string, roomIndex: number, newStatus: string) => {
    const order = workOrders.find(o => o.id === orderId);
    if (!order || !order.rooms) return;

    const updatedRooms = [...order.rooms];
    updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], status: newStatus };

    try {
      await workOrdersService.updateWorkOrderRooms(orderId, updatedRooms);
      refresh();
    } catch (err) {
      console.error('Failed to update room status', err);
    }
  };

  const handlePrintRoom = (room: any) => {
    setPrintingRoom(room);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleDeleteDeliveryLog = async (id: string) => {
    if (window.confirm('هل أنت تأكد من حذف سجل التسليم هذا؟')) {
      try {
        await workOrdersService.deleteDeliveryLog(id);
        refresh();
      } catch (err) {
        console.error('Failed to delete delivery log', err);
      }
    }
  };

  const handleSaveDeliveryLog = async (logData: any) => {
    try {
      await workOrdersService.saveDeliveryLog(logData);
      setShowEditDeliveryModal(false);
      setEditingDeliveryLog(null);
      refresh();
    } catch (err) {
      console.error('Failed to save delivery log', err);
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans text-right dir-rtl" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
              إدارة المصنع والورش الفنية ✨
            </span>
            <span className="text-[10px] font-mono text-slate-400">v3.5 Modular</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <FolderKanban className="text-indigo-600" size={28} /> مركز إدارة ومتابعة أوامر التشغيل والإنتاج
          </h1>
          <p className="text-slate-500 text-xs font-bold mt-1">
            متابعة دقيقة لخطوط تصنيع الأثاث والموبيليا، تفريغ الواتساب، الشحن المجمع، وحسابات العملاء المربوطة.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="text-slate-700 border-slate-200 hover:bg-slate-50 font-black text-xs"
          >
            <Printer size={16} className="ml-1.5" /> طباعة القائمة
          </Button>

          <Button
            onClick={handleCreateNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-black text-xs"
          >
            <Plus size={16} className="ml-1.5" /> أمر شغل جديد +
          </Button>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-[16px] overflow-x-auto border border-slate-200/60 no-scrollbar">
        <button
          onClick={() => setActiveSubTab('orders_list')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeSubTab === 'orders_list'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Table size={16} /> جدول الأوامر الرئيسية ({workOrders.length})
        </button>

        <button
          onClick={() => setActiveSubTab('kanban_board')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeSubTab === 'kanban_board'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Layers size={16} /> خط الإنتاج بالورش ({productionRooms.length} بند)
        </button>

        <button
          onClick={() => setActiveSubTab('customer_accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeSubTab === 'customer_accounts'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users size={16} /> دفتر حسابات العملاء ({customers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('whatsapp_import')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeSubTab === 'whatsapp_import'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <MessageSquare size={16} /> استيراد وتفريغ الواتساب ({whatsappDrafts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('shipping_hub')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeSubTab === 'shipping_hub'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Truck size={16} /> مركز الشحن والمحاضر المجمعة ({shippingManifests.length})
        </button>

        <button
          onClick={() => setActiveSubTab('monthly_folders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeSubTab === 'monthly_folders'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Archive size={16} /> المجلدات والأرشيف الشهرية
        </button>

        <button
          onClick={() => setActiveSubTab('delivered_archive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeSubTab === 'delivered_archive'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <CheckCircle2 size={16} /> أرشيف التسليمات والنواقص ({deliveryLogs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('analytics_hub')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeSubTab === 'analytics_hub'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BarChart3 size={16} /> التحليلات والمؤشرات المالية
        </button>
      </div>

      {/* Dynamic Tab Render Area */}
      {loading ? (
        <div className="bg-white rounded-[20px] p-12 text-center border border-slate-100 space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-slate-600">جاري تحميل بيانات المصنع وخطوط الإنتاج...</p>
        </div>
      ) : (
        <>
          {activeSubTab === 'orders_list' && (
            <WorkOrderTable
              workOrders={workOrders}
              onNewOrder={handleCreateNew}
              onEditOrder={handleEditOrder}
              onViewOrder={(order) => setViewingOrder(order)}
              onDeleteOrder={handleDeleteOrder}
              onConvertToDeliveryReceipt={() => {}}
              onConvertToLoadingManifest={() => {}}
              onPrintFilteredSummary={() => window.print()}
              getStatusBadge={(status) => (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                  {status}
                </span>
              )}
            />
          )}

          {activeSubTab === 'kanban_board' && (
            <WorkOrderProductionLine
              productionRooms={productionRooms}
              costCenters={costCenters}
              updateOrderCostCenter={async (orderId, costCenterId) => {
                await workOrdersService.saveWorkOrder({ costCenterId }, orderId);
                refresh();
              }}
              updateRoomStage={handleRoomStatusChange}
              getRemainingDaysBadge={(deliveryDate) => (
                <span className="text-[10px] font-black text-slate-500">{deliveryDate || 'غير محدد'}</span>
              )}
              setPrintingRoom={handlePrintRoom}
            />
          )}

          {activeSubTab === 'customer_accounts' && (
            <WorkOrderCustomerAccounts
              customers={customers}
              workOrders={workOrders}
              customerPayments={customerPayments}
              safes={safes}
              onOpenPaymentModal={() => {}}
              onViewOrder={(order) => setViewingOrder(order)}
              onConvertToDeliveryReceipt={() => {}}
              onConvertToLoadingManifest={() => {}}
              getStatusBadge={(status) => (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-800">
                  {status}
                </span>
              )}
            />
          )}

          {activeSubTab === 'whatsapp_import' && (
            <WorkOrderWhatsappHub
              whatsappDrafts={whatsappDrafts}
              recipes={recipes}
              customers={customers}
              handleWhatsAppDraftUpload={() => {}}
              deleteWhatsAppDraft={() => {}}
              handleOpenSplitUnpacker={() => {}}
              onSaveWorkOrder={async (order) => {
                await workOrdersService.saveWorkOrder(order);
                refresh();
              }}
            />
          )}

          {activeSubTab === 'monthly_folders' && (
            <WorkOrderMonthlyFolders
              workOrders={workOrders}
              onViewOrder={(order) => setViewingOrder(order)}
            />
          )}

          {activeSubTab === 'shipping_hub' && (
            <WorkOrderShippingHub
              loadingManifests={shippingManifests}
              deliveryReceipts={deliveryReceipts}
              onShowManifestModal={() => {}}
              onPrintManifest={(manifest) => {
                setSelectedManifestForPrint(manifest);
                setTimeout(() => window.print(), 300);
              }}
              onDeleteManifest={() => {}}
              onPrintReceipt={(receipt) => {
                setSelectedReceiptForPrint(receipt);
                setTimeout(() => window.print(), 300);
              }}
            />
          )}

          {activeSubTab === 'delivered_archive' && (
            <WorkOrderDeliveredArchive
              deliveryLogs={deliveryLogs}
              onShowEditDeliveryModal={(log) => {
                setEditingDeliveryLog(log || { syncOriginalOrder: true });
                setShowEditDeliveryModal(true);
              }}
              onDeleteDeliveryLog={handleDeleteDeliveryLog}
              onPrintDeliveryLog={(log) => {
                setSelectedDeliveryLogForPrint(log);
                setTimeout(() => window.print(), 300);
              }}
            />
          )}

          {activeSubTab === 'analytics_hub' && (
            <WorkOrderAnalyticsHub
              workOrders={workOrders}
              customerPayments={customerPayments}
              productionRooms={productionRooms}
            />
          )}
        </>
      )}

      {/* Modal: Create or Edit Work Order */}
      {showAddModal && (
        <WorkOrderForm
          order={editingOrder}
          customers={customers}
          costCenters={costCenters}
          recipes={recipes}
          onClose={() => setShowAddModal(false)}
          onSave={() => refresh()}
        />
      )}

      {/* Modal: View Order Details */}
      {viewingOrder && (
        <WorkOrderDetails
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onPrint={() => window.print()}
          onRefresh={refresh}
        />
      )}

      {/* Edit Delivery Log Modal */}
      {showEditDeliveryModal && editingDeliveryLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white rounded-[20px] max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="text-amber-500" size={22} />
                {editingDeliveryLog.id ? 'تعديل أوردر التسليم وتسجيل النواقص والمرتجعات' : 'إضافة سجل تسليم/مرتجع جديد'}
              </h3>
              <button 
                onClick={() => { setShowEditDeliveryModal(false); setEditingDeliveryLog(null); }} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-slate-600">رقم أمر الشغيل (الأوردر):</label>
                <input
                  type="text"
                  value={editingDeliveryLog.orderNumber || ''}
                  onChange={(e) => setEditingDeliveryLog((prev: any) => ({ ...prev, orderNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  placeholder="مثال: ORD-104"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">اسم العميل:</label>
                <input
                  type="text"
                  value={editingDeliveryLog.customerName || ''}
                  onChange={(e) => setEditingDeliveryLog((prev: any) => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  placeholder="اسم العميل الكامل"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">اسم البند / الغرفة:</label>
                <input
                  type="text"
                  value={editingDeliveryLog.roomCode || ''}
                  onChange={(e) => setEditingDeliveryLog((prev: any) => ({ ...prev, roomCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  placeholder="مثال: غرفة نوم رئيسية / سفرة"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">تاريخ التسليم الفعلي:</label>
                <input
                  type="date"
                  value={editingDeliveryLog.deliveryDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditingDeliveryLog((prev: any) => ({ ...prev, deliveryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">اسم السائق / مسؤول النقل:</label>
                <input
                  type="text"
                  value={editingDeliveryLog.driverName || ''}
                  onChange={(e) => setEditingDeliveryLog((prev: any) => ({ ...prev, driverName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  placeholder="اسم السائق"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">رقم السيارة / نوع اللوحة:</label>
                <input
                  type="text"
                  value={editingDeliveryLog.carNumber || ''}
                  onChange={(e) => setEditingDeliveryLog((prev: any) => ({ ...prev, carNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  placeholder="رقم وتفاصيل السيارة"
                />
              </div>
            </div>

            <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <label className="font-black text-slate-800 block">حالة التسليم الميداني:</label>
              <select
                value={editingDeliveryLog.deliveryStatus || 'مستلم بالكامل'}
                onChange={(e) => setEditingDeliveryLog((prev: any) => ({ ...prev, deliveryStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-slate-800 bg-white"
              >
                <option value="مستلم بالكامل">مستلم بالكامل ✅ (تسليم سليم)</option>
                <option value="مستلم بنواقص">مستلم بنواقص ⚠️ (تم التسليم مع وجود قطع ناقصة)</option>
                <option value="قيد استكمال النواقص">قيد استكمال النواقص ⏳ (الورشة تجهز النواقص)</option>
                <option value="مرتجع جزئي">مرتجع جزئي 🔄 (رجوع جزء من الطلب)</option>
                <option value="مرتجع بالكامل">مرتجع بالكامل ❌ (رفض الاستلام ورجوع الشحنة)</option>
                <option value="قيد معالجة المرتجع">قيد معالجة المرتجع 🛠️ (صيانة أو تعديل المرتجع)</option>
              </select>
            </div>

            <div className="space-y-2 bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-xs">
              <span className="font-black text-amber-900 block">
                ⚠️ تفاصيل النواقص في الأوردر (إن وجدت):
              </span>
              <textarea
                value={editingDeliveryLog.shortagesDescription || ''}
                onChange={(e) => setEditingDeliveryLog((prev: any) => ({ ...prev, shortagesDescription: e.target.value }))}
                placeholder="اكتب أياً من الأجزاء أو القطع أو الاكسسوارات الناقصة في الأوردر..."
                className="w-full p-2.5 border border-amber-300 rounded-xl font-bold text-slate-800 bg-white h-20 outline-none"
              />
            </div>

            <div className="space-y-2 bg-rose-50/70 p-4 rounded-xl border border-rose-200 text-xs">
              <span className="font-black text-rose-900 block">
                🔄 تفاصيل المرتجعات وأسباب الإرجاع:
              </span>
              <textarea
                value={editingDeliveryLog.returnsDescription || ''}
                onChange={(e) => setEditingDeliveryLog((prev: any) => ({ ...prev, returnsDescription: e.target.value }))}
                placeholder="اذكر أسباب رجوع القطع (مثال: عيب دهان، تلف في النقل...)"
                className="w-full p-2.5 border border-rose-300 rounded-xl font-bold text-slate-800 bg-white h-20 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => { setShowEditDeliveryModal(false); setEditingDeliveryLog(null); }}
              >
                إلغاء
              </Button>
              <Button
                onClick={() => handleSaveDeliveryLog(editingDeliveryLog)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-black px-6"
              >
                حفظ التعديل والنواقص
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Templates Rendered for Window.print() */}
      <WorkOrderPrintTemplates
        viewingOrder={viewingOrder}
        filteredOrders={workOrders}
        printingRoom={printingRoom}
        selectedManifestForPrint={selectedManifestForPrint}
        selectedReceiptForPrint={selectedReceiptForPrint}
        selectedDeliveryLogForPrint={selectedDeliveryLogForPrint}
      />
    </div>
  );
}
