import { useEffect, useState } from 'react';
import { Check, Clock, ChefHat, Bike, Package, Home } from 'lucide-react';

const steps = [
  { id: 'pending', label: 'Order Placed', icon: Clock },
  { id: 'confirmed', label: 'Confirmed', icon: Check },
  { id: 'preparing', label: 'Preparing', icon: ChefHat },
  { id: 'ready', label: 'Ready', icon: Package },
  { id: 'picked_up', label: 'On the Way', icon: Bike },
  { id: 'delivered', label: 'Delivered', icon: Home },
];

const OrderStepper = ({ currentStatus, className = '' }) => {
  const [animatedStep, setAnimatedStep] = useState(-1);

  const currentStepIndex = steps.findIndex(s => s.id === currentStatus);

  useEffect(() => {
    // Animate steps sequentially
    let timeout;
    for (let i = 0; i <= currentStepIndex; i++) {
      timeout = setTimeout(() => {
        setAnimatedStep(i);
      }, i * 300);
    }
    return () => clearTimeout(timeout);
  }, [currentStepIndex]);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -z-10" />

        {/* Animated Progress Line */}
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 -z-10 transition-all duration-500 ease-out"
          style={{
            width: `${(animatedStep / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= animatedStep;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white scale-110'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-green-200 dark:ring-green-900 animate-pulse' : ''}`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 animate-pop" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-xs font-medium text-center transition-all duration-300 ${
                  isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>

              {/* Pulse Animation for Current Step */}
              {isCurrent && (
                <div className="absolute top-0 w-10 h-10 rounded-full bg-green-500 animate-ping opacity-20" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStepper;
