import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';
import { PaymentMethod } from '@/types/order';
import { fetchJson } from '@/lib/apiConfig';

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  onBack: () => void;
  total: number;
}

export default function PaymentMethodSelector({ onSelect, onBack, total }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [stripeAvailable, setStripeAvailable] = useState(true);
  
  // Check if Stripe is configured
  useEffect(() => {
    fetchJson<{ publishableKey?: string }>('stripe/config')
      .then(data => {
        if (!data.publishableKey) {
          setStripeAvailable(false);
        }
      })
      .catch(() => {
        setStripeAvailable(false);
      });
  }, []);
  
  const handleContinue = () => {
    if (selectedMethod) {
      onSelect(selectedMethod);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod || ''} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
          <div className="space-y-4">
            {/* WhatsApp Option */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="whatsapp" id="whatsapp" />
              <Label htmlFor="whatsapp" className="flex items-center gap-3 flex-1 cursor-pointer">
                <div className="bg-green-600 text-white p-2 rounded">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Order via WhatsApp</p>
                  <p className="text-sm text-gray-600">Send order details via WhatsApp</p>
                </div>
              </Label>
            </div>
            
            {/* Stripe Option */}
            <div className={`flex items-center space-x-3 p-4 border rounded-lg ${stripeAvailable ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed bg-gray-100'}`}>
              <RadioGroupItem value="stripe" id="stripe" disabled={!stripeAvailable} />
              <Label htmlFor="stripe" className={`flex items-center gap-3 flex-1 ${stripeAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <div className="bg-blue-600 text-white p-2 rounded">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Pay with Card (Stripe)</p>
                  <p className="text-sm text-gray-600">
                    {stripeAvailable 
                      ? 'Secure online payment with credit/debit card' 
                      : 'Currently unavailable - please use WhatsApp'}
                  </p>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-lg font-bold">
            <span>Total to Pay:</span>
            <span>₹{(total / 100).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex gap-3 pt-6">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button 
            onClick={handleContinue} 
            className="flex-1"
            disabled={!selectedMethod}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
