import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { FurnitureWorkOrder, CustomerPayment } from '../../../types';

export const workOrdersService = {
  // Work Orders CRUD
  async saveWorkOrder(formData: Partial<FurnitureWorkOrder>, editingOrderId?: string, profileName?: string) {
    if (!formData.customerId) {
      throw new Error('الرجاء اختيار العميل أولاً');
    }
    if (!formData.orderNumber) {
      throw new Error('الرجاء تعبئة رقم أمر الشغل');
    }

    const firstRoom = formData.rooms?.[0];
    const generalRoomCode = firstRoom?.roomCode || formData.roomCode || 'غرفة عامة';
    
    const finalData = {
      ...formData,
      roomCode: generalRoomCode,
      generalSpecs: firstRoom?.generalSpecs || formData.generalSpecs || '',
      dimensionsAndStructure: firstRoom?.dimensionsAndStructure || formData.dimensionsAndStructure || '',
      paintSpecs: firstRoom?.paintSpecs || formData.paintSpecs || '',
      upholsterySpecs: firstRoom?.upholsterySpecs || formData.upholsterySpecs || '',
      totalAmount: Number(formData.totalAmount) || 0,
      createdAt: new Date().toISOString(),
      createdBy: profileName || 'مستخدم النظام'
    };

    if (editingOrderId) {
      await updateDoc(doc(db, 'workOrders', editingOrderId), finalData);
      return editingOrderId;
    } else {
      const docRef = await addDoc(collection(db, 'workOrders'), finalData);
      return docRef.id;
    }
  },

  async deleteWorkOrder(id: string) {
    await deleteDoc(doc(db, 'workOrders', id));
  },

  async updateWorkOrderStatus(id: string, newStatus: string) {
    await updateDoc(doc(db, 'workOrders', id), { status: newStatus });
  },

  async updateWorkOrderRooms(orderId: string, rooms: any[], overallStatus?: string) {
    const updatePayload: any = { rooms };
    if (overallStatus) {
      updatePayload.status = overallStatus;
    }
    await updateDoc(doc(db, 'workOrders', orderId), updatePayload);
  },

  async updateRoomStatus(orderId: string, rooms: any[], overallStatus?: string) {
    return this.updateWorkOrderRooms(orderId, rooms, overallStatus);
  },

  // Customer Payments
  async addCustomerPayment(paymentData: {
    customerId: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    safeId?: string;
    notes?: string;
    date: string;
    createdBy?: string;
  }) {
    await addDoc(collection(db, 'customerPayments'), {
      ...paymentData,
      createdAt: new Date().toISOString()
    });
  },

  // Loading Manifests
  async createLoadingManifest(manifestData: any) {
    await addDoc(collection(db, 'loadingManifests'), {
      ...manifestData,
      createdAt: new Date().toISOString()
    });
  },

  // Delivery Logs & Returns
  async saveDeliveryLog(logData: any) {
    if (logData.id) {
      const { id, ...data } = logData;
      await updateDoc(doc(db, 'deliveryLogs', id), data);
      return id;
    } else {
      const docRef = await addDoc(collection(db, 'deliveryLogs'), {
        ...logData,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    }
  },

  async updateDeliveryLog(id: string, logData: any) {
    await updateDoc(doc(db, 'deliveryLogs', id), logData);
  },

  async deleteDeliveryLog(id: string) {
    await deleteDoc(doc(db, 'deliveryLogs', id));
  }
};
