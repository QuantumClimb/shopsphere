import { useState, useEffect } from 'react';
import useCartStore from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import DeliveryAddressForm from '@/components/checkout/DeliveryAddressForm';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import CheckoutStepIndicator from '@/components/checkout/CheckoutStepIndicator';
import StripeCheckoutButton from '@/components/checkout/StripeCheckoutButton';
import { CustomerInfo, DeliveryAddress, PaymentMethod } from '@/types/order';
import { QuantityStepper } from '@/components/QuantityStepper';
import { CartCustomization } from '@/types/cart';
import { MenuItemImage } from '@/components/MenuItemImage';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { fetchJson } from '@/lib/apiConfig';

type CheckoutStep = 'cart' | 'customer' | 'address' | 'payment' | 'stripe-payment';

// Store status type
interface StoreStatus {
  id: number;
  isOpen: boolean;
  closedMessage: string | null;
  reopenTime: string | null;
}

// No spice levels for perfumes

export default function Checkout() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  useSEO({
    title: 'Checkout | SHOPSPHERE',
    description: 'Complete your SHOPSPHERE order with secure checkout and delivery details.',
    canonicalUrl: 'https://www.fumeslane.com/checkout'
  });
  
  const { 
    items, 
    total, 
    customerInfo, 
    deliveryAddress, 
    selectedPaymentMethod,
    setCustomerInfo,
    setDeliveryAddress,
    setPaymentMethod,
    addItem,
    removeItem,
    updateQuantity,
  } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [currentItemForCustomization, setCurrentItemForCustomization] = useState<string | null>(null);
  
  // Store status state
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);

  // Fetch store status
  useEffect(() => {
    const fetchStoreStatus = async () => {
      try {
        const data = await fetchJson<StoreStatus>('store-status');
        setStoreStatus(data);
      } catch (err) {
        console.error('Failed to fetch store status:', err);
      }
    };
    
    fetchStoreStatus();
  }, []);

  const isStoreClosed = storeStatus?.isOpen === false;
  
  const deliveryFee = 2.50; // Fixed for now
  const grandTotal = total + deliveryFee;
  
  const handleIncrement = (cartItemId: string) => {
    // No customization - directly increment
    const currentCartItem = items.find(ci => ci.id === cartItemId);
    if (currentCartItem) {
      updateQuantity(cartItemId, currentCartItem.quantity + 1);
    }
  };

  const handleDecrement = (cartItemId: string) => {
    const currentCartItem = items.find(ci => ci.id === cartItemId);
    if (currentCartItem) {
      if (currentCartItem.quantity > 1) {
        updateQuantity(cartItemId, currentCartItem.quantity - 1);
      } else {
        // Remove item when quantity reaches 0
        removeItem(cartItemId);
      }
    }
  };

  // No spice customization logic needed for perfumes
  
  const handleCustomerInfoSubmit = (info: CustomerInfo) => {
    setCustomerInfo(info);
    setCurrentStep('address');
  };
  
  const handleAddressSubmit = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
    setCurrentStep('payment');
  };
  
  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    if (method === 'whatsapp') {
      handleWhatsAppOrder();
    } else if (method === 'stripe') {
      setCurrentStep('stripe-payment');
    }
  };
  
  const handleWhatsAppOrder = () => {
    if (!customerInfo || !deliveryAddress) return;
    
    const itemList = items
      .map((item) => {
        let custom = '';
        if (item.customization) {
          return `${item.quantity} x ${item.menuItem.name}`;
      })
      .join(', ');
    
    const addressStr = `${deliveryAddress.street}${deliveryAddress.apartment ? ', ' + deliveryAddress.apartment : ''}, ${deliveryAddress.postalCode} ${deliveryAddress.city}`;
    
    const message = encodeURIComponent(
      `Hi, I would like to order:\n\n` +
      `Name: ${customerInfo.name}\n` +
      `Phone: ${customerInfo.phone}\n` +
      `Email: ${customerInfo.email}\n` +
      `Delivery Address: ${addressStr}\n\n` +
      `Order: ${itemList}\n\n` +
      `Subtotal: ₹${(total / 100).toFixed(2)}\n` +
      `Delivery Fee: ₹${(deliveryFee / 100).toFixed(2)}\n` +
      `Total: ₹${(grandTotal / 100).toFixed(2)}`
    );
    
    window.open(`https://wa.me/919789909362?text=${message}`, '_blank');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('checkout.title')}</h1>
      
      {/* Store Closed Alert */}
      {isStoreClosed && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">{t('checkout.storeClosed')}</div>
            {storeStatus?.closedMessage && (
              <p className="text-sm mb-2">{storeStatus.closedMessage}</p>
            )}
            <p className="text-sm">
              {t('checkout.storeClosedMessage')}
            </p>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              {t('checkout.returnToShop')}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <CheckoutStepIndicator currentStep={currentStep} />
      
      {/* Cart Review */}
      {currentStep === 'cart' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('checkout.yourOrder')}</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p>{t('cart.emptyCart')}</p>
            ) : (
              <>
                <ul className="space-y-3 mb-4">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      {/* Menu Item Image */}
                      <MenuItemImage 
                        menuItem={item.menuItem}
                        size="medium"
                        className="rounded-md"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.menuItem.name}</span>
                        </div>
                        {/* No spice level for perfumes */}
                        <div className="flex items-center justify-between">
                          <QuantityStepper
                            quantity={item.quantity}
                            onIncrement={() => handleIncrement(item.id)}
                            onDecrement={() => handleDecrement(item.id)}
                          />
                          <span className="font-medium min-w-[60px] text-right">
                            ₹{(item.totalPrice / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between py-2">
                    <span>{t('checkout.subtotal')}:</span>
                    <span>₹{(total / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>{t('checkout.deliveryFee')}:</span>
                    <span>₹{(deliveryFee / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg">
                    <span>{t('checkout.total')}:</span>
                    <span>₹{(grandTotal / 100).toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setCurrentStep('customer')} 
                  className="w-full mt-6"
                  size="lg"
                  disabled={isStoreClosed}
                >
                  {isStoreClosed ? t('checkout.storeClosedCheckoutDisabled') : t('checkout.continueToCustomerInfo')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Customer Info */}
      {currentStep === 'customer' && (
        <CustomerInfoForm 
          initialData={customerInfo || undefined}
          onSubmit={handleCustomerInfoSubmit}
          onBack={() => setCurrentStep('cart')}
        />
      )}
      
      {/* Delivery Address */}
      {currentStep === 'address' && (
        <DeliveryAddressForm 
          initialData={deliveryAddress || undefined}
          onSubmit={handleAddressSubmit}
          onBack={() => setCurrentStep('customer')}
        />
      )}
      
      {/* Payment Method */}
      {currentStep === 'payment' && (
        <PaymentMethodSelector 
          onSelect={handlePaymentMethodSelect}
          onBack={() => setCurrentStep('address')}
          total={grandTotal}
        />
      )}
      
      {/* Stripe Payment */}
      {currentStep === 'stripe-payment' && customerInfo && deliveryAddress && (
        <StripeCheckoutButton 
          orderItems={items}
          customerInfo={customerInfo}
          deliveryAddress={deliveryAddress}
          total={grandTotal}
          onBack={() => setCurrentStep('payment')}
        />
      )}
      
      {/* Customization dialogs removed */}
    </div>
  );
}
