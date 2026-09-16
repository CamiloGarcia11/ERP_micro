import { Request, Response } from 'express';
import { memoryDb } from '../../db/memory-db';
import { StoredProduct } from '../../types';

export const getProducts = (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string | undefined)?.toLowerCase();
    const category = req.query.category as string | undefined;

    let list = memoryDb.products;

    if (category) {
      list = list.filter((p) => p.category === category);
    }

    if (search) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search),
      );
    }

    return res.json({
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      type: 'https://erp.local/errors/500',
      title: 'Error',
      status: 500,
      detail: err.message,
      instance: '/api/inventory/products',
      timestamp: new Date().toISOString(),
    });
  }
};

export const createProduct = (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!body.sku || !body.name || body.price === undefined) {
      return res.status(400).json({
        type: 'https://erp.local/errors/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Campos requeridos: SKU, nombre y precio.',
        instance: '/api/inventory/products',
        timestamp: new Date().toISOString(),
      });
    }

    const exists = memoryDb.products.some(
      (p) => p.sku.toLowerCase() === body.sku?.toLowerCase(),
    );

    if (exists) {
      return res.status(409).json({
        type: 'https://erp.local/errors/409',
        title: 'Conflict',
        status: 409,
        detail: `Ya existe un producto con el SKU: ${body.sku}`,
        instance: '/api/inventory/products',
        timestamp: new Date().toISOString(),
      });
    }

    const newProd: StoredProduct = {
      id: `prod-${Date.now()}`,
      sku: body.sku.toUpperCase(),
      name: body.name,
      description: body.description,
      price: Number(body.price),
      stock: Number(body.stock ?? 0),
      category: body.category || 'General',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryDb.products.unshift(newProd);

    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProd,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      type: 'https://erp.local/errors/500',
      title: 'Error',
      status: 500,
      detail: err.message,
      instance: '/api/inventory/products',
      timestamp: new Date().toISOString(),
    });
  }
};
