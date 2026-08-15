import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  WithFieldValue
} from 'firebase/firestore';
import { db } from '../../firebase';
import { AppError, ErrorCode, NotFoundError } from '../../core/errors/AppError';

export class BaseRepository<T extends { id?: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollectionRef() {
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  async getAll(): Promise<T[]> {
    try {
      const snap = await getDocs(this.getCollectionRef());
      return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as unknown as T));
    } catch (err: any) {
      throw new AppError(
        `فشل في جلب البيانات من ${this.collectionName}: ${err.message}`,
        ErrorCode.TRANSACTION_FAILED
      );
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const docSnap = await getDoc(this.getDocRef(id));
      if (!docSnap.exists()) {
        return null;
      }
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as unknown as T;
    } catch (err: any) {
      throw new AppError(
        `فشل في جلب العنصر (${id}) من ${this.collectionName}: ${err.message}`,
        ErrorCode.TRANSACTION_FAILED
      );
    }
  }

  async findWhere(field: string, operator: any, value: any): Promise<T[]> {
    try {
      const q = query(this.getCollectionRef(), where(field, operator, value));
      const snap = await getDocs(q);
      return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as unknown as T));
    } catch (err: any) {
      throw new AppError(
        `فشل في الاستعلام عن ${this.collectionName}: ${err.message}`,
        ErrorCode.TRANSACTION_FAILED
      );
    }
  }

  async create(data: Omit<T, 'id'>, customId?: string): Promise<T> {
    try {
      const timestamp = new Date().toISOString();
      const payload = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      if (customId) {
        const docRef = this.getDocRef(customId);
        await setDoc(docRef, payload);
        return { id: customId, ...payload } as unknown as T;
      } else {
        const docRef = await addDoc(this.getCollectionRef(), payload as WithFieldValue<DocumentData>);
        return { id: docRef.id, ...payload } as unknown as T;
      }
    } catch (err: any) {
      throw new AppError(
        `فشل إضافة عنصر جديد في ${this.collectionName}: ${err.message}`,
        ErrorCode.TRANSACTION_FAILED
      );
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      const timestamp = new Date().toISOString();
      await updateDoc(docRef, {
        ...data,
        updatedAt: timestamp
      } as any);
    } catch (err: any) {
      throw new AppError(
        `فشل تحديث العنصر (${id}) في ${this.collectionName}: ${err.message}`,
        ErrorCode.TRANSACTION_FAILED
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      await deleteDoc(docRef);
    } catch (err: any) {
      throw new AppError(
        `فشل حذف العنصر (${id}) من ${this.collectionName}: ${err.message}`,
        ErrorCode.TRANSACTION_FAILED
      );
    }
  }

  subscribeAll(onData: (items: T[]) => void, onError?: (err: Error) => void): () => void {
    return onSnapshot(
      this.getCollectionRef(),
      (snap) => {
        const items = snap.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as unknown as T));
        onData(items);
      },
      (err) => {
        console.error(`Subscription error on ${this.collectionName}:`, err);
        if (onError) onError(err);
      }
    );
  }
}
