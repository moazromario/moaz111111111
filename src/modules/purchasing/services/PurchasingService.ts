import { purchasesRepo, supplierPaymentsRepo } from '../repositories/PurchasingRepository';
import { PurchaseInvoice, SupplierPayment } from '../types';
import { validatePurchaseInvoice, validateSupplierPayment } from '../schemas';
import { inventoryService } from '../../inventory/services/InventoryService';

export class PurchasingService {
  async getInvoices(): Promise<PurchaseInvoice[]> {
    return await purchasesRepo.getAll();
  }

  async createInvoice(invoice: Omit<PurchaseInvoice, 'id'>): Promise<PurchaseInvoice> {
    validatePurchaseInvoice(invoice);

    const createdInvoice = await purchasesRepo.create(invoice);

    // Increment inventory quantity for received items
    if (invoice.status === 'received') {
      for (const item of invoice.items) {
        if (item.itemId) {
          await inventoryService.updateItemQuantity(item.itemId, item.quantity);
        }
      }
    }

    return createdInvoice;
  }

  async createPayment(payment: Omit<SupplierPayment, 'id'>): Promise<SupplierPayment> {
    validateSupplierPayment(payment);
    return await supplierPaymentsRepo.create(payment);
  }
}

export const purchasingService = new PurchasingService();
