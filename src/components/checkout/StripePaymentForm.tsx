import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomerInfo, DeliveryAddress } from '@/types/order';
import useCartStore from '@/stores/cartStore';
import { buildApiUrl } from '@/lib/apiConfig';

interface StripePaymentFormProps {
  orderItems: any[];
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  total: number;
  onBack: () => void;
}

export default function StripePaymentForm({
  orderItems,
  customerInfo,
  deliveryAddress,
  total,
  onBack,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const clearCart = useCartStore(state => state.clearCart);
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // Create payment intent
      const response = await fetch(buildApiUrl('stripe/create-payment-intent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems,
          customerInfo,
          deliveryAddress,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const { clientSecret, orderNumber } = await response.json();
      
      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: {
              city: 'Lisboa',
              postal_code: '1000-001',
              country: 'PT',
            },
          },
        },
      });
      
      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setProcessing(false);
        return;
      }
      
      if (paymentIntent?.status === 'succeeded') {
        // Clear cart and redirect to confirmation
        clearCart();
        navigate(`/order-confirmation?orderNumber=${orderNumber}`);
      }
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setProcessing(false);
    }
  };
  
  const cardElementOptions = {
    hidePostalCode: true, // Remove ZIP code field to avoid regional restrictions
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <p className="text-sm text-gray-600">{customerInfo.name}</p>
            <p className="text-sm text-gray-600">{customerInfo.email}</p>
            <p className="text-sm text-gray-600 mb-3">
              {deliveryAddress.street}, {deliveryAddress.city}
            </p>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mb-6 p-4 border rounded-lg">
            <label className="block text-sm font-medium mb-2">
              Card Details
            </label>
            <CardElement options={cardElementOptions} />
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack} 
              disabled={processing}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={!stripe || processing}
              className="flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay €${total.toFixed(2)}`
              )}
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            🔒 Secure payment powered by Stripe
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
