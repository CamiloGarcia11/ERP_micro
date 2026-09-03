import { NextResponse } from 'next/server';
import { memoryDb } from '@/lib/memory-db';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: memoryDb.orders,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const items = body.items || [];
    if (items.length === 0) {
      return NextResponse.json(
        {
          type: 'https://erp.local/errors/400',
          title: 'Bad Request',
          status: 400,
          detail: 'El pedido debe contener al menos un ítem',
          instance: '/api/sales/orders',
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    let subtotal = 0;
    const processedItems = items.map((item: any, idx: number) => {
      const product = memoryDb.products.find((p) => p.id === item.productId);
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;

      // Descuento automático de existencias en inventario
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }

      return {
        id: `item-${Date.now()}-${idx}`,
        productId: item.productId,
        productName: product?.name || 'Producto',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: itemSubtotal,
      };
    });

    const tax = Number((subtotal * 0.18).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    const orderNumber = `ORD-2025-${String(memoryDb.orders.length + 1).padStart(5, '0')}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: body.customerName,
      customerDocument: body.customerDocument,
      status: 'CONFIRMED',
      paymentMethod: body.paymentMethod || 'CASH',
      subtotal,
      tax,
      total,
      notes: body.notes,
      items: processedItems,
      createdByUserId: 'usr-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryDb.orders.unshift(newOrder);

    return NextResponse.json({
      success: true,
      message: `Orden ${newOrder.orderNumber} procesada y stock descontado exitosamente`,
      data: newOrder,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        type: 'https://erp.local/errors/500',
        title: 'Error',
        status: 500,
        detail: err.message,
        instance: '/api/sales/orders',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
