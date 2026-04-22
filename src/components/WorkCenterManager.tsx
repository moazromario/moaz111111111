import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Plus } from 'lucide-react';
import { WorkCenter } from '../types';

interface WorkCenterManagerProps {
  saveWorkCenter: (wc: WorkCenter) => void;
}

export function WorkCenterManager({ saveWorkCenter }: WorkCenterManagerProps) {
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);

  return (
    <Card className="rounded-3xl border-0 shadow-xl p-6">
      <CardHeader><CardTitle>تعريف مراكز العمل (التحكم في تكلفة المصنعية)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="اسم مركز العمل (مثال: نجار، دهان)..." value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="number" placeholder="تكلفة الساعة (بالعملة)..." value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} />
        <Button className="w-full font-black bg-slate-900" onClick={() => saveWorkCenter({ id: Date.now().toString(), name, hourlyRate })}>
            <Save size={16} className="mr-2"/>حفظ مركز العمل
        </Button>
      </CardContent>
    </Card>
  );
}
