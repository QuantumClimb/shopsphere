import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { MenuItem } from '../types/menu';
import { CartCustomization } from '../types/cart';
import useCartStore from '../stores/cartStore';

interface AddToCartButtonProps {
  menuItem: MenuItem;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  buttonText?: string;
  showIcon?: boolean;
}



export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  menuItem,
  variant = 'default',
  size = 'default',
  className,
  buttonText = 'Add to Cart',
  showIcon = true
}) => {

  
  const { addItem, items } = useCartStore(state => ({
    addItem: state.addItem,
    items: state.items
  }));

  // Check if this item is already in the cart
  const existingCartItem = items.find(item => item.menuItem.id === menuItem.id);
  const hasItemInCart = !!existingCartItem;

  const handleAddToCart = () => {
    addItem(menuItem, 1);
  };



  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleAddToCart}
      >
        {showIcon && <ShoppingCart className="w-4 h-4 mr-2" />}
        {buttonText}
      </Button>


    </>
  );
};