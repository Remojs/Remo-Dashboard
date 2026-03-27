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

export interface PasswordRecord {
  id: string
  service: string
  username: string
  notes: string | null
  createdAt: string
  password?: string // only in decrypt endpoint
}

export interface Project {
  id: string
  clientName: string
  type: string
  price: string
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'idea' | 'pending' | 'in_progress' | 'done'
  assignedTo: string | null
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  assignee?: { id: string; name: string; email: string } | null
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

export interface Website {
  id: string
  name: string
  domain: string
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

// ── Passwords module ──────────────────────────────────────────────────────────
export const passwordsApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<PasswordRecord>>('/passwords', { params }),

  decrypt: (id: string) =>
    request<ApiResponse<PasswordRecord & { password: string }>>(`/passwords/${id}/decrypt`),

  create: (data: { service: string; username: string; password: string; notes?: string }) =>
    request<ApiResponse<PasswordRecord>>('/passwords', { method: 'POST', body: data }),

  update: (id: string, data: Partial<{ service: string; username: string; password: string; notes: string }>) =>
    request<ApiResponse<PasswordRecord>>(`/passwords/${id}`, { method: 'PUT', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/passwords/${id}`, { method: 'DELETE' }),
}

// ── Projects module ───────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<Project>>('/projects', { params }),

  create: (data: { clientName: string; type: string; price: number; status?: string }) =>
    request<ApiResponse<Project>>('/projects', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Project>) =>
    request<ApiResponse<Project>>(`/projects/${id}`, { method: 'PUT', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/projects/${id}`, { method: 'DELETE' }),

  getMonthlyRevenue: (year?: number) =>
    request<ApiResponse<MonthlyExpenses>>('/projects/monthly-revenue', { params: year ? { year } : {} }),
}

// ── Tasks module ──────────────────────────────────────────────────────────────
export const tasksApi = {
  getAll: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<Task>>('/tasks', { params }),

  create: (data: { title: string; description?: string; status?: string; assignedTo?: string; priority?: string }) =>
    request<ApiResponse<Task>>('/tasks', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Task>) =>
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

  create: (data: { name: string; domain: string }) =>
    request<ApiResponse<Website>>('/websites', { method: 'POST', body: data }),

  remove: (id: string) =>
    request<ApiResponse<null>>(`/websites/${id}`, { method: 'DELETE' }),

  getStatus: (id: string, params?: Record<string, string | number>) =>
    request<PaginatedResponse<WebsiteStatus>>(`/websites/${id}/status`, { params }),

  checkAll: () =>
    request<ApiResponse<WebsiteStatus[]>>('/websites/check', { method: 'POST' }),
}
