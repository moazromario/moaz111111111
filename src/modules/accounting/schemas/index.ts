import { JournalVoucher, JournalEntryLine } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validateJournalVoucher(voucher: Omit<JournalVoucher, 'id'>): void {
  if (!voucher.voucherNumber?.trim()) {
    throw new ValidationError('رقم القيد مطلوب.');
  }

  if (!voucher.date) {
    throw new ValidationError('تاريخ القيد مطلوب.');
  }

  if (!voucher.lines || voucher.lines.length < 2) {
    throw new ValidationError('يجب أن يحتوي القيد المحاسبي على طرفين على الأقل (مدين ودائن).');
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (let i = 0; i < voucher.lines.length; i++) {
    const line = voucher.lines[i];
    if (!line.accountCode) {
      throw new ValidationError(`السطر رقم ${i + 1}: رقم الحساب المحاسبي مطلوب.`);
    }

    if (line.debit < 0 || line.credit < 0) {
      throw new ValidationError(`السطر رقم ${i + 1}: القيم المالية لا يمكن أن تكون بالسالب.`);
    }

    if (line.debit === 0 && line.credit === 0) {
      throw new ValidationError(`السطر رقم ${i + 1}: يجب تحديد قيمة للمدين أو الدائن.`);
    }

    totalDebit += Number(line.debit || 0);
    totalCredit += Number(line.credit || 0);
  }

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new ValidationError(`القيد غير متوازن. إجمالي المدين: ${totalDebit.toFixed(2)} ، إجمالي الدائن: ${totalCredit.toFixed(2)}`);
  }
}
