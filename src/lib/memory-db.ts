export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'OPERATOR';
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
  paymentMethod: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  items: Array<{
    id: string;
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

declare global {
  var __erp_memory_db: {
    users: StoredUser[];
    products: StoredProduct[];
    orders: StoredOrder[];
  } | undefined;
}

if (!global.__erp_memory_db) {
  global.__erp_memory_db = {
    users: [
      {
        id: 'usr-1',
        email: 'admin@erp.local',
        name: 'Super Admin ERP',
        role: 'ADMIN',
        password: 'Admin123!',
      },
      {
        id: 'usr-2',
        email: 'contador@erp.local',
        name: 'Contador General',
        role: 'ACCOUNTANT',
        password: 'Accountant123!',
      },
      {
        id: 'usr-3',
        email: 'operador@erp.local',
        name: 'Operador de Almacén',
        role: 'OPERATOR',
        password: 'Operator123!',
      },
    ],
    products: [
      {
        id: 'prod-1',
        sku: 'LAP-001',
        name: 'Laptop Dell Latitude 5440 i7 16GB 512GB SSD',
        description: 'Portátil empresarial de alto rendimiento',
        price: 1250.0,
        stock: 45,
        category: 'Tecnología',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-2',
        sku: 'MOU-002',
        name: 'Mouse Inalámbrico Logitech MX Master 3S',
        description: 'Mouse ergonómico para productividad',
        price: 99.9,
        stock: 120,
        category: 'Periféricos',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-3',
        sku: 'MON-003',
        name: 'Monitor LG UltraWide 34 Pulgadas QHD',
        description: 'Monitor curvo IPS con conexión USB-C',
        price: 499.5,
        stock: 25,
        category: 'Pantallas',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-4',
        sku: 'KEY-004',
        name: 'Teclado Mecánico Keychron K2 V2 RGB',
        description: 'Teclado inalámbrico Bluetooth Mac/Windows',
        price: 85.0,
        stock: 60,
        category: 'Periféricos',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-5',
        sku: 'CHA-005',
        name: 'Silla Ergonómica Herman Miller Aeron',
        description: 'Silla de oficina ejecutiva con soporte lumbar',
        price: 1395.0,
        stock: 10,
        category: 'Mobiliario',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    orders: [
      {
        id: 'ord-1',
        orderNumber: 'ORD-2025-00001',
        customerName: 'Corporación Minera del Sur S.A.C.',
        customerDocument: '20554433221',
        paymentMethod: 'BANK_TRANSFER',
        subtotal: 2500.0,
        tax: 450.0,
        total: 2950.0,
        notes: 'Factura con guía de remisión',
        createdByUserId: 'usr-1',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            productName: 'Laptop Dell Latitude 5440 i7 16GB 512GB SSD',
            quantity: 2,
            unitPrice: 1250.0,
            subtotal: 2500.0,
          },
        ],
      },
    ],
  };
}

export const memoryDb = global.__erp_memory_db;
