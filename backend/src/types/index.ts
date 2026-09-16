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
