import { MenuItem, MenuCategory, MenuData } from '../types/menu';
import { fetchJson } from '../lib/apiConfig';

// Fetch all menu categories and items from the API
export async function getMenuData(): Promise<MenuData> {
  try {
    return await fetchJson<MenuData>('menu');
  } catch (error) {
    console.error('Error fetching menu data:', error);
    // Fallback to static JSON in public folder
    try {
      const fallback = await fetch('/menuData.json');
      if (fallback.ok) {
        const data = await fallback.json();
        return data as MenuData;
      }
    } catch (e) {
      console.error('Fallback menu load failed:', e);
    }
    throw error;
  }
}

// Search menu items
export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  try {
    return await fetchJson<MenuItem[]>(`menu/search?q=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error('Error searching menu:', error);
    throw error;
  }
}

// Get items by category
export async function getMenuByCategory(categoryName: string): Promise<MenuCategory> {
  try {
    const data = await fetchJson<{ category: string; items: MenuItem[] }>(`menu/category/${encodeURIComponent(categoryName)}`);
    return {
      name: data.category,
      items: data.items
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}
