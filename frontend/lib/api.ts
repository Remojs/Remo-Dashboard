/**
 * Central API client for the Interaktive Admin Dashboard.
 * All requests include the JWT Bearer token from the auth cookie.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// ── Cookie helpers ────────────────────────────────────────────────────────────
export const TOKEN_KEY = 'iad-token'

export function getToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function setToken(token: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Strict`
}

export function removeToken() {
  document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

// ── Core fetcher ──────────────────────────────────────────────────────────────
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  noAuth?: boolean
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, noAuth = false } = options

  const url = new URL(`${BASE_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, String(v))
    })
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (!noAuth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    removeToken()
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Session expired.')
  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`)
  }

  return data as T
}

// ── Response types ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// ── Domain types ──────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface Email {
  id: string
  userId: string | null
  type: 'personal' | 'shared'
  from: string
  subject: string
  body: string
  isRead: boolean
  createdAt: string
  user?: { id: string; name: string; email: string } | null
}

export interface PasswordGroup {
  id: string
  name: string
  userId: string
  createdAt: string
  _count?: { passwords: number }
}

export interface PasswordRecord {
  id: string
  service: string
  username: string
  notes: string | null
  groupId: string | null
  createdAt: string
  password?: string // only in decrypt endpoint
}

export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  description: string
  amount: string
  category: string
  date: string | null
  createdAt: string
}

export interface MonthlyExpenses {
  year: number
  grandTotal: number
  monthly: Array<{ month: number; monthName: string; total: number }>
}

export interface Income {
  id: string
  description: string
  amount: number
  source: string
  date: string
  createdAt: string
}

export interface MonthlyIncomes {
  year: number
  grandTotal: number
  monthly: Array<{ month: number; monthName: string; total: number }>
}

export interface Website {
  id: string
  name: string
  domain: string
  type: 'frontend' | 'backend'
  createdAt: string
  statuses?: WebsiteStatus[]
}

export interface WebsiteStatus {
  id: string
  websiteId: string
  frontendStatus: 'online' | 'slow' | 'offline'
  backendStatus: 'online' | 'slow' | 'offline'
  responseTime: number | null
  ttfb: number | null
  uptimePercentage: number | null
  checkedAt: string
}

export interface ToolItem {
  id: string
  name: string
  description: string
  url: string
  color: string
  emoji: string
  createdAt: string
}

export interface AdminDashboardItem {
  id: string
  name: string
  description: string
  url: string
  color: string
  emoji: string
  createdAt: string
}

export interface DebtPayment {
  id: string
  debtId: string
  amount: number
  note: string | null
  createdAt: string
}

export interface Debt {
  id: string
  name: string
  totalAmount: number
  userId: string
  createdAt: string
  payments: DebtPayment[]
}

// ── Auth module ───────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: { email, password },
      noAuth: true,
    }),

  me: () => request<ApiResponse<User>>('/auth/me'),
}

// ── Users module ──────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<User>>('/users', { params }),

  create: (data: { name: string; email: string; password: string; role?: string }) =>
    request<ApiResponse<User>>('/users', { method: 'POST', body: data }),

  update: (id: string, data: Partial<User>) =>
    request<ApiResponse<User>>(`/users/${id}`, { method: 'PUT', body: data }),

  updateRole: (id: string, role: 'admin' | 'user') =>
    request<ApiResponse<User>>(`/users/${id}/role`, { method: 'PATCH', body: { role } }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/users/${id}`, { method: 'DELETE' }),
}

// ── Emails module ─────────────────────────────────────────────────────────────
export const emailsApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<Email>>('/emails', { params }),

  create: (data: { from: string; subject: string; body: string; type?: string; userId?: string }) =>
    request<ApiResponse<Email>>('/emails', { method: 'POST', body: data }),

  markRead: (id: string) =>
    request<ApiResponse<Email>>(`/emails/${id}/read`, { method: 'PUT' }),
}

// ── Password groups module ────────────────────────────────────────────────────
export const passwordGroupsApi = {
  getAll: () =>
    request<ApiResponse<PasswordGroup[]>>('/password-groups'),

  create: (data: { name: string }) =>
    request<ApiResponse<PasswordGroup>>('/password-groups', { method: 'POST', body: data }),

  update: (id: string, data: { name: string }) =>
    request<ApiResponse<PasswordGroup>>(`/password-groups/${id}`, { method: 'PUT', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/password-groups/${id}`, { method: 'DELETE' }),
}

// ── Passwords module ──────────────────────────────────────────────────────────
export const passwordsApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<PasswordRecord>>('/passwords', { params }),

  decrypt: (id: string) =>
    request<ApiResponse<PasswordRecord & { password: string }>>(`/passwords/${id}/decrypt`),

  create: (data: { service: string; username: string; password: string; notes?: string; groupId?: string }) =>
    request<ApiResponse<PasswordRecord>>('/passwords', { method: 'POST', body: data }),

  update: (id: string, data: Partial<{ service: string; username: string; password: string; notes: string; groupId: string | null }>) =>
    request<ApiResponse<PasswordRecord>>(`/passwords/${id}`, { method: 'PUT', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/passwords/${id}`, { method: 'DELETE' }),
}

// ── Tasks module ──────────────────────────────────────────────────────────────
export const tasksApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<Task>>('/tasks', { params }),

  create: (data: { title: string; description?: string }) =>
    request<ApiResponse<Task>>('/tasks', { method: 'POST', body: data }),

  update: (id: string, data: Partial<{ title: string; description: string | null; completed: boolean }>) =>
    request<ApiResponse<Task>>(`/tasks/${id}`, { method: 'PUT', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/tasks/${id}`, { method: 'DELETE' }),
}

// ── Expenses module ───────────────────────────────────────────────────────────
export const expensesApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<Expense>>('/expenses', { params }),

  getMonthly: (year?: number) =>
    request<ApiResponse<MonthlyExpenses>>('/expenses/monthly', { params: year ? { year } : {} }),

  create: (data: { description: string; amount: number; category: string; date?: string }) =>
    request<ApiResponse<Expense>>('/expenses', { method: 'POST', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/expenses/${id}`, { method: 'DELETE' }),
}

// ── Websites module ───────────────────────────────────────────────────────────
export const websitesApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<Website>>('/websites', { params }),

  create: (data: { name: string; domain: string; type: 'frontend' | 'backend' }) =>
    request<ApiResponse<Website>>('/websites', { method: 'POST', body: data }),

  update: (id: string, data: { name?: string; domain?: string; type?: 'frontend' | 'backend' }) =>
    request<ApiResponse<Website>>(`/websites/${id}`, { method: 'PATCH', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/websites/${id}`, { method: 'DELETE' }),

  getStatus: (id: string, params?: Record<string, string | number>) =>
    request<PaginatedResponse<WebsiteStatus>>(`/websites/${id}/status`, { params }),

  checkAll: () =>
    request<ApiResponse<WebsiteStatus[]>>('/websites/check', { method: 'POST' }),
}

// ── Tools module ──────────────────────────────────────────────────────────────
export const toolsApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<ToolItem>>('/tools', { params }),

  create: (data: { name: string; description?: string; url: string; color: string; emoji: string }) =>
    request<ApiResponse<ToolItem>>('/tools', { method: 'POST', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/tools/${id}`, { method: 'DELETE' }),
}

// ── Admin dashboards module ───────────────────────────────────────────────────
export const adminDashboardsApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<AdminDashboardItem>>('/admin-dashboards', { params }),

  create: (data: { name: string; description?: string; url: string; color: string; emoji: string }) =>
    request<ApiResponse<AdminDashboardItem>>('/admin-dashboards', { method: 'POST', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/admin-dashboards/${id}`, { method: 'DELETE' }),
}
// ── Debts module ─────────────────────────────────────────────────
export const debtsApi = {
  getAll: () =>
    request<ApiResponse<Debt[]>>('/debts'),

  create: (data: { name: string; totalAmount: number }) =>
    request<ApiResponse<Debt>>('/debts', { method: 'POST', body: data }),

  update: (id: string, data: { name?: string; totalAmount?: number }) =>
    request<ApiResponse<Debt>>(`/debts/${id}`, { method: 'PUT', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/debts/${id}`, { method: 'DELETE' }),

  addPayment: (debtId: string, data: { amount: number; note?: string }) =>
    request<ApiResponse<DebtPayment>>(`/debts/${debtId}/payments`, { method: 'POST', body: data }),

  deletePayment: (debtId: string, paymentId: string) =>
    request<ApiResponse<null>>(`/debts/${debtId}/payments/${paymentId}`, { method: 'DELETE' }),
}

// ── Income module ─────────────────────────────────────────────────
export const incomeApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<Income>>('/incomes', { params }),

  getMonthly: (year?: number) =>
    request<ApiResponse<MonthlyIncomes>>('/incomes/monthly', { params: year ? { year } : {} }),

  create: (data: { description: string; amount: number; source: string; date?: string }) =>
    request<ApiResponse<Income>>('/incomes', { method: 'POST', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/incomes/${id}`, { method: 'DELETE' }),
}