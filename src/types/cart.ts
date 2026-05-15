import { MenuItem } from './menu';

export interface CartCustomization {
  specialInstructions?: string;
  extras?: string[];
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  customization?: CartCustomization;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CartStore extends Cart {
  addItem: (item: MenuItem, quantity?: number, customization?: CartCustomization) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCustomization: (itemId: string, customization: CartCustomization) => void;
  clearCart: () => void;
  getItemById: (itemId: string) => CartItem | undefined;
}