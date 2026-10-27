export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'OPERATOR';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponseDto {
  user: UserDto;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerDocument: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  items: OrderItemDto[];
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  customerId?: string;
  customerName: string;
  customerDocument: string;
  paymentMethod: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

// CRM Module Types
export type CustomerType = 'COMPANY' | 'INDIVIDUAL';
export type CustomerStatus = 'ACTIVE' | 'LEAD' | 'INACTIVE';

export interface CustomerDto {
  id: string;
  code: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  type: CustomerType;
  status: CustomerStatus;
  notes?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  document: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  type: CustomerType;
  status?: CustomerStatus;
  notes?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  type?: CustomerType;
  status?: CustomerStatus;
  notes?: string;
}

// Analytics Module Types
export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'all';

export interface AnalyticsBreakdownItem {
  label: string;
  revenue: number;
  ordersCount: number;
}

export interface TopProductItem {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export interface AnalyticsSummaryDto {
  period: AnalyticsPeriod;
  periodLabel: string;
  dateRange: {
    start: string;
    end: string;
  };
  totalOrders: number;
  totalRevenue: number;
  totalUnitsSold: number;
  averageTicket: number;
  breakdown: AnalyticsBreakdownItem[];
  topProducts: TopProductItem[];
  recentSales: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    itemCount: number;
    processedAt: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

export interface StoredProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerDocument: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  items: OrderItemDto[];
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCustomer {
  id: string;
  code: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  type: CustomerType;
  status: CustomerStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}


// Event Monitoring Types (Synchronous vs Asynchronous)
export type EventType = 'SYNC' | 'ASYNC';

export interface SystemEventDto {
  id: string;
  type: EventType;
  channel: string;
  name: string;
  source: string;
  target: string;
  details: string;
  latencyMs?: number;
  status: 'SUCCESS' | 'PROCESSED' | 'PENDING' | 'ERROR';
  timestamp: string;
}
