import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FurnitureWorkOrder, CustomerPayment, Safe, Customer } from '../../../types';

export function useWorkOrdersData() {
  const [workOrders, setWorkOrders] = useState<FurnitureWorkOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [safes, setSafes] = useState<Safe[]>([]);
  const [whatsappDrafts, setWhatsappDrafts] = useState<any[]>([]);
  const [loadingManifests, setLoadingManifests] = useState<any[]>([]);
  const [deliveryReceipts, setDeliveryReceipts] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'workOrders'), (snap) => {
      setWorkOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as FurnitureWorkOrder)));
      setLoading(false);
    });
    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snap) => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer)));
    });
    const unsubCenters = onSnapshot(collection(db, 'costCenters'), (snap) => {
      setCostCenters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubPayments = onSnapshot(collection(db, 'customerPayments'), (snap) => {
      setCustomerPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerPayment)));
    });
    const unsubSafes = onSnapshot(collection(db, 'safes'), (snap) => {
      setSafes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Safe)));
    });
    const unsubDrafts = onSnapshot(collection(db, 'whatsappDrafts'), (snap) => {
      setWhatsappDrafts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubManifests = onSnapshot(collection(db, 'loadingManifests'), (snap) => {
      setLoadingManifests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubReceipts = onSnapshot(collection(db, 'deliveryReceipts'), (snap) => {
      setDeliveryReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubRecipes = onSnapshot(collection(db, 'recipes'), (snap) => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubDeliveryLogs = onSnapshot(collection(db, 'deliveryLogs'), (snap) => {
      setDeliveryLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubOrders();
      unsubCustomers();
      unsubCenters();
      unsubPayments();
      unsubSafes();
      unsubDrafts();
      unsubManifests();
      unsubReceipts();
      unsubRecipes();
      unsubDeliveryLogs();
    };
  }, []);

  const refresh = () => {
    // onSnapshot listener auto-updates state, this is provided for manual triggers
  };

  return {
    workOrders,
    customers,
    costCenters,
    customerPayments,
    safes,
    whatsappDrafts,
    loadingManifests,
    shippingManifests: loadingManifests,
    deliveryReceipts,
    recipes,
    deliveryLogs,
    loading,
    refresh
  };
}
