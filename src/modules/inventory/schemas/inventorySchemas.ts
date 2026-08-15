import { StockTransaction, StockTransactionType } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export const VALID_TRANSACTION_TYPES: StockTransactionType[] = [
  'OPENING',
  'PURCHASE_RECEIPT',
  'PURCHASE_RETURN',
  'ISSUE',
  'WASTE',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'PRODUCTION_RECEIPT',
  'SALES_ISSUE',
  'STOCK_ADJUSTMENT'
];

export function validateStockTransactionSchema(tx: Omit<StockTransaction, 'id'>): void {
  if (!tx.transactionNo || !tx.transactionNo.trim()) {
    throw new ValidationError('رقم الحركة مطلوب.');
  }
  if (!tx.itemId) {
    throw new ValidationError('معرّف الصنف مطلوب.');
  }
  if (!tx.warehouseId) {
    throw new ValidationError('معرّف المخزن مطلوب.');
  }
  if (tx.quantity <= 0) {
    throw new ValidationError('كمية الحركة يجب أن تكون أكبر من صفر.');
  }
  if (tx.unitCost < 0) {
    throw new ValidationError('تكلفة الوحدة لا يمكن أن تكون بالسالب.');
  }
  if (!tx.transactionType || !VALID_TRANSACTION_TYPES.includes(tx.transactionType)) {
    throw new ValidationError(`نوع الحركة غير صالح: ${tx.transactionType}`);
  }
  if (!tx.createdBy || !tx.createdBy.trim()) {
    throw new ValidationError('مستخدم الحركة (الاعتماد المالي والتحقق) مطلوب.');
  }
}

export const inventorySchemas = {
  validateStockTransactionSchema
};
