export interface FamilyMember {
  id: string
  name: string
  photo?: string
  profile: 'adult' | 'teen' | 'child'
  income?: number
  userId?: string
  familyId: string
}

export interface BankAccount {
  id: string
  bank: string
  agency: string
  account: string
  type: 'checking' | 'savings' | 'investment'
  balance: number
  memberId: string
  categoryId?: string
}

export interface FixedIncome {
  id: string
  name: string
  amount: number
  categoryId: string
  accountId: string
  memberId: string
  dueDay?: number
  frequency: string
  startDate?: string
  endDate?: string
  description?: string
  active: boolean
}

export interface CreditCard {
  id: string
  name: string
  limit: number
  used: number
  available: number
  bestDay: number
  dueDay: number
  memberId: string
  bankAccountId?: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  date: Date
  accountId: string
  memberId: string
  description?: string
  attachment?: string
  costCenterId?: string
  recurring?: boolean
}

export interface Category {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense'
}

export interface CostCenter {
  id: string
  name: string
  description?: string
  familyId: string
}

export interface RecurringBill {
  id: string
  name: string
  amount: number
  dueDay: number
  category: string
  accountId: string
  memberId: string
  status: 'paid' | 'pending'
  month: number
  year: number
}

export interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  month: number
  year: number
  familyId: string
}

export interface Goal {
  id: string
  name: string
  target: number
  saved: number
  deadline?: Date
  memberId: string
}

export interface Investment {
  id: string
  type: 'treasury' | 'cdb' | 'stock' | 'fii' | 'etf' | 'crypto' | 'pension'
  name: string
  amount: number
  profitability: number
  memberId: string
}

export interface Debt {
  id: string
  type: 'loan' | 'financing' | 'installment'
  description: string
  totalAmount: number
  remainingAmount: number
  interestRate: number
  installmentsTotal: number
  installmentsRemaining: number
  memberId: string
}

export interface FinancialDocument {
  id: string
  type: 'boleto' | 'invoice' | 'irpf' | 'statement' | 'contract' | 'receipt'
  name: string
  fileUrl: string
  date: Date
  memberId: string
}

export interface Subcategory {
  id: string
  name: string
  categoryId: string
}

export interface Tag {
  id: string
  name: string
  color?: string
  familyId?: string
}

export interface Transfer {
  id: string
  amount: number
  date: Date
  fromAccountId: string
  toAccountId: string
  memberId: string
  description?: string
}

export interface PaymentMethod {
  id: string
  name: string
  icon?: string
  familyId?: string
}

export interface Notification {
  id: string
  type: string
  enabled: boolean
  userId: string
  config?: Record<string, unknown>
}

export interface Permission {
  id: string
  memberId: string
  module: string
  canView: boolean
  canEdit: boolean
}
