import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Clock } from 'lucide-react';
import { Order } from '@/types/order';
import useCartStore from '@/stores/cartStore';
import { MenuItemImage } from '@/components/MenuItemImage';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchJson } from '@/lib/apiConfig';

export default function OrderConfirmation() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  // Support both order_number (from Stripe) and orderNumber (legacy)
  const orderNumber = searchParams.get('order_number') || searchParams.get('orderNumber');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clearCart = useCartStore(state => state.clearCart);
  const clearCheckoutData = useCartStore(state => state.clearCheckoutData);
  
  useEffect(() => {
    console.log('OrderConfirmation: orderNumber =', orderNumber);
    console.log('OrderConfirmation: URL params =', Object.fromEntries(searchParams.entries()));
    
    if (!orderNumber) {
      console.error('OrderConfirmation: No order number in URL');
      setError('No order number provided');
      setLoading(false);
      return;
    }
    
    console.log('OrderConfirmation: Fetching order from API...');
    fetchJson<Order>(`orders/number/${orderNumber}`)
      .then(data => {
        console.log('OrderConfirmation: Order data received:', data);
        setOrder(data);
        setLoading(false);
        
        // Clear cart and checkout data after successful order
        console.log('OrderConfirmation: Clearing cart and checkout data');
        clearCart();
        clearCheckoutData();
      })
      .catch(err => {
        console.error('OrderConfirmation: Failed to load order:', err);
        setError(err.message || 'Failed to load order');
        setLoading(false);
      });
  }, [orderNumber, clearCart, clearCheckoutData]);
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-gray-600">{t('orderConfirmation.loading')}</p>
            <p className="text-sm text-gray-400 mt-2">{t('orderConfirmation.orderNumber')}: {orderNumber}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600 mb-4">
              {error || t('orderConfirmation.orderNotFound')}
            </p>
            <p className="text-center text-gray-600 mb-4">
              {t('orderConfirmation.orderNumber')}: {orderNumber || t('orderConfirmation.notProvided')}
            </p>
            <Link to="/" className="block">
              <Button className="w-full">{t('orderConfirmation.backToShop')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">{t('orderConfirmation.title')}</CardTitle>
          <p className="text-gray-600 mt-2">
            {t('orderConfirmation.thankYou')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t('orderConfirmation.orderNumber')}</p>
              <p className="text-2xl font-bold">{order.orderNumber}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{t('orderConfirmation.deliveryAddress')}</p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.street}
                    {order.deliveryAddress.apartment && `, ${order.deliveryAddress.apartment}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.postalCode} {order.deliveryAddress.city}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{t('orderConfirmation.estimatedDelivery')}</p>
                  <p className="text-sm text-gray-600">{t('orderConfirmation.deliveryTime')}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">{t('orderConfirmation.orderItems')}</h3>
              <ul className="space-y-3">
                {(order.orderItems as any).map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    {/* Menu Item Image */}
                    <MenuItemImage 
                      menuItem={{ 
                        id: item.menuItemId || idx.toString(), 
                        name: item.name,
                        imageUrl: item.imageUrl 
                      }}
                      size="large"
                      className="rounded-md"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {item.quantity} × {item.name}
                          </p>
                          {/* No spice levels for perfumes */}
                        </div>
                        <span className="font-semibold whitespace-nowrap ml-4">
                          ₹{(item.totalPrice / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>{t('orderConfirmation.subtotal')}:</span>
                <span>₹{(order.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>{t('orderConfirmation.deliveryFee')}:</span>
                <span>₹{(order.deliveryFee / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>{order.paymentStatus === 'SUCCEEDED' ? t('orderConfirmation.totalPaid') : t('orderConfirmation.total')}:</span>
                <span>₹{(order.total / 100).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                {order.paymentStatus === 'SUCCEEDED' ? (
                  <>{t('orderConfirmation.confirmationEmailSent')} <strong>{order.customerEmail}</strong></>
                ) : (
                  <>{t('orderConfirmation.confirmationWhatsApp')} <strong>{order.customerPhone}</strong></>
                )}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  {t('orderConfirmation.continueShopping')}
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button className="w-full">
                  {t('orderConfirmation.backToHome')}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
