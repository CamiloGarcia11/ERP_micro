import { Request, Response } from 'express';
import { memoryDb } from '../../db/memory-db';

export const login = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        type: 'https://erp.local/errors/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Correo y contraseña son requeridos.',
        instance: '/api/auth/login',
        timestamp: new Date().toISOString(),
      });
    }

    const user = memoryDb.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );

    if (!user) {
      return res.status(401).json({
        type: 'https://erp.local/errors/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Credenciales inválidas. Verifica tu correo y contraseña.',
        instance: '/api/auth/login',
        timestamp: new Date().toISOString(),
      });
    }

    const token = `jwt-${user.id}-${Date.now()}`;

    return res.json({
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
    return res.status(500).json({
      type: 'https://erp.local/errors/500',
      title: 'Internal Server Error',
      status: 500,
      detail: error.message || 'Error en autenticación',
      instance: '/api/auth/login',
      timestamp: new Date().toISOString(),
    });
  }
};
