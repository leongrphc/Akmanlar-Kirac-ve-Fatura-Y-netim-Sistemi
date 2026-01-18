import { Decimal } from "@prisma/client/runtime/library";

// ==================== ENUM TYPES ====================

export type UserRole = "ADMIN" | "TENANT";

export type PaymentType = "RENT" | "ELECTRICITY" | "WATER" | "DUES" | "OTHER";

export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";

// ==================== MODEL TYPES ====================

export interface Company {
  id: string;
  name: string;
  floor: string | null;
  unit: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  rentAmount: Decimal | number;
  rentDueDay: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  companyId: string | null;
  company?: Company | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  companyId: string;
  company?: Company;
  type: PaymentType;
  amount: Decimal | number;
  dueDate: Date;
  paidDate: Date | null;
  paidAmount: Decimal | number | null;
  status: PaymentStatus;
  period: string;
  description: string | null;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  companyId: string;
  company?: Company;
  type: PaymentType;
  period: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  uploadedAt: Date;
}

// ==================== API TYPES ====================

export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalPending: number;
  totalOverdue: number;
  totalPaid: number;
  pendingAmount: number;
  overdueAmount: number;
  paidAmount: number;
}

export interface CompanyWithPayments extends Company {
  payments: Payment[];
  _count?: {
    payments: number;
  };
}

export interface CompanySummary {
  id: string;
  name: string;
  floor: string | null;
  unit: string | null;
  rentAmount: number;
  lastPaymentStatus: PaymentStatus | null;
  overdueCount: number;
  pendingAmount: number;
}

// ==================== FORM TYPES ====================

export interface CompanyFormData {
  name: string;
  floor?: string;
  unit?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  rentAmount: number;
  rentDueDay: number;
}

export interface PaymentFormData {
  companyId: string;
  type: PaymentType;
  amount: number;
  dueDate: Date;
  period: string;
  description?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
