
export enum CompanyId {
  MMT = 'MMT',
  EB_DESIGN = 'EB_DESIGN',
  EB_CONCEPT = 'EB_CONCEPT',
  EB_GROUP = 'EB_GROUP'
}

export interface Company {
  id: string; 
  name: string;
  fullName: string;
  description: string;
  color: string;
  commercialRegister?: string;
  taxNumber?: string;
  address?: string;
  phone?: string;
  poBox?: string;
}

export interface CompanyHRSettings {
  companyId: string;
  workStartTime: string; // HH:mm
  workEndTime: string;   // HH:mm
  allowedDelayMinutes: number;
  delayPenaltyAmount: number; 
  absencePenaltyRate: number; 
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export enum ProjectType {
  RESIDENTIAL = 'سكني',
  ENTERTAINMENT = 'ترفيهي',
  ADMINISTRATIVE = 'إداري',
  INDUSTRIAL = 'صناعي',
  COMMERCIAL = 'تجاري'
}

export type DocumentCategory = 
  'CONTRACT' | 
  'PLAN' | 
  'LETTER' | 
  'OTHER' | 
  'ARCHITECTURAL' | 
  'STRUCTURAL' | 
  'MECHANICAL' | 
  'ELECTRICAL' | 
  'INTERIOR' | 
  'EXTERIOR' |
  'LICENSE' |
  'DEED' |
  'INSURANCE' |
  'DELEGATION' |
  'ACKNOWLEDGMENT';

export interface DocumentItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf';
  category?: DocumentCategory;
  date: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  nationalId?: string;
  idImage?: string | File;
  licenseNumber: string;
  licenseImage?: string | File;
  projectType: ProjectType;
  documents?: DocumentItem[];
}

export interface ProjectItem {
  id: string;
  description: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  progress: number; 
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ProjectPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidDate?: string;
  confirmedBy?: string;
}

export interface ProjectDocuments {
  contract?: string;
  plans?: string;
  specifications?: string;
  permits?: string[];
  other?: string[];
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  items: ProjectItem[];
  payments?: ProjectPayment[];
  companyId: string; 
  assignedEmployeeIds?: string[];
  documents?: ProjectDocuments;
  extraDocuments?: DocumentItem[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
}

export interface PaymentOrder {
  id: string;
  code: string;
  date: string;
  projectId: string;
  projectItemId: string; 
  recipientId?: string; 
  recipient: string;
  amount: number;
  paymentMethod: 'CASH' | 'CHECK' | 'TRANSFER';
  paidFromAccountId?: string; 
  description: string;
  companyId: string;
  status: 'DRAFT' | 'APPROVED' | 'PAID' | 'PENDING_EXCEPTION' | 'REJECTED';
  exceptionReason?: string;
  overrunAmount?: number;
  linkedJournalEntryId?: string; 
}

export interface PriceOfferItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PriceOffer {
  id: string;
  code: string;
  companyId: string;
  clientId: string;
  date: string;
  validDays: number;
  items: PriceOfferItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  companyManagerApproved?: { name: string, date: string };
  approvedBy?: string;
}

export type UserRole = 'ADMIN' | 'COMPANY_MANAGER' | 'DEPT_MANAGER' | 'SUPERVISOR' | 'EMPLOYEE' | 'WORKER';
export type UsageMode = 'FULL' | 'ADD_ONLY';

export interface Notification {
  id: string;
  message: string;
  date: string;
  isRead: boolean;
  projectId?: string;
  relatedId?: string;
}

export interface Employee {
  id: string;
  employeeCode: string; 
  name: string;
  idNumber: string; 
  idExpiryDate?: string; 
  insuranceExpiryDate?: string; 
  contractExpiryDate?: string; 
  phone?: string; 
  email: string;
  role: string; 
  department: string; 
  salary: number;
  loanBalance: number; 
  vacationBalance: number; 
  companyId: string; 
  username?: string;
  password?: string;
  permissionRole: UserRole; 
  permissions?: string[]; 
  personalPhoto?: string;
  notifications?: Notification[];
  degreeDocument?: string;
  contractDocument?: string;
  canLogin: boolean;
  usageMode: UsageMode;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // ISO Time
  checkOut?: string; // ISO Time
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE';
  notes?: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  companyId?: string; 
  avatar?: string;
  permissions?: string[];
  usageMode: UsageMode;
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number; 
  companyId: string; 
  bankName?: string;
  iban?: string;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  description?: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  code: string;
  date: string;
  reference: string;
  description: string;
  lines: JournalEntryLine[];
  companyId: string; 
  status: 'DRAFT' | 'POSTED';
  totalDebit: number;
  totalCredit: number;
  relatedEntityId?: string; 
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  companyId: string;
  qrData?: string;
}

export interface Expense {
  id: string;
  reference: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  projectId?: string;
  paidByAccountId: string;
  companyId: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  location: string;
  companyId: string; 
}

export interface PurchaseOrder {
  id: string;
  code: string;
  projectId?: string;
  supplierId?: string; 
  supplier: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'RECEIVED';
  totalAmount: number;
  items: any[];
  companyId: string; 
}

export type CorrespondenceType = 'INCOMING' | 'OUTGOING';

export interface Correspondence {
  id: string;
  referenceNumber: string;
  type: CorrespondenceType;
  companyId: string;
  projectId?: string;
  date: string;
  subject: string;
  senderOrRecipient: string;
  content?: string;
  attachments: string[];
  status: 'PENDING' | 'ARCHIVED';
}

export type VoucherType = 'RECEIPT' | 'PAYMENT';

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  date: string;
  amount: number;
  partyName: string;
  description: string;
  accountId: string;
  companyId: string;
}

export interface CustodyTransaction {
  id: string;
  date: string;
  amount: number;
  projectId: string;
  projectItemId: string; 
  description: string;
  invoiceImage?: string;
  linkedJournalEntryId?: string;
}

export interface Custody {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  description: string;
  status: 'ACTIVE' | 'RETURNED';
  returnDate?: string;
  companyId: string;
  projectId?: string; 
  transactions?: CustodyTransaction[]; 
}

export interface Supplier {
    id: string;
    name: string;
    type: 'SUPPLIER' | 'CONTRACTOR';
    phone: string;
    service: string;
    companyId: string;
    bankName?: string;
    iban?: string;
}

export interface ReportItem {
  id: string;
  description: string;
  completedQty?: number;
  unit?: string;
  progressPercentage: number;
  notes?: string;
}

export interface DailyReport {
  id: string;
  code: string;
  companyId: string;
  projectId: string;
  date: string;
  engineerName: string;
  items: ReportItem[];
  images: string[];
  notes?: string;
  status: 'DRAFT' | 'APPROVED';
  siteEngineerApproval?: { name: string; date: string; status: boolean };
  companyManagerApproval?: { name: string; date: string; status: boolean };
}

export interface PlanDeliveryItem {
  id: string;
  name: string;
  copies: number;
  received: boolean;
}

export interface PlanDelivery {
  id: string;
  projectId: string;
  date: string;
  recipientName: string;
  items: PlanDeliveryItem[];
}
