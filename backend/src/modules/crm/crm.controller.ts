import { Request, Response } from 'express';
import { memoryDb } from '../../db/memory-db';
import { StoredCustomer, CustomerType, CustomerStatus } from '../../types';

export const getCustomers = (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string | undefined)?.toLowerCase();
    const type = req.query.type as CustomerType | undefined;
    const status = req.query.status as CustomerStatus | undefined;

    let list = memoryDb.customers;

    if (type) {
      list = list.filter((c) => c.type === type);
    }

    if (status) {
      list = list.filter((c) => c.status === status);
    }

    if (search) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.document.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.code.toLowerCase().includes(search) ||
          c.phone.includes(search),
      );
    }

    // Calcular métricas comerciales de cada cliente basándose en el historial de órdenes
    const enrichedList = list.map((customer) => {
      const customerOrders = memoryDb.orders.filter(
        (o) =>
          o.customerId === customer.id ||
          o.customerDocument === customer.document ||
          o.customerName.toLowerCase() === customer.name.toLowerCase(),
      );

      const totalSpent = customerOrders.reduce((sum, ord) => sum + ord.total, 0);

      return {
        ...customer,
        totalOrders: customerOrders.length,
        totalSpent: Number(totalSpent.toFixed(2)),
      };
    });

    return res.json({
      success: true,
      data: enrichedList,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      type: 'https://erp.local/errors/500',
      title: 'Error',
      status: 500,
      detail: err.message,
      instance: '/api/crm/customers',
      timestamp: new Date().toISOString(),
    });
  }
};

export const getCustomerById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = memoryDb.customers.find((c) => c.id === id);

    if (!customer) {
      return res.status(404).json({
        type: 'https://erp.local/errors/404',
        title: 'Not Found',
        status: 404,
        detail: `No se encontró el cliente con ID: ${id}`,
        instance: `/api/crm/customers/${id}`,
        timestamp: new Date().toISOString(),
      });
    }

    const customerOrders = memoryDb.orders.filter(
      (o) =>
        o.customerId === customer.id ||
        o.customerDocument === customer.document ||
        o.customerName.toLowerCase() === customer.name.toLowerCase(),
    );

    const totalSpent = customerOrders.reduce((sum, ord) => sum + ord.total, 0);

    return res.json({
      success: true,
      data: {
        ...customer,
        totalOrders: customerOrders.length,
        totalSpent: Number(totalSpent.toFixed(2)),
        orders: customerOrders,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      type: 'https://erp.local/errors/500',
      title: 'Error',
      status: 500,
      detail: err.message,
      instance: `/api/crm/customers/${req.params.id}`,
      timestamp: new Date().toISOString(),
    });
  }
};

export const createCustomer = (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!body.name || !body.document || !body.email || !body.phone) {
      return res.status(400).json({
        type: 'https://erp.local/errors/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Nombre, documento (RUC/DNI), correo y teléfono son obligatorios.',
        instance: '/api/crm/customers',
        timestamp: new Date().toISOString(),
      });
    }

    const exists = memoryDb.customers.some(
      (c) => c.document.toLowerCase() === body.document.trim().toLowerCase(),
    );

    if (exists) {
      return res.status(409).json({
        type: 'https://erp.local/errors/409',
        title: 'Conflict',
        status: 409,
        detail: `Ya existe un cliente registrado con el documento: ${body.document}`,
        instance: '/api/crm/customers',
        timestamp: new Date().toISOString(),
      });
    }

    const codeNumber = memoryDb.customers.length + 1;
    const newCustomer: StoredCustomer = {
      id: `cli-${Date.now()}`,
      code: `CLI-${String(codeNumber).padStart(3, '0')}`,
      name: body.name.trim(),
      document: body.document.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      address: body.address?.trim() || '',
      city: body.city?.trim() || 'Lima',
      type: body.type === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'COMPANY',
      status: body.status || 'ACTIVE',
      notes: body.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryDb.customers.unshift(newCustomer);

    return res.status(201).json({
      success: true,
      message: 'Cliente registrado exitosamente en el módulo CRM',
      data: {
        ...newCustomer,
        totalOrders: 0,
        totalSpent: 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      type: 'https://erp.local/errors/500',
      title: 'Error',
      status: 500,
      detail: err.message,
      instance: '/api/crm/customers',
      timestamp: new Date().toISOString(),
    });
  }
};

export const updateCustomer = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const customer = memoryDb.customers.find((c) => c.id === id);
    if (!customer) {
      return res.status(404).json({
        type: 'https://erp.local/errors/404',
        title: 'Not Found',
        status: 404,
        detail: `No se encontró el cliente con ID: ${id}`,
        instance: `/api/crm/customers/${id}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (body.name !== undefined) customer.name = body.name.trim();
    if (body.document !== undefined) customer.document = body.document.trim();
    if (body.email !== undefined) customer.email = body.email.trim();
    if (body.phone !== undefined) customer.phone = body.phone.trim();
    if (body.address !== undefined) customer.address = body.address.trim();
    if (body.city !== undefined) customer.city = body.city.trim();
    if (body.type !== undefined) customer.type = body.type;
    if (body.status !== undefined) customer.status = body.status;
    if (body.notes !== undefined) customer.notes = body.notes.trim();
    customer.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Cliente actualizado correctamente',
      data: customer,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      type: 'https://erp.local/errors/500',
      title: 'Error',
      status: 500,
      detail: err.message,
      instance: `/api/crm/customers/${req.params.id}`,
      timestamp: new Date().toISOString(),
    });
  }
};

export const deleteCustomer = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = memoryDb.customers.find((c) => c.id === id);

    if (!customer) {
      return res.status(404).json({
        type: 'https://erp.local/errors/404',
        title: 'Not Found',
        status: 404,
        detail: `No se encontró el cliente con ID: ${id}`,
        instance: `/api/crm/customers/${id}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Soft delete en CRM: marcar como INACTIVE
    customer.status = 'INACTIVE';
    customer.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: `Cliente ${customer.name} desactivado del CRM`,
      data: customer,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      type: 'https://erp.local/errors/500',
      title: 'Error',
      status: 500,
      detail: err.message,
      instance: `/api/crm/customers/${req.params.id}`,
      timestamp: new Date().toISOString(),
    });
  }
};
