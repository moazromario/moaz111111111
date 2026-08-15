import React, { useState } from 'react';
import { Customer, FurnitureWorkOrder } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from './ui/WorkOrderCardUI';
import { Image as ImageIcon, Search, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';

interface WorkOrderWhatsappHubProps {
  whatsappDrafts: any[];
  recipes: any[];
  customers: Customer[];
  handleWhatsAppDraftUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteWhatsAppDraft: (id: string) => void;
  handleOpenSplitUnpacker: (draft: any) => void;
  onSaveWorkOrder: (order: Partial<FurnitureWorkOrder>) => Promise<void>;
}

export function WorkOrderWhatsappHub({
  whatsappDrafts,
  recipes,
  customers,
  handleWhatsAppDraftUpload,
  deleteWhatsAppDraft,
  handleOpenSplitUnpacker,
  onSaveWorkOrder
}: WorkOrderWhatsappHubProps) {
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
  const [excelRows, setExcelRows] = useState<any[]>([
    {
      orderNumber: `WO-${Date.now().toString().slice(-4)}`,
      customerName: '',
      roomCode: '',
      generalSpecs: '',
      dimensionsAndStructure: '',
      paintSpecs: '',
      upholsterySpecs: '',
      totalAmount: 0,
      deliveryDate: '',
      salesPerson: ''
    }
  ]);

  const addExcelRow = () => {
    setExcelRows(prev => [
      ...prev,
      {
        orderNumber: `WO-${(Date.now() + prev.length).toString().slice(-4)}`,
        customerName: '',
        roomCode: '',
        generalSpecs: '',
        dimensionsAndStructure: '',
        paintSpecs: '',
        upholsterySpecs: '',
        totalAmount: 0,
        deliveryDate: '',
        salesPerson: ''
      }
    ]);
  };

  const removeExcelRow = (index: number) => {
    if (excelRows.length <= 1) return;
    setExcelRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateExcelRow = (index: number, key: string, value: any) => {
    setExcelRows(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const saveExcelSheet = async () => {
    const validRows = excelRows.filter(r => r.customerName.trim() && r.orderNumber.trim());
    if (validRows.length === 0) {
      alert('الرجاء كتابة اسم العميل ورقم الأمر على الأقل لسطر واحد للحفظ');
      return;
    }

    try {
      for (const row of validRows) {
        let cust = customers.find(c => c.name.trim() === row.customerName.trim());
        const customerId = cust ? cust.id : `cust-${Date.now()}`;

        await onSaveWorkOrder({
          customerId,
          customerName: row.customerName,
          orderNumber: row.orderNumber,
          roomCode: row.roomCode || 'غرفة عامة',
          generalSpecs: row.generalSpecs,
          dimensionsAndStructure: row.dimensionsAndStructure,
          paintSpecs: row.paintSpecs,
          upholsterySpecs: row.upholsterySpecs,
          totalAmount: Number(row.totalAmount) || 0,
          deliveryDate: row.deliveryDate,
          salesPerson: row.salesPerson,
          contractDate: new Date().toISOString().split('T')[0],
          status: 'بانتظار التعميد',
          rooms: [
            {
              roomCode: row.roomCode || 'غرفة عامة',
              generalSpecs: row.generalSpecs || '',
              dimensionsAndStructure: row.dimensionsAndStructure || '',
              paintSpecs: row.paintSpecs || '',
              upholsterySpecs: row.upholsterySpecs || '',
              status: 'بانتظار التعميد'
            }
          ]
        });
      }

      alert('تم حفظ كافة السطور بنجاح وتحويلها لأوامر شغل مفرغة بالسيستم!');
      setExcelRows([
        {
          orderNumber: `WO-${Date.now().toString().slice(-4)}`,
          customerName: '',
          roomCode: '',
          generalSpecs: '',
          dimensionsAndStructure: '',
          paintSpecs: '',
          upholsterySpecs: '',
          totalAmount: 0,
          deliveryDate: '',
          salesPerson: ''
        }
      ]);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء حفظ شيت الإكسيل.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" dir="rtl">
      {/* WhatsApp Uploads Column (35%) */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-100">
            <CardTitle className="text-sm font-black text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              🟢 وارد الواتساب والأوراق المؤرشفة
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1 font-bold">نزّل صور أوامر الشغل المستلمة على الجروب واسحبها هنا للتفريغ السريع</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Drag and Drop Zone */}
            <div className="border-2 border-dashed border-emerald-200 hover:border-emerald-500 rounded-[14px] p-6 text-center cursor-pointer bg-emerald-50/10 hover:bg-emerald-50/30 transition-all relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleWhatsAppDraftUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <ImageIcon size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-xs font-black text-emerald-800">اسحب صور أوامر الشغل هنا أو تصفح الجهاز 📁</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">التنسيقات المدعومة: JPG, PNG, WEBP</p>
            </div>

            {/* Drafts List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-600 flex items-center gap-1">
                <span>صندوق الوارد النشط</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono font-black">
                  {whatsappDrafts.length}
                </span>
              </h4>

              {whatsappDrafts.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                  <ImageIcon size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-[11px] text-slate-400 font-bold">لا توجد صور واردة حالياً. اسحب أول صورة لبدء العمل.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {whatsappDrafts.map(draft => (
                    <div key={draft.id} className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm flex gap-3 justify-between items-center hover:border-emerald-200 transition-all">
                      <img
                        src={draft.imageUrl}
                        alt="WhatsApp attachment"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-100 hover:scale-150 transition-transform duration-200 cursor-zoom-in"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-700 truncate">{draft.fileName || 'ملف مستند'}</p>
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-black mt-1 ${
                          draft.status === 'جديد بانتظار التفريغ' 
                            ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {draft.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {draft.status === 'جديد بانتظار التفريغ' && (
                          <button
                            onClick={() => handleOpenSplitUnpacker(draft)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded-lg text-[10px] font-black transition-all"
                          >
                            تفريغ 📝
                          </button>
                        )}
                        <button
                          onClick={() => deleteWhatsAppDraft(draft.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg text-[10px] text-center"
                        >
                          حذف 🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recipe Price Lookup */}
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-indigo-50/50 pb-3 border-b border-indigo-100/50">
            <CardTitle className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
              🛋️ دليل أسعار الموديلات بالمعارض
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-500 font-bold mt-1">
              ابحث عن الموديل لمعرفة السعر الرسمي المعتمد لتفريغه بدقة
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-right" dir="rtl">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بكود أو اسم الموديل..."
                value={recipeSearchTerm}
                onChange={(e) => setRecipeSearchTerm(e.target.value)}
                className="w-full pr-3 pl-8 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>
            
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
              {recipes.filter((r: any) => {
                if (!recipeSearchTerm) return true;
                return r.name?.toLowerCase().includes(recipeSearchTerm.toLowerCase()) ||
                       r.category?.toLowerCase().includes(recipeSearchTerm.toLowerCase());
              }).slice(0, recipeSearchTerm ? 15 : 5).map((recipe: any) => (
                <div key={recipe.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div className="text-right">
                    <p className="text-[11px] font-black text-slate-800">{recipe.name}</p>
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">{recipe.category || 'أخرى'}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-indigo-700">{(recipe.sellingPrice || 0).toLocaleString()} ج.م</p>
                    <span className="text-[9px] text-slate-400 font-bold">السعر الرسمي بالمعرض</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spreadsheet grid (65%) */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-indigo-50/30 pb-4 border-b border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-sm font-black text-indigo-900 flex items-center gap-1.5">
                <FileSpreadsheet size={16} />
                الشيت السريع لإدخال الأوامر (تفريغ مجمع)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1 font-bold">
                اكتب كافة الأوامر والبنود دفعة واحدة هنا كشيت إكسيل تفاعلي ثم احفظ بضغطة زر واحدة
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={addExcelRow} variant="outline" size="sm" className="text-[11px] h-8">
                <Plus size={12} className="ml-1" /> إضافة سطر +
              </Button>
              <Button onClick={saveExcelSheet} variant="success" size="sm" className="text-[11px] h-8 bg-emerald-600 hover:bg-emerald-700">
                💾 حفظ وتثبيت الشيت بالكامل
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs min-w-[800px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                  <th className="p-2">رقم الأمر</th>
                  <th className="p-2">اسم العميل</th>
                  <th className="p-2">كود الغرفة</th>
                  <th className="p-2">المواصفات العامة</th>
                  <th className="p-2">النجارة والمقاسات</th>
                  <th className="p-2">الدهان</th>
                  <th className="p-2">التنجيد</th>
                  <th className="p-2">القيمة ج.م</th>
                  <th className="p-2">تاريخ الاستلام</th>
                  <th className="p-2">حذف</th>
                </tr>
              </thead>
              <tbody>
                {excelRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.orderNumber}
                        onChange={(e) => updateExcelRow(idx, 'orderNumber', e.target.value)}
                        className="w-20 px-2 py-1 border border-slate-200 rounded text-[11px] font-mono font-bold"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="اسم العميل..."
                        value={row.customerName}
                        onChange={(e) => updateExcelRow(idx, 'customerName', e.target.value)}
                        className="w-28 px-2 py-1 border border-slate-200 rounded text-[11px] font-bold"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="كود الغرفة..."
                        value={row.roomCode}
                        onChange={(e) => updateExcelRow(idx, 'roomCode', e.target.value)}
                        className="w-24 px-2 py-1 border border-slate-200 rounded text-[11px] font-bold"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="مواصفات عامة..."
                        value={row.generalSpecs}
                        onChange={(e) => updateExcelRow(idx, 'generalSpecs', e.target.value)}
                        className="w-32 px-2 py-1 border border-slate-200 rounded text-[11px]"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="نجارة ومقاسات..."
                        value={row.dimensionsAndStructure}
                        onChange={(e) => updateExcelRow(idx, 'dimensionsAndStructure', e.target.value)}
                        className="w-32 px-2 py-1 border border-slate-200 rounded text-[11px] text-red-600 font-bold"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="دهان..."
                        value={row.paintSpecs}
                        onChange={(e) => updateExcelRow(idx, 'paintSpecs', e.target.value)}
                        className="w-24 px-2 py-1 border border-slate-200 rounded text-[11px]"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="تنجيد..."
                        value={row.upholsterySpecs}
                        onChange={(e) => updateExcelRow(idx, 'upholsterySpecs', e.target.value)}
                        className="w-24 px-2 py-1 border border-slate-200 rounded text-[11px]"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={row.totalAmount}
                        onChange={(e) => updateExcelRow(idx, 'totalAmount', Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-slate-200 rounded text-[11px] font-black text-indigo-700"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="date"
                        value={row.deliveryDate}
                        onChange={(e) => updateExcelRow(idx, 'deliveryDate', e.target.value)}
                        className="w-28 px-2 py-1 border border-slate-200 rounded text-[10px]"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        onClick={() => removeExcelRow(idx)}
                        disabled={excelRows.length <= 1}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded disabled:opacity-30"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
