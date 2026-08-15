import { DocumentStatus } from '../../../types';

export class WorkflowService {
  private static allowedTransitions: Record<DocumentStatus, DocumentStatus[]> = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['APPROVED', 'DRAFT'],
    APPROVED: ['POSTED', 'DRAFT'],
    POSTED: ['CANCELLED'],
    CLOSED: [],
    CANCELLED: ['REVERSAL'],
    REVERSAL: ['CLOSED'],
  };

  static validateTransition(current: DocumentStatus, next: DocumentStatus): void {
    if (!this.allowedTransitions[current]?.includes(next)) {
      throw new Error(`انتقال الحالة غير مسموح: ${current} -> ${next}`);
    }
  }
}
