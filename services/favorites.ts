/**
 * Plutos — Favorites Service
 * AsyncStorage ile favori hisseleri saklar / okur / düzenler.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'plutos_favorites';

/** Tüm favori sembolleri döner */
export async function getFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/** Sembolün favorilerde olup olmadığını döner */
export async function isFavorite(symbol: string): Promise<boolean> {
  const favs = await getFavorites();
  return favs.includes(symbol.toUpperCase());
}

/** Favorilere ekler (zaten varsa tekrar eklemez) */
export async function addFavorite(symbol: string): Promise<void> {
  const favs = await getFavorites();
  const upper = symbol.toUpperCase();
  if (!favs.includes(upper)) {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs, upper]));
  }
}

/** Favorilerden çıkarır */
export async function removeFavorite(symbol: string): Promise<void> {
  const favs = await getFavorites();
  const upper = symbol.toUpperCase();
  await AsyncStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(favs.filter((s) => s !== upper))
  );
}

/** Toggle: favorideyse çıkar, değilse ekle. Yeni durumu (isFav) döner */
export async function toggleFavorite(symbol: string): Promise<boolean> {
  const fav = await isFavorite(symbol);
  if (fav) {
    await removeFavorite(symbol);
    return false;
  } else {
    await addFavorite(symbol);
    return true;
  }
}
