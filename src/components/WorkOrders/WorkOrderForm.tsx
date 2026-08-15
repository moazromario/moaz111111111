import React, { useState, useEffect } from 'react';
import { Customer, FurnitureWorkOrder } from '../../types';
import { SearchableSelect } from '../SearchableSelect';
import { DatePicker } from '../ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from './ui/WorkOrderCardUI';
import { Clock, Image as ImageIcon, X, Layers, Plus } from 'lucide-react';
import { workOrdersService } from './services/workOrdersService';

interface WorkOrderFormProps {
  order?: FurnitureWorkOrder | null;
  editingOrder?: FurnitureWorkOrder | null;
  isOpen?: boolean;
  onClose: () => void;
  onSave?: () => void;
  customers: Customer[];
  costCenters: any[];
  recipes?: any[];
}

export function WorkOrderForm({
  order,
  editingOrder,
  isOpen = true,
  onClose,
  onSave,
  customers,
  costCenters,
}: WorkOrderFormProps) {
  const currentOrder = order || editingOrder || null;

  const [formData, setFormData] = useState<Partial<FurnitureWorkOrder>>({
    orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    contractDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    customerId: '',
    customerName: '',
    salesPerson: '',
    costCenterId: '',
    status: 'جديد',
    totalAmount: 0,
    rooms: [
      {
        roomCode: 'غرفة 1',
        generalSpecs: '',
        dimensionsAndStructure: '',
        paintSpecs: '',
        upholsterySpecs: '',
        status: 'جديد'
      }
    ],
    notes: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrder) {
      setFormData({
        ...currentOrder,
        rooms: currentOrder.rooms && currentOrder.rooms.length > 0 
          ? currentOrder.rooms 
          : [
              {
                roomCode: currentOrder.roomCode || 'غرفة 1',
                generalSpecs: currentOrder.generalSpecs || '',
                dimensionsAndStructure: currentOrder.dimensionsAndStructure || '',
                paintSpecs: currentOrder.paintSpecs || '',
                upholsterySpecs: currentOrder.upholsterySpecs || '',
                status: currentOrder.status || 'جديد'
              }
            ]
      });
    }
  }, [currentOrder]);

  if (isOpen === false) return null;

  const customerOptions = customers.map(c => ({
    id: c.id,
    name: c.name,
    subtext: c.phone || ''
  }));

  const addRoomField = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [
        ...(prev.rooms || []),
        {
          roomCode: `غرفة ${(prev.rooms?.length || 0) + 1}`,
          generalSpecs: '',
          dimensionsAndStructure: '',
          paintSpecs: '',
          upholsterySpecs: '',
          status: 'جديد'
        }
      ]
    }));
  };

  const removeRoomField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms?.filter((_, idx) => idx !== index)
    }));
  };

  const updateRoomField = (index: number, key: string, value: any) => {
    setFormData(prev => {
      const updatedRooms = [...(prev.rooms || [])];
      updatedRooms[index] = { ...updatedRooms[index], [key]: value };
      return { ...prev, rooms: updatedRooms };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, attachmentImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      await workOrdersService.saveWorkOrder(formData, currentOrder?.id);
      if (onSave) onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ أمر التشغيل');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-5xl max-h-[92vh] overflow-y-auto border-none shadow-2xl animate-in zoom-in-95 duration-200">
        <CardHeader className="border-b border-slate-100 pb-4 sticky top-0 bg-white z-10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black text-slate-800">
              {currentOrder ? 'تعديل وتحديث أمر التشغيل الفني' : 'إصدار أمر تشغيل وإنتاج جديد للعميل'}
            </CardTitle>
            <CardDescription className="font-bold text-xs mt-1 text-slate-500">
              قم بتوصيف المواصفات الفنية للورش بدقة كاملة
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-slate-500 font-black">
            إغلاق
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-black rounded-xl">
              {error}
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 block">رقم أمر الشغل :</label>
              <input
                type="text"
                value={formData.orderNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="مثال: ORD-1002"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 block">اسم العميل التعاقدي :</label>
              <SearchableSelect
                options={customerOptions}
                selectedValue={formData.customerId || ''}
                onChange={(val) => {
                  const selected = customers.find(c => c.id === val);
                  setFormData(prev => ({
                    ...prev,
                    customerId: val,
                    customerName: selected ? selected.name : ''
                  }));
                }}
                placeholder="اختر العميل..."
                className="text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 block">مسؤول المبيعات (السيلز) :</label>
              <input
                type="text"
                value={formData.salesPerson || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, salesPerson: e.target.value }))}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="اسم مسؤول المبيعات"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 block">تاريخ التعاقد :</label>
              <DatePicker
                date={formData.contractDate ? new Date(formData.contractDate) : undefined}
                setDate={(date) => setFormData(prev => ({ ...prev, contractDate: date ? date.toISOString().split('T')[0] : '' }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 block">تاريخ التسليم المستهدف :</label>
              <DatePicker
                date={formData.deliveryDate ? new Date(formData.deliveryDate) : undefined}
                setDate={(date) => setFormData(prev => ({ ...prev, deliveryDate: date ? date.toISOString().split('T')[0] : '' }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 block">مركز التكلفة / المشروع :</label>
              <select
                value={formData.costCenterId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, costCenterId: e.target.value }))}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="">اختر مركز التكلفة...</option>
                {costCenters.map(cc => (
                  <option key={cc.id} value={cc.id}>{cc.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 block">حالة الأوردر الإجمالية :</label>
              <select
                value={formData.status || 'جديد'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="جديد">جديد 🆕</option>
                <option value="نجارة">نجارة 🪵</option>
                <option value="دهان">دهان 🎨</option>
                <option value="تنجيد">تنجيد 🛋️</option>
                <option value="تجميع وتعبئة">تجميع وتعبئة 📦</option>
                <option value="جاهز للتسليم">جاهز للتسليم ✨</option>
                <option value="تم التسليم">تم التسليم ✅</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 block">إجمالي قيمة التعاقد (ج.م) :</label>
              <input
                type="number"
                value={formData.totalAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Attachment Image */}
          <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
            <label className="text-xs font-black text-slate-800 flex items-center gap-2">
              <ImageIcon size={16} className="text-indigo-600" /> مرفق رسم كارت الشغل أو التصميم (اختياري) :
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-xs text-slate-500 font-bold"
            />
            {formData.attachmentImage && (
              <div className="relative w-32 h-32 border rounded-xl overflow-hidden mt-2">
                <img src={formData.attachmentImage} alt="Attachment" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, attachmentImage: undefined }))}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Rooms / Items Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" /> تفاصيل الغرف والبنود المطلوبة ({formData.rooms?.length || 0})
              </h4>
              <Button type="button" onClick={addRoomField} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-black text-xs">
                <Plus size={14} className="ml-1" /> إضافة بند / غرفة +
              </Button>
            </div>

            {formData.rooms?.map((room, idx) => (
              <div key={idx} className="p-4 border-2 border-slate-200 rounded-2xl bg-white space-y-3 relative shadow-sm">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-black text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    البند #{idx + 1}
                  </span>
                  {formData.rooms && formData.rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoomField(idx)}
                      className="text-red-500 hover:text-red-700 text-xs font-black flex items-center gap-1"
                    >
                      <X size={14} /> حذف البند
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">اسم الغرفة / كود البند :</label>
                    <input
                      type="text"
                      value={room.roomCode || ''}
                      onChange={(e) => updateRoomField(idx, 'roomCode', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs"
                      placeholder="مثال: غرفة نوم / صالون"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">حالة البند بالورشة :</label>
                    <select
                      value={room.status || 'جديد'}
                      onChange={(e) => updateRoomField(idx, 'status', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs bg-white"
                    >
                      <option value="جديد">جديد 🆕</option>
                      <option value="نجارة">نجارة 🪵</option>
                      <option value="دهان">دهان 🎨</option>
                      <option value="تنجيد">تنجيد 🛋️</option>
                      <option value="تجميع وتعبئة">تجميع وتعبئة 📦</option>
                      <option value="جاهز للتسليم">جاهز للتسليم ✨</option>
                      <option value="تم التسليم">تم التسليم ✅</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">المواصفات العامة :</label>
                    <textarea
                      value={room.generalSpecs || ''}
                      onChange={(e) => updateRoomField(idx, 'generalSpecs', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs"
                      placeholder="المواصفات العامة للبند..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">تفاصيل النجارة والمقاسات :</label>
                    <textarea
                      value={room.dimensionsAndStructure || ''}
                      onChange={(e) => updateRoomField(idx, 'dimensionsAndStructure', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs"
                      placeholder="الأبعاد، قطع الخشب والتركيب..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">مواصفات الدهان :</label>
                    <textarea
                      value={room.paintSpecs || ''}
                      onChange={(e) => updateRoomField(idx, 'paintSpecs', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs"
                      placeholder="درجات الألوان ونوع الرش..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">مواصفات التنجيد والفرش :</label>
                    <textarea
                      value={room.upholsterySpecs || ''}
                      onChange={(e) => updateRoomField(idx, 'upholsterySpecs', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs"
                      placeholder="نوع القماش والإسفنج..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-700 block">ملاحظات عامة وتسليم :</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-xs"
              placeholder="شروط خاصة، ملاحظات العميل، الخ..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" type="button" onClick={onClose} className="font-black text-xs">
              إلغاء
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ أمر التشغيل'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
