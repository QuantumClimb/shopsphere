import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartStore, CartItem, CartCustomization } from '../types/cart';
import { CustomerInfo, DeliveryAddress, PaymentMethod } from '../types/order';
import { MenuItem } from '../types/menu';

interface ExtendedCartStore extends CartStore {
  // Checkout data
  customerInfo: CustomerInfo | null;
  deliveryAddress: DeliveryAddress | null;
  selectedPaymentMethod: PaymentMethod | null;
  
  // Checkout actions
  setCustomerInfo: (info: CustomerInfo) => void;
  setDeliveryAddress: (address: DeliveryAddress) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCheckoutData: () => void;
}

const useCartStore = create<ExtendedCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      
      // Checkout state
      customerInfo: null,
      deliveryAddress: null,
      selectedPaymentMethod: null,

      addItem: (menuItem: MenuItem, quantity = 1, customization?: CartCustomization) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            item => 
              item.menuItem.id === menuItem.id && 
              JSON.stringify(item.customization) === JSON.stringify(customization)
          );

          let newItems: CartItem[];
          
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            newItems = state.items.map((item, index) => 
              index === existingItemIndex 
                ? { 
                    ...item, 
                    quantity: item.quantity + quantity,
                    totalPrice: (item.quantity + quantity) * menuItem.price
                  }
                : item
            );
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `${menuItem.id}-${Date.now()}`,
              menuItem,
              quantity,
              customization,
              totalPrice: quantity * menuItem.price,
            };
            newItems = [...state.items, newItem];
          }

          const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
          };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== itemId);
          const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
          };
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            const newItems = state.items.filter(item => item.id !== itemId);
            const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
              items: newItems,
              total: newTotal,
              itemCount: newItemCount,
            };
          }

          const newItems = state.items.map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  quantity,
                  totalPrice: quantity * item.menuItem.price
                }
              : item
          );

          const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
          };
        });
      },

      updateCustomization: (itemId: string, customization: CartCustomization) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === itemId ? { ...item, customization } : item
          ),
        }));
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
          customerInfo: null,
          deliveryAddress: null,
          selectedPaymentMethod: null,
        });
      },

      getItemById: (itemId: string) => {
        return get().items.find(item => item.id === itemId);
      },
      
      // Checkout actions
      setCustomerInfo: (info: CustomerInfo) => {
        set({ customerInfo: info });
      },
      
      setDeliveryAddress: (address: DeliveryAddress) => {
        set({ deliveryAddress: address });
      },
      
      setPaymentMethod: (method: PaymentMethod) => {
        set({ selectedPaymentMethod: method });
      },
      
      clearCheckoutData: () => {
        set({
          customerInfo: null,
          deliveryAddress: null,
          selectedPaymentMethod: null,
        });
      },
    }),
    {
      name: 'shopsphere-cart',
      version: 1,
    }
  )
);

export default useCartStore;