import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { CustomerInfo, DeliveryAddress } from '@/types/order';
import { buildApiUrl } from '@/lib/apiConfig';

interface StripeCheckoutButtonProps {
  orderItems: any[];
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  total: number;
  onBack: () => void;
}

export default function StripeCheckoutButton({
  orderItems,
  customerInfo,
  deliveryAddress,
  total,
  onBack,
}: StripeCheckoutButtonProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCheckout = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      // Transform cart items to flat structure expected by API
      const transformedItems = orderItems.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        price: item.menuItem.price,
        spiceLevel: item.customization?.spiceLevel,
      }));
      
      // Create checkout session
      const response = await fetch(buildApiUrl('stripe/create-checkout-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems: transformedItems,
          customerInfo,
          deliveryAddress,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create checkout session');
      }
      
      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An unexpected error occurred');
      setProcessing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3 p-4 bg-muted rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>₹{((total - 250) / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery:</span>
            <span>₹2.50</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>₹{(total / 100).toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            You'll be redirected to Stripe's secure checkout page to complete your payment
          </p>
          
          <Button 
            onClick={handleCheckout}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating checkout session...
              </>
            ) : (
              'Proceed to Secure Checkout'
            )}
          </Button>
          
          <Button 
            onClick={onBack}
            variant="outline"
            className="w-full"
            disabled={processing}
          >
            Back to Delivery Details
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Secure payment powered by Stripe</span>
        </div>
      </CardContent>
    </Card>
  );
}
