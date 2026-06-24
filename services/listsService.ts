/**
 * Plutos — Liste Servisi
 * AsyncStorage ile kullanıcı listelerini saklar/okur/düzenler.
 * Her liste: { id, name, symbols[], createdAt, isSystem }
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StockList {
  id: string;
  name: string;
  symbols: string[];
  createdAt: number;
  isSystem?: boolean; // Otomatik oluşturulan listeler (silinemeyen)
  icon?: string;      // Emoji ikon
}

const LISTS_KEY = 'plutos_lists_v2';

// ─── Yardımcı ─────────────────────────────────────────────────

function generateId(): string {
  return `list_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── CRUD ─────────────────────────────────────────────────────

/** Tüm listeleri döner */
export async function getLists(): Promise<StockList[]> {
  try {
    const raw = await AsyncStorage.getItem(LISTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StockList[];
  } catch {
    return [];
  }
}

/** Listeleri kaydeder */
async function saveLists(lists: StockList[]): Promise<void> {
  await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(lists));
}

/** Yeni liste oluşturur */
export async function createList(name: string, icon = '📋'): Promise<StockList> {
  const lists = await getLists();
  const newList: StockList = {
    id: generateId(),
    name: name.trim(),
    symbols: [],
    createdAt: Date.now(),
    icon,
  };
  await saveLists([...lists, newList]);
  return newList;
}

/** Listeyi siler (sistem listeleri silinemez) */
export async function deleteList(id: string): Promise<void> {
  const lists = await getLists();
  const updated = lists.filter(l => l.id !== id || l.isSystem);
  await saveLists(updated);
}

/** Listeyi yeniden adlandırır */
export async function renameList(id: string, name: string): Promise<void> {
  const lists = await getLists();
  await saveLists(lists.map(l => l.id === id ? { ...l, name: name.trim() } : l));
}

/** Listeye sembol ekler */
export async function addToList(listId: string, symbol: string): Promise<void> {
  const lists = await getLists();
  await saveLists(
    lists.map(l => {
      if (l.id !== listId) return l;
      const upper = symbol.toUpperCase();
      if (l.symbols.includes(upper)) return l;
      return { ...l, symbols: [...l.symbols, upper] };
    })
  );
}

/** Listeden sembol çıkarır */
export async function removeFromList(listId: string, symbol: string): Promise<void> {
  const lists = await getLists();
  const upper = symbol.toUpperCase();
  await saveLists(
    lists.map(l =>
      l.id === listId
        ? { ...l, symbols: l.symbols.filter(s => s !== upper) }
        : l
    )
  );
}

/** Sembolün belirli bir listede olup olmadığını döner */
export async function isInList(listId: string, symbol: string): Promise<boolean> {
  const lists = await getLists();
  const list = lists.find(l => l.id === listId);
  return list ? list.symbols.includes(symbol.toUpperCase()) : false;
}

/** Liste bulunamazsa oluşturur */
export async function getOrCreateList(name: string, icon = '📋'): Promise<StockList> {
  const lists = await getLists();
  const existing = lists.find(l => l.name === name);
  if (existing) return existing;
  return createList(name, icon);
}

// ─── Sistem Listeleri ──────────────────────────────────────────

const POPULAR_LIST_ID = 'system_popular';

/**
 * "En Popüler Hisseler" sistem listesini günceller.
 * topSymbols: backend'den gelen popüler sembolleri.
 */
export async function updatePopularList(topSymbols: string[]): Promise<void> {
  const lists = await getLists();
  const existing = lists.find(l => l.id === POPULAR_LIST_ID);
  if (existing) {
    await saveLists(
      lists.map(l =>
        l.id === POPULAR_LIST_ID ? { ...l, symbols: topSymbols } : l
      )
    );
  } else {
    const popularList: StockList = {
      id: POPULAR_LIST_ID,
      name: 'En Popüler Hisseler',
      symbols: topSymbols,
      createdAt: Date.now(),
      isSystem: true,
      icon: '🔥',
    };
    await saveLists([popularList, ...lists]);
  }
}

export { POPULAR_LIST_ID };
