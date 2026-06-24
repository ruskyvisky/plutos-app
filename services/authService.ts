/**
 * Plutos — Auth Service
 * JWT token yönetimi ve authentication API çağrıları.
 * Token'lar AsyncStorage'da saklanır.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

const TOKEN_KEY = '@plutos_access_token';
const USER_KEY = '@plutos_user';

// ─── Tipler ──────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  investor_profile?: string;
  onboarding_done: boolean;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

// ─── Token Yönetimi ──────────────────────────────────────────

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveUser(user: AuthUser): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

// ─── API Çağrıları ───────────────────────────────────────────

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  full_name?: string;
}

export async function loginApi(params: LoginParams): Promise<AuthToken> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail ?? 'Giriş başarısız.');
  }

  // Token ve kullanıcıyı kaydet
  await saveToken(data.access_token);
  await saveUser(data.user);

  return data as AuthToken;
}

export async function registerApi(params: RegisterParams): Promise<AuthUser> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail ?? 'Kayıt başarısız.');
  }

  return data as AuthUser;
}

export async function getMeApi(): Promise<AuthUser | null> {
  const token = await getToken();
  if (!token) return null;

  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  return response.json() as Promise<AuthUser>;
}

export async function saveOnboardingApi(answers: number[]): Promise<AuthUser> {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/auth/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail ?? 'Onboarding kaydedilemedi.');
  }

  await saveUser(data);
  return data as AuthUser;
}
