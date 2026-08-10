import React, { useState } from 'react';
import { 
  CustomerSpecifications, SpecAttachment, ManufacturingOrder, WorkOrder 
} from '../types';
import { 
  Palette, Ruler, Scissors, Box, Paperclip, Copy, ExternalLink, Image, Eye, Tag, 
  FileText, Sparkles, Printer, CheckCircle2, ChevronDown, Layers, Info, Check, 
  X, Plus, Trash2, Download, Hammer, ShieldAlert, FileCode, Sliders, MessageSquare, Wrench
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Preset configurations for fast creation
export const sampleCustomerSpecsPresets: Record<string, CustomerSpecifications> = {
  bedroom: {
    customerName: 'أحمد محمود العبد القادر',
    orderReference: 'SO-2026-882 (معرض القاهرة)',
    color: 'أبيض لؤلؤي مط + حليات بني جوزي',
    dimensions: 'سرير 200×180 سم | دولاب 280×220×65 سم | تسريحة 140 سم',
    woodType: 'زان أحمر روماني مسافات 100% + كبس قشرة أرو طبيعي',
    paintType: 'أستر بولي يوريثان إيطالي معالج ضد الرطوبة',
    fabricType: 'جلد مقلوب معالج للسرير',
    fabricColor: 'بيج عاجي #04',
    fabricQuantity: '6 أمتار طولي',
    foamType: 'هارد تايلاندي ضغط 33 للظهر',
    foamQuantity: 'سماكة 10 سم',
    accessories: 'مفصلات بلوم هيدروليك + مقابض استانلس ذهبي PVD + إضاءة LED داخلية',
    customModifications: 'زيادة ارتفاع ظهر السرير إلى 140 سم بدلاً من 120 سم + إضافة درج سري بالتسريحة',
    customerNotes: 'العميل يطلب الفحص قبل التغليف النهائي في المعرض الرئيسي',
    specialInstructions: 'مراعاة مطابقة لون قشرة الأرو بين أبواب الدولاب والتسريحة والسرير',
    attachments: [
      { id: 'att-1', name: 'منظور ظهر السرير والمقاسات.jpg', url: 'https://images.unsplash.com/photo-1540518614846-7ede433c5172?w=800&q=80', type: 'image' },
      { id: 'att-2', name: 'الرسم الهندسي المعتمد للدولاب.pdf', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', type: 'drawing' }
    ]
  },
  sofa: {
    customerName: 'م. سارة كمال الشريف',
    orderReference: 'SO-2026-904 (معرض التجمع)',
    color: 'كحلي ملكي + أرجل خشبي بني محروق',
    dimensions: 'كنبة 3 مقاعد (240×95 سم) + 2 فوتيه (90×85 سم)',
    woodType: 'شاسيه خشب زان أبيض سويدي طبيعي + زان أحمر للتحميل',
    paintType: 'دهان أستر دوكو للأرجل الخشبية',
    fabricType: 'مخمل إسباني طارد للسوائل والبقع',
    fabricColor: 'كحلي دافئ #12',
    fabricQuantity: '22 متر طولي',
    foamType: 'إسفنج سوبر سوفت كثافة 38 للمقاعد',
    foamQuantity: 'سماكة 18 سم + طبقة فايبر حراري 200 جرام',
    accessories: 'أرجل خشبي زان مقلوبة + أزرار كابيتونيه استراس ذهبي',
    customModifications: 'عمق الجلسة 65 سم بدلاً من 55 سم مع وسائد إضافية',
    customerNotes: 'مراجعة عينة القماش مع العميل قبل الشد والتنجيد النهائي',
    specialInstructions: 'تثبيت شريط السوست الصليب الإسباني تحت شاسيه الكنبة الكبيرة',
    attachments: [
      { id: 'att-3', name: 'عينة قماش مخمل إسباني كحلي.jpg', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', type: 'image' }
    ]
  },
  dining: {
    customerName: 'د. طارق مصطفى حسن',
    orderReference: 'SO-2026-740 (معرض الشيخ زايد)',
    color: 'دهان أستر بني جوزي دافئ',
    dimensions: 'طاولة 240×110 سم + 8 كراسي + بوفيه 220 سم',
    woodType: 'خشب زان أحمر للقرصة والكراسي + قشرة جوز تركي للبوفيه',
    paintType: 'أستر بوليستر لامع 80%',
    fabricType: 'كتان إسباني معالج نانو للمقاعد',
    fabricColor: 'رمادي عاجي #08',
    fabricQuantity: '12 متر طولي',
    foamType: 'إسفنج متوسط الكثافة ضغط 30',
    foamQuantity: 'سماكة 8 سم',
    accessories: 'زجاج القرصة فوميه 10 مم شفرة كومبيوتر + شريط استانلس ذهبي للبوفيه',
    customModifications: 'تعديل شكل ظهر الكرسي ليكون مائل 5 درجات للراحة',
    customerNotes: 'التسليم شامل تركيب قرصة الزجاج والبوفيه بالمنزل',
    specialInstructions: 'سنفرة حواف الزجاج بعناية فائقة وتجربة كراسي السفرة قبل الدهان',
    attachments: [
      { id: 'att-4', name: 'منظور السفرة والبوفيه الرخامي.jpg', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80', type: 'image' }
    ]
  },
  doors: {
    customerName: 'فندق وأجنحة الأهرام',
    orderReference: 'SO-2026-Door-12',
    color: 'بني شوكولاتة قشرة أرو',
    dimensions: 'ارتفاع 220 سم × عرض 100 سم (سمك الحلق 15 سم)',
    woodType: 'كبس السويدى 2 بوصة + قشرة أرو طبيعي وجهين',
    paintType: 'أستر بولي يوريثان مقاوم للخدش والعوامل الجوية',
    fabricType: 'بدون قماش (أبواب وتكسيات)',
    fabricColor: 'غير محدد',
    fabricQuantity: '0',
    foamType: 'بدون إسفنج',
    foamQuantity: '0',
    accessories: 'مفصلات استانلس 304 رولمان بلي + كوالين ألمانية هيدروليك + كالون ذكي',
    customModifications: 'حفر حفرية C/C بالراوتر مع شريط استانلس 1 سم ذهبي',
    customerNotes: 'مراجعة اتجاه الفتح (يمين لداخل) لكل باب قبل التجميع',
    specialInstructions: 'تغليف الحواف بشرائط فوم لحمايتها أثناء النقل والموقع',
    attachments: [
      { id: 'att-5', name: 'مخطط كبس وقاطوع الباب.pdf', url: 'https://images.unsplash.com/photo-1534349735944-2b3a6f7a268f?w=800&q=80', type: 'drawing' }
    ]
  }
};

// --- Form Component for Customer Specifications ---
export const CustomerSpecsForm: React.FC<{
  specs?: CustomerSpecifications;
  onChange: (updatedSpecs: CustomerSpecifications) => void;
}> = ({ specs: rawSpecs, onChange }) => {
  const specs: CustomerSpecifications = rawSpecs || {};
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentType, setNewAttachmentType] = useState<'image' | 'drawing' | 'pdf' | 'other'>('image');

  const updateField = (field: keyof CustomerSpecifications, value: any) => {
    onChange({ ...specs, [field]: value });
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = sampleCustomerSpecsPresets[presetKey];
    if (preset) {
      onChange({ ...preset });
    }
  };

  const addAttachment = () => {
    if (!newAttachmentUrl) return;
    const current = specs.attachments || [];
    onChange({
      ...specs,
      attachments: [
        ...current,
        {
          id: `att-${Date.now()}`,
          name: newAttachmentName || `مرفق ${current.length + 1}`,
          url: newAttachmentUrl,
          type: newAttachmentType,
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      ]
    });
    setNewAttachmentUrl('');
    setNewAttachmentName('');
  };

  const removeAttachment = (index: number) => {
    const current = specs.attachments || [];
    const updated = [...current];
    updated.splice(index, 1);
    onChange({ ...specs, attachments: updated });
  };

  return (
    <div className="space-y-5 bg-gradient-to-b from-amber-50/40 to-slate-50 p-5 rounded-2xl border border-amber-200/80">
      {/* Preset Quick Selection Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-amber-200/60 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-500 animate-pulse" />
            تحميل مواصفات عميل جاهزة من القوالب القياسية:
          </span>
          <Badge className="bg-amber-100 text-amber-800 border-none text-[10px] font-bold">
            14 خاصية مخصصة
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('bedroom')}
            className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-right transition-all flex flex-col"
          >
            <span className="text-xs font-black text-amber-950">🛏️ نوم فينيسيا</span>
            <span className="text-[10px] text-amber-700 font-bold">أرو طبيعي + دهان أستر</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('sofa')}
            className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-right transition-all flex flex-col"
          >
            <span className="text-xs font-black text-amber-950">🛋️ صوفا مخمل كحلي</span>
            <span className="text-[10px] text-amber-700 font-bold">إسفنج 38 + مخمل إسباني</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('dining')}
            className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-right transition-all flex flex-col"
          >
            <span className="text-xs font-black text-amber-950">🪑 سفرة مهراجا</span>
            <span className="text-[10px] text-amber-700 font-bold">زان أحمر + زجاج فوميه</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('doors')}
            className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-right transition-all flex flex-col"
          >
            <span className="text-xs font-black text-amber-950">🚪 باب أركيت قشرة</span>
            <span className="text-[10px] text-amber-700 font-bold">مقابض نحاس + استانلس</span>
          </button>
        </div>
      </div>

      {/* Basic Specs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <span>👤 اسم العميل والمرجع</span>
          </label>
          <Input 
            value={specs.customerName || ''}
            onChange={e => updateField('customerName', e.target.value)}
            placeholder="مثال: أحمد محمود العبد القادر"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <span>📄 رقم مرجع العقد / المبيعات</span>
          </label>
          <Input 
            value={specs.orderReference || ''}
            onChange={e => updateField('orderReference', e.target.value)}
            placeholder="مثال: SO-2026-882"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <Palette size={13} className="text-indigo-600" />
            <span>اللون والتطنيش مطلوب العميل</span>
          </label>
          <Input 
            value={specs.color || ''}
            onChange={e => updateField('color', e.target.value)}
            placeholder="مثال: أبيض لؤلؤي مط / بني جوزي"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <Ruler size={13} className="text-blue-600" />
            <span>المقاس والأبعاد المخصصة</span>
          </label>
          <Input 
            value={specs.dimensions || ''}
            onChange={e => updateField('dimensions', e.target.value)}
            placeholder="مثال: 200×180×60 سم"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <Hammer size={13} className="text-amber-700" />
            <span>نوع الخشب والقشرة</span>
          </label>
          <Input 
            value={specs.woodType || ''}
            onChange={e => updateField('woodType', e.target.value)}
            placeholder="مثال: زان أحمر روماني / أرو طبيعي"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <Sliders size={13} className="text-purple-600" />
            <span>نوع الدهان والتشطيب</span>
          </label>
          <Input 
            value={specs.paintType || ''}
            onChange={e => updateField('paintType', e.target.value)}
            placeholder="مثال: أستر بولي يوريثان / دوكو مط"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <Scissors size={13} className="text-rose-600" />
            <span>نوع القماش والكسوة</span>
          </label>
          <Input 
            value={specs.fabricType || ''}
            onChange={e => updateField('fabricType', e.target.value)}
            placeholder="مثال: مخمل إسباني / كتان معالج"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <span>🎨 لون القماش وطرازه</span>
          </label>
          <Input 
            value={specs.fabricColor || ''}
            onChange={e => updateField('fabricColor', e.target.value)}
            placeholder="مثال: كحلي ملكي #124"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <span>📏 كمية القماش (متر)</span>
          </label>
          <Input 
            value={specs.fabricQuantity || ''}
            onChange={e => updateField('fabricQuantity', e.target.value)}
            placeholder="مثال: 18 متر طولي"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <Box size={13} className="text-emerald-600" />
            <span>نوع وكثافة الإسفنج</span>
          </label>
          <Input 
            value={specs.foamType || ''}
            onChange={e => updateField('foamType', e.target.value)}
            placeholder="مثال: سوبر سوفت كثافة 38 / هارد 33"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <span>📦 كمية وسماكة الإسفنج</span>
          </label>
          <Input 
            value={specs.foamQuantity || ''}
            onChange={e => updateField('foamQuantity', e.target.value)}
            placeholder="مثال: سماكة 15 سم + فايبر 200 جرام"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <Wrench size={13} className="text-amber-600" />
            <span>الإكسسوارات والمقابض المحددة</span>
          </label>
          <Input 
            value={specs.accessories || ''}
            onChange={e => updateField('accessories', e.target.value)}
            placeholder="مثال: مقابض نحاس ذهبي + مفصلات بلوم"
            className="h-10 text-xs font-bold rounded-xl bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Textareas for Custom Modifications, Notes & Workshop Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <span>🛠️ تعديلات خاصة عن التصميم القياسي</span>
          </label>
          <Textarea 
            value={specs.customModifications || ''}
            onChange={e => updateField('customModifications', e.target.value)}
            placeholder="أدخل أي تعديل يطلبه العميل على موديل التصنيع القياسي..."
            rows={2}
            className="text-xs font-bold rounded-xl bg-white border-slate-200 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <span>📝 ملاحظات العميل الخاصة</span>
          </label>
          <Textarea 
            value={specs.customerNotes || ''}
            onChange={e => updateField('customerNotes', e.target.value)}
            placeholder="ملاحظات العميل ورغبات الشحن والاستلام..."
            rows={2}
            className="text-xs font-bold rounded-xl bg-white border-slate-200 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <span>⚠️ تعليمات ورشة التصنيع والأسطوات</span>
          </label>
          <Textarea 
            value={specs.specialInstructions || ''}
            onChange={e => updateField('specialInstructions', e.target.value)}
            placeholder="تعليمات رئيس الورشة والأسطوات بالمصنع..."
            rows={2}
            className="text-xs font-bold rounded-xl bg-white border-slate-200 resize-none"
          />
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Paperclip size={14} className="text-indigo-600" />
            المرفقات والصور والرسومات الهندسية وملفات PDF:
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            {(specs.attachments || []).length} مرفق مضاف
          </span>
        </div>

        {/* List of current attachments */}
        {(specs.attachments || []).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {specs.attachments?.map((att, idx) => (
              <div key={att.id || idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  {att.type === 'image' || att.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <img src={att.url} alt={att.name} className="w-9 h-9 rounded-md object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-black text-slate-800 truncate">{att.name}</p>
                    <a href={att.url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1">
                      <ExternalLink size={10} /> معاينة المرفق
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new attachment form */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <Input 
            value={newAttachmentName}
            onChange={e => setNewAttachmentName(e.target.value)}
            placeholder="عنوان المرفق (مثال: منظور السرير)"
            className="h-9 text-xs font-bold bg-slate-50 border-slate-200 sm:w-1/3"
          />
          <Input 
            value={newAttachmentUrl}
            onChange={e => setNewAttachmentUrl(e.target.value)}
            placeholder="رابط الصورة أو الملف (URL)"
            className="h-9 text-xs font-bold bg-slate-50 border-slate-200 flex-1"
          />
          <select
            value={newAttachmentType}
            onChange={e => setNewAttachmentType(e.target.value as any)}
            className="h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="image">صورة 🖼️</option>
            <option value="drawing">رسم هندسي 📐</option>
            <option value="pdf">ملف PDF 📄</option>
          </select>
          <Button
            type="button"
            onClick={addAttachment}
            disabled={!newAttachmentUrl}
            className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-lg shrink-0"
          >
            <Plus size={14} className="ml-1" /> إضافة
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Modal Component to View Full Specifications & Print Job Card ---
export const CustomerSpecsViewerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  order?: Partial<ManufacturingOrder> | Partial<WorkOrder> | null;
  specs?: CustomerSpecifications;
}> = ({ isOpen, onClose, order, specs: directSpecs }) => {
  const [copied, setCopied] = useState(false);
  const specs: CustomerSpecifications = directSpecs || order?.customerSpecs || (sampleCustomerSpecsPresets.bedroom as CustomerSpecifications) || {};

  if (!isOpen) return null;

  const moNumber = (order as any)?.moNumber || (order as any)?.woNumber || 'MO-2026-CUSTOM';
  const productName = order?.productName || 'منتج مخصص بمواصفات العميل';
  const quantity = order?.quantity || 1;

  const handleCopySpecs = () => {
    const text = `
===== مواصفات أمر التصنيع للعميل =====
رقم الأمر: ${moNumber}
اسم المنتج: ${productName} (الكمية: ${quantity})
العميل والمرجع: ${specs.customerName || 'غير محدد'} (${specs.orderReference || 'بدون'})
--------------------------------------
• اللون: ${specs.color || 'قياسي'}
• المقاس والأبعاد: ${specs.dimensions || 'قياسي'}
• نوع الخشب: ${specs.woodType || 'قياسي'}
• نوع الدهان: ${specs.paintType || 'قياسي'}
• نوع القماش: ${specs.fabricType || 'قياسي'}
• لون القماش: ${specs.fabricColor || 'قياسي'} (${specs.fabricQuantity || '0'} متر)
• الإسفنج والكثافة: ${specs.foamType || 'قياسي'} (سماكة: ${specs.foamQuantity || 'قياسي'})
• الإكسسوارات: ${specs.accessories || 'بدون'}
• تعديلات خاصة: ${specs.customModifications || 'بدون'}
• ملاحظات العميل: ${specs.customerNotes || 'بدون'}
• تعليمات الورشة: ${specs.specialInstructions || 'بدون'}
======================================
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[850px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-lg">
                ⭐ Customer Specifications
              </Badge>
              <Badge className="bg-indigo-600 text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-lg">
                {moNumber}
              </Badge>
            </div>
            <h3 className="text-xl font-black">{productName}</h3>
            <p className="text-slate-400 text-xs font-bold">
              العميل: <span className="text-white font-black">{specs.customerName || 'عميل المعرض'}</span> | المرجع: {specs.orderReference || 'N/A'} | الكمية: {quantity} قطعة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopySpecs}
              variant="outline"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl h-10 text-xs font-black"
            >
              {copied ? <Check size={16} className="text-emerald-400 ml-1" /> : <Copy size={16} className="ml-1" />}
              {copied ? 'تم النسخ!' : 'نسخ المواصفات'}
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-4 text-xs font-black shadow-md shadow-indigo-900"
            >
              <Printer size={16} className="ml-1.5" />
              طباعة كارت الورشة
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Comparison Banner: Standard vs Customer Custom Specs */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-indigo-50 p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">مواصفات طلب مخصصة (Customer Specific Order)</h4>
                <p className="text-slate-600 text-xs font-bold mt-0.5">
                  هذا الأمر يتجاوز المواصفات القياسية للمنتج ويحتوي على طلبات مخصصة بدقة للعميل
                </p>
              </div>
            </div>

            <Badge className="bg-amber-600 text-white font-black text-xs px-3 py-1 rounded-xl shrink-0">
              مواصفات ملزمة للورش
            </Badge>
          </div>

          {/* Cards Grid for Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Color & Paint */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-black text-xs border-b border-slate-200 pb-2">
                <Palette size={16} />
                <span>اللون والدهان والتشطيب</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-500 font-bold">اللون المطلـوب:</p>
                <p className="font-black text-slate-900 bg-white p-2 rounded-lg border border-slate-200">{specs.color || 'حسب الكتالوج القياسي'}</p>
                <p className="text-slate-500 font-bold pt-1">نوع الدهان والمعالجة:</p>
                <p className="font-black text-slate-800">{specs.paintType || 'قياسي'}</p>
              </div>
            </div>

            {/* Dimensions & Wood */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-black text-xs border-b border-slate-200 pb-2">
                <Ruler size={16} />
                <span>المقاسات ونوع الخشب</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-500 font-bold">الأبعاد والمقاسات:</p>
                <p className="font-black text-slate-900 bg-white p-2 rounded-lg border border-slate-200">{specs.dimensions || 'القياس المعياري للمصنع'}</p>
                <p className="text-slate-500 font-bold pt-1">نوع الخشب والقشرة:</p>
                <p className="font-black text-slate-800">{specs.woodType || 'قياسي'}</p>
              </div>
            </div>

            {/* Fabric & Upholstery */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-black text-xs border-b border-slate-200 pb-2">
                <Scissors size={16} />
                <span>القماش والكسوة والتنجيد</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-500 font-bold">نوع ولون القماش:</p>
                <p className="font-black text-slate-900 bg-white p-2 rounded-lg border border-slate-200">
                  {specs.fabricType || 'بدون'} ({specs.fabricColor || 'قياسي'})
                </p>
                <p className="text-slate-500 font-bold pt-1">كمية القماش المحسوبة:</p>
                <p className="font-black text-slate-800">{specs.fabricQuantity || '0'} متر</p>
              </div>
            </div>

            {/* Foam & Cushioning */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-black text-xs border-b border-slate-200 pb-2">
                <Box size={16} />
                <span>الإسفنج والكثافات</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-500 font-bold">نوع الإسفنج والكثافة:</p>
                <p className="font-black text-slate-900 bg-white p-2 rounded-lg border border-slate-200">{specs.foamType || 'قياسي'}</p>
                <p className="text-slate-500 font-bold pt-1">السماكة أو الكمية:</p>
                <p className="font-black text-slate-800">{specs.foamQuantity || 'قياسي'}</p>
              </div>
            </div>

            {/* Accessories */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-black text-xs border-b border-slate-200 pb-2">
                <Wrench size={16} />
                <span>الإكسسوارات والمقابض</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-500 font-bold">الإكسسوارات والمفصلات المحددة:</p>
                <p className="font-black text-slate-900 bg-white p-2 rounded-lg border border-slate-200">{specs.accessories || 'إكسسوارات المصنع القياسية'}</p>
              </div>
            </div>

            {/* Custom Modifications */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs border-b border-amber-200 pb-2">
                <Hammer size={16} />
                <span>التعديلات الخاصة عن التصميم</span>
              </div>
              <p className="text-xs font-black text-amber-950 bg-white p-2.5 rounded-lg border border-amber-200">
                {specs.customModifications || 'لا توجد تعديلات خاصة على الهيكل القياسي'}
              </p>
            </div>
          </div>

          {/* Customer & Workshop Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1">
              <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                <MessageSquare size={15} /> ملاحظات العميل للطلب:
              </span>
              <p className="text-xs font-bold text-slate-800 pt-1 leading-relaxed">
                {specs.customerNotes || 'لا توجد ملاحظات إضافية مسجلة للعميل.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1">
              <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                <ShieldAlert size={15} /> تعليمات ورشة التصنيع والأسطوات:
              </span>
              <p className="text-xs font-bold text-slate-800 pt-1 leading-relaxed">
                {specs.specialInstructions || 'اتباع أصول الصنعة وتطابق ألوان القشرة والدهان.'}
              </p>
            </div>
          </div>

          {/* Attachments & Drawings Gallery */}
          {(specs.attachments || []).length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Paperclip size={16} className="text-indigo-600" />
                المرفقات والرسومات الهندسية للطلب ({(specs.attachments || []).length}):
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {specs.attachments?.map((att, idx) => (
                  <div key={att.id || idx} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    {att.type === 'image' || att.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                      <div className="relative group overflow-hidden rounded-xl h-36 bg-slate-100">
                        <img src={att.url} alt={att.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <a 
                          href={att.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs gap-1"
                        >
                          <Eye size={16} /> تكبير ومعاينة
                        </a>
                      </div>
                    ) : (
                      <div className="h-36 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center p-4 text-center space-y-2">
                        <FileCode size={32} className="text-indigo-600" />
                        <span className="text-xs font-black text-indigo-950 truncate max-w-full">{att.name}</span>
                        <a 
                          href={att.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] bg-indigo-600 text-white font-black px-3 py-1 rounded-lg hover:bg-indigo-700"
                        >
                          تحميل PDF / Drawing
                        </a>
                      </div>
                    )}
                    <p className="text-xs font-black text-slate-800 truncate px-1">{att.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <Button variant="ghost" onClick={onClose} className="font-black text-slate-600 text-xs">
            إغلاق
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-6 font-black text-xs"
            >
              <Printer size={16} className="ml-1.5" />
              طباعة كارت التشغيل الميداني
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Badge Component to display Customer Specs Badge on cards/tables ---
export const CustomerSpecsBadge: React.FC<{
  specs?: CustomerSpecifications;
  onClick?: () => void;
  size?: 'sm' | 'md';
}> = ({ specs, onClick, size = 'md' }) => {
  if (!specs || Object.keys(specs).length === 0) return null;

  const hasCustomFields = !!(specs.color || specs.dimensions || specs.woodType || specs.fabricType || specs.customModifications);
  if (!hasCustomFields) return null;

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 rounded-xl font-black transition-all hover:scale-105 ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[10px] bg-amber-100 text-amber-900 border border-amber-300'
            : 'px-2.5 py-1 text-xs bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-xs'
        }`}
      >
        <Sparkles size={size === 'sm' ? 12 : 14} className="text-amber-200" />
        <span>مواصفات عميل خاصة</span>
      </button>
    </div>
  );
};
