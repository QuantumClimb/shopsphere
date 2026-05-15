import { CheckCircle2, Circle } from 'lucide-react';

type CheckoutStep = 'cart' | 'customer' | 'address' | 'payment';

interface CheckoutStepIndicatorProps {
  currentStep: CheckoutStep;
}

export default function CheckoutStepIndicator({ currentStep }: CheckoutStepIndicatorProps) {
  const steps = [
    { id: 'cart', label: 'Cart Review' },
    { id: 'customer', label: 'Customer Info' },
    { id: 'address', label: 'Delivery Address' },
    { id: 'payment', label: 'Payment' },
  ];
  
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {index < currentIndex ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : index === currentIndex ? (
                <Circle className="w-8 h-8 text-blue-600 fill-blue-600" />
              ) : (
                <Circle className="w-8 h-8 text-gray-300" />
              )}
              <span className={`text-sm mt-2 ${index <= currentIndex ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-1 flex-1 mx-4 ${index < currentIndex ? 'bg-green-600' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
