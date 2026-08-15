export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly details?: Record<string, any>;

  constructor(message: string, code: ErrorCode = ErrorCode.INTERNAL_ERROR, httpStatus: number = 500, details?: Record<string, any>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'خطأ في التحقق من البيانات المدخلة', details?: Record<string, any>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'يرجى تسجيل الدخول للوصول لهذه الخدمة') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'عفواً، لا تملك الصلاحية الكافية لتنفيذ هذا الإجراء') {
    super(message, ErrorCode.FORBIDDEN, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'العنصر المطلوب غير موجود') {
    super(message, ErrorCode.NOT_FOUND, 404);
  }
}

export class InsufficientStockError extends AppError {
  constructor(itemName: string, available: number, requested: number) {
    super(
      `الرصيد غير كافٍ للصنف (${itemName}). المتاح: ${available}، المطلوب: ${requested}`,
      ErrorCode.INSUFFICIENT_STOCK,
      400,
      { itemName, available, requested }
    );
  }
}

export class InsufficientFundsError extends AppError {
  constructor(safeName: string, available: number, requested: number) {
    super(
      `الرصيد المالي غير كافٍ في الخزينة (${safeName}). المتاح: ${available}، المطلوب: ${requested}`,
      ErrorCode.INSUFFICIENT_FUNDS,
      400,
      { safeName, available, requested }
    );
  }
}
