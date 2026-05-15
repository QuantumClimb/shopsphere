import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import useCartStore from '../stores/cartStore';
import { CartItem } from '../types/cart';
import { MenuItemImage } from './MenuItemImage';
import { useLanguage } from '../contexts/LanguageContext';

interface CartDrawerProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CartItemComponentProps {
  item: CartItem;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({ 
  item
}) => {
  const { updateQuantity, removeItem } = useCartStore();
  const { t } = useLanguage();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleIncrement = () => {
    handleQuantityChange(item.quantity + 1);
  };

  const handleDecrement = () => {
    handleQuantityChange(item.quantity - 1);
  };

  return (
    <div className="flex items-start space-x-3 p-3 border rounded-lg">
      <MenuItemImage 
        menuItem={item.menuItem}
        size="small"
        className="rounded-md"
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.menuItem.name}</h4>
        <p className="text-xs text-muted-foreground mb-2">₹{(item.menuItem.price / 100).toFixed(2)} {t('cart.each')}</p>
        
        {item.customization && (
          <div className="space-y-1 mb-2">
            {item.customization.extras && item.customization.extras.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.customization.extras.map((extra, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {extra}
                  </Badge>
                ))}
              </div>
            )}
            {item.customization.specialInstructions && (
              <p className="text-xs text-muted-foreground italic">
                "{item.customization.specialInstructions}"
              </p>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={handleDecrement}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="h-6 w-12 text-center text-xs p-1"
            min="1"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={handleIncrement}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="text-right">
        <p className="font-medium text-sm">₹{(item.totalPrice / 100).toFixed(2)}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 mt-1 text-destructive hover:text-destructive"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}) => {
  const [open, setOpen] = useState(controlledOpen ?? false);
  const { items, total, itemCount, clearCart } = useCartStore();
  const { t } = useLanguage();
  
  useEffect(() => {
    if (typeof controlledOpen === 'boolean') setOpen(controlledOpen);
  }, [controlledOpen]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    controlledOnOpenChange?.(nextOpen);
  };

  const handleWhatsAppBooking = () => {
    const itemList = items
      .map((item) => {
        let name = item.menuItem.name;
        if (item.customization?.specialInstructions) {
          name += ` (${item.customization.specialInstructions})`;
        }
        return `${item.quantity} x ${name}`;
      })
      .join('\n');
    
    const grandTotal = total / 100 + 2.50;
    
    const message = encodeURIComponent(
      `Hi SHOPSPHERE! I would like to book the following items:\n\n` +
      `${itemList}\n\n` +
      `Subtotal: ₹${(total / 100).toFixed(2)}\n` +
      `Delivery Fee: ₹2.50\n` +
      `Total: ₹${grandTotal.toFixed(2)}\n\n` +
      `Please let me know the next steps for payment and delivery address. Thank you!`
    );
    
    window.open(`https://wa.me/919789909362?text=${message}`, '_blank');
    setOpen(false);
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="relative w-auto h-auto p-2 hover:bg-transparent" style={{ color: '#D4AF37' }}>
      <ShoppingBag className="w-10 h-10 md:w-6 md:h-6" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );

  return (
  <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{t('cart.title')} ({itemCount} {t('cart.items')})</span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t('cart.clear')}
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-8rem)] mt-6">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('cart.emptyCart')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('cart.emptyCartMessage')}
                </p>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6 overflow-y-auto">
                <div className="space-y-3 py-4">
                  {items.map((item) => (
                    <CartItemComponent 
                      key={item.id} 
                      item={item}
                    />
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-4 space-y-4 flex-shrink-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('cart.subtotal')} ({itemCount} {t('cart.items')})</span>
                    <span>₹{(total / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('cart.deliveryFee')}</span>
                    <span>₹2.50</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('cart.total')}</span>
                    <span>₹{(total / 100 + 2.50).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                    <Button className="w-full" size="lg" onClick={handleWhatsAppBooking}>
                      {t('cart.bookViaWhatsApp')}
                    </Button>
                  <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
                    {t('cart.continueShopping')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};