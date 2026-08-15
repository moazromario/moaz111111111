import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SYSTEM_CONSTANTS } from '../constants';
import { AuditLogEntry } from '../types';

export async function logAuditEvent(
  userId: string,
  userEmail: string,
  action: string,
  collectionName: string,
  documentId: string,
  metadata?: Record<string, any>
): Promise<string | null> {
  try {
    const logEntry: Omit<AuditLogEntry, 'id'> = {
      userId,
      userEmail,
      action,
      collectionName,
      documentId,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    };

    const docRef = await addDoc(
      collection(db, SYSTEM_CONSTANTS.FIRESTORE_COLLECTIONS.AUDIT_LOGS),
      logEntry
    );
    return docRef.id;
  } catch (error) {
    console.error('[AuditLogger] Failed to write audit log:', error);
    // Non-blocking logger error: return null so main business action isn't interrupted
    return null;
  }
}
