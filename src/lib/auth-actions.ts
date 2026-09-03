'use server';

import { cookies } from 'next/headers';
import { UserDto } from '@/types/erp.types';

export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('user_data');
}

export async function getSessionUser(): Promise<UserDto | null> {
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  if (!userData) return null;
  try {
    return JSON.parse(userData) as UserDto;
  } catch {
    return null;
  }
}
