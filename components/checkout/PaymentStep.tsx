import { motion } from "framer-motion";
import { useState } from "react";

interface PaymentStepProps {
  onBack: () => void;
  onComplete: () => void;
}

export function PaymentStep({ onBack, onComplete }: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onComplete();
    setIsProcessing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div>
        <h3 className="text-lg font-medium text-vintage-black">Payment Details</h3>
        <p className="mt-1 text-sm text-vintage-grey">
          Complete your purchase securely
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-vintage-black">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            placeholder="4242 4242 4242 4242"
            className="mt-1 block w-full rounded-md border-sand-300 shadow-sm focus:border-vintage-black focus:ring-vintage-black sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-vintage-black">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiry"
              placeholder="MM/YY"
              className="mt-1 block w-full rounded-md border-sand-300 shadow-sm focus:border-vintage-black focus:ring-vintage-black sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="cvc" className="block text-sm font-medium text-vintage-black">
              CVC
            </label>
            <input
              type="text"
              id="cvc"
              placeholder="123"
              className="mt-1 block w-full rounded-md border-sand-300 shadow-sm focus:border-vintage-black focus:ring-vintage-black sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="inline-flex justify-center rounded-md border border-sand-300 bg-sand-50 px-4 py-2 text-sm font-medium text-vintage-black shadow-sm hover:bg-sand-100 focus:outline-none focus:ring-2 focus:ring-vintage-black focus:ring-offset-2 disabled:opacity-50"
          >
            Back to Review
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isProcessing}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-vintage-black px-4 py-2 text-sm font-medium text-sand-50 shadow-sm hover:bg-vintage-black/90 focus:outline-none focus:ring-2 focus:ring-vintage-black focus:ring-offset-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-sand-50 border-t-transparent"></div>
                Processing...
              </>
            ) : (
              'Complete Purchase'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
