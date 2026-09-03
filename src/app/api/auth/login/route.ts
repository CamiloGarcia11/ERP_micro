import { NextResponse } from 'next/server';
import { memoryDb } from '@/lib/memory-db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = memoryDb.users.find(
      (u) => u.email.toLowerCase() === email?.toLowerCase() && u.password === password,
    );

    if (!user) {
      return NextResponse.json(
        {
          type: 'https://erp.local/errors/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Credenciales inválidas. Verifica tu correo y contraseña.',
          instance: '/api/auth/login',
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      );
    }

    const token = `jwt-${user.id}-${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: token,
          refreshToken: `refresh-${user.id}`,
          expiresIn: 86400,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        type: 'https://erp.local/errors/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message || 'Error en autenticación',
        instance: '/api/auth/login',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
