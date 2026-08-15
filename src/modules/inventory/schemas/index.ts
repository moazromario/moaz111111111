import { InventoryItem, StockIssuance, StockTransaction } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validateInventoryItem(item: Omit<InventoryItem, 'id'>): void {
  if (!item.name?.trim()) {
    throw new ValidationError('اسم الصنف مطلوب.');
  }
  if (!item.code?.trim()) {
    throw new ValidationError('كود الصنف مطلوب.');
  }
  if (item.quantity < 0) {
    throw new ValidationError('الكمية لا يمكن أن تكون بالسالب.');
  }
}

export function validateStockIssuance(issuance: Omit<StockIssuance, 'id'>): void {
  if (!issuance.items || issuance.items.length === 0) {
    throw new ValidationError('إذن الصرف يجب أن يحتوي على صنف واحد على الأقل.');
  }
  for (const item of issuance.items) {
    if (item.quantity <= 0) {
      throw new ValidationError(`الكمية المنصوبة للصنف (${item.itemName}) يجب أن تكون أكبر من صفر.`);
    }
  }
}

export function validateStockTransaction(tx: Omit<StockTransaction, 'id'>): void {
  if (!tx.transactionNo?.trim()) {
    throw new ValidationError('رقم حركة المخزن مطلوب.');
  }
  if (!tx.itemId) {
    throw new ValidationError('معرّف الصنف مطلوب.');
  }
  if (!tx.warehouseId) {
    throw new ValidationError('معرّف المخزن مطلوب.');
  }
  if (tx.quantity <= 0) {
    throw new ValidationError('الكمية يجب أن تكون أكبر من صفر.');
  }
}

export { validateStockTransactionSchema, VALID_TRANSACTION_TYPES } from './inventorySchemas';
export { inventorySchemas } from './inventorySchemas';

