import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Save } from 'lucide-react';
import { BOM, Item } from '../types';

interface BOMManagerProps {
  items: Item[]; // الخامات المتاحة في المخزن
  saveBOM: (bom: BOM) => void;
}

export function BOMManager({ items, saveBOM }: BOMManagerProps) {
  const [productId, setProductId] = useState('');
  const [bomItems, setBomItems] = useState<{itemId: string, quantity: number}[]>([]);

  const addRow = () => setBomItems([...bomItems, { itemId: '', quantity: 0 }]);

  const updateRow = (index: number, field: string, value: any) => {
    const newItems = [...bomItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setBomItems(newItems);
  };

  return (
    <Card className="rounded-3xl border-0 shadow-xl p-6">
      <CardHeader><CardTitle>تعريف قائمة المواد (BOM)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="اسم/رقم المنتج النهائي" value={productId} onChange={(e) => setProductId(e.target.value)} />
        
        <div className="space-y-2">
          {bomItems.map((row, index) => (
            <div key={index} className="flex gap-2">
              <select className="flex-1 p-2 border rounded-lg" onChange={(e) => updateRow(index, 'itemId', e.target.value)}>
                <option value="">اختر الخامة...</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <Input type="number" className="w-24" placeholder="الكمية" onChange={(e) => updateRow(index, 'quantity', Number(e.target.value))} />
            </div>
          ))}
        </div>
        
        <Button onClick={addRow} variant="outline"><Plus size={16} className="mr-2"/>إضافة خامة</Button>
        <Button className="w-full font-black bg-slate-900" onClick={() => saveBOM({ id: Date.now().toString(), productId, items: bomItems, totalExpectedMaterialCost: 0 })}><Save size={16} className="mr-2"/>حفظ قائمة المواد</Button>
      </CardContent>
    </Card>
  );
}
