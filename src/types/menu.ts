export interface MenuItem {
  id: string;
  name: string;
  namePt?: string;
  category: string;
  categoryId: number;
  price: number;
  description?: string;
  descriptionPt?: string;
  imageUrl?: string;
  brand?: string;
  volume?: number;
  concentration?: string;
  gender?: string;
  fragranceFamily?: string;
  topNotes?: string;
  middleNotes?: string;
  baseNotes?: string;
  stockQuantity?: number;
  inStock?: boolean;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export type MenuData = MenuCategory[];
