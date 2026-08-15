import React, { useState } from 'react';
import { FurnitureWorkOrder } from '../../types';
import { Card, Button } from './ui/WorkOrderCardUI';
import { Image as ImageIcon, FileText, Upload, Trash2, Eye, Link2, Plus } from 'lucide-react';

interface WorkOrderAttachmentsProps {
  order: FurnitureWorkOrder;
}

export function WorkOrderAttachments({ order }: WorkOrderAttachmentsProps) {
  const [attachments, setAttachments] = useState<string[]>(
    order.attachmentImage ? [order.attachmentImage] : []
  );
  const [contractImg, setContractImg] = useState<string | undefined>(order.contractImage);
  const [newUrl, setNewUrl] = useState('');

  const handleAddUrl = () => {
    if (!newUrl) return;
    setAttachments([...attachments, newUrl]);
    setNewUrl('');
  };

  const handleDeleteAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 uppercase tracking-wider">
            المرفقات والمخططات الرسمية 📄
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
            <ImageIcon size={22} className="text-purple-600" /> مركز المرفقات وكروت التصميم المصورة
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            إدارة الصور الفنية، صور العقد المعتمد، ومخططات التقطيع لأمر الشغل #{order.orderNumber}
          </p>
        </div>
      </div>

      {/* Add New Attachment URL */}
      <Card className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="إضافة رابط صورة أو كشف تقطيع (URL)..."
          className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-500"
        />
        <Button onClick={handleAddUrl} className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shrink-0 w-full sm:w-auto">
          <Plus size={16} className="ml-1" /> إضافة مرفق +
        </Button>
      </Card>

      {/* Contract & Technical Specs Attachments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Work Order Photo */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-3">
          <h4 className="font-black text-slate-800 text-sm border-b pb-3 flex items-center gap-2">
            <ImageIcon size={18} className="text-purple-600" /> صورة امر الشغل / كارت التصميم المصور
          </h4>

          {order.attachmentImage ? (
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={order.attachmentImage}
                alt="Attachment"
                className="w-full h-64 object-contain bg-slate-100"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <a
                  href={order.attachmentImage}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <Eye size={18} />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <ImageIcon size={36} className="mx-auto text-slate-300" />
              <p className="text-xs text-slate-400 font-bold">لا توجد صورة كارت تصميم مرفقة لهذا الأمر.</p>
            </div>
          )}
        </Card>

        {/* Contract Approved Image */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-3">
          <h4 className="font-black text-slate-800 text-sm border-b pb-3 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" /> صورة العقد المعتمد
          </h4>

          {contractImg ? (
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={contractImg}
                alt="Contract"
                className="w-full h-64 object-contain bg-slate-100"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <a
                  href={contractImg}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <Eye size={18} />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <FileText size={36} className="mx-auto text-slate-300" />
              <p className="text-xs text-slate-400 font-bold">لا توجد صورة عقد معتمد مرفقة بعد.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Other Attachments Gallery */}
      {attachments.length > 0 && (
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-4">
          <h4 className="font-black text-slate-800 text-sm border-b pb-3">
            معرض المرفقات الإضافية ({attachments.length})
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {attachments.map((url, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={url} alt={`Attachment ${idx}`} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white text-slate-900 rounded-full hover:bg-slate-100"
                  >
                    <Eye size={14} />
                  </a>
                  <button
                    onClick={() => handleDeleteAttachment(idx)}
                    className="p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
