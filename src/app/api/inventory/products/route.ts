import { NextResponse } from 'next/server';
import { memoryDb } from '@/lib/memory-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase();
  const category = searchParams.get('category');

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

  return NextResponse.json({
    success: true,
    data: list,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const exists = memoryDb.products.some(
      (p) => p.sku.toLowerCase() === body.sku?.toLowerCase(),
    );

    if (exists) {
      return NextResponse.json(
        {
          type: 'https://erp.local/errors/409',
          title: 'Conflict',
          status: 409,
          detail: `Ya existe un producto con el SKU: ${body.sku}`,
          instance: '/api/inventory/products',
          timestamp: new Date().toISOString(),
        },
        { status: 409 },
      );
    }

    const newProd = {
      id: `prod-${Date.now()}`,
      sku: body.sku.toUpperCase(),
      name: body.name,
      description: body.description,
      price: Number(body.price),
      stock: Number(body.stock),
      category: body.category || 'General',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryDb.products.unshift(newProd);

    return NextResponse.json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProd,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        type: 'https://erp.local/errors/500',
        title: 'Error',
        status: 500,
        detail: err.message,
        instance: '/api/inventory/products',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
