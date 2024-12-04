import { useCartStore } from "@/store/cartStore";
import { formatEuroPrice } from "@/utils/formatters";
import { motion } from "framer-motion";
import Image from "next/image";

interface OrderReviewProps {
  shippingData: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  onBack: () => void;
  onNext: () => void;
}

export function OrderReview({ shippingData, onBack, onNext }: OrderReviewProps) {
  const cart = useCartStore(state => state.items);
  const total = useCartStore(state => state.total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div>
        <h3 className="text-lg font-medium text-vintage-black">Order Summary</h3>
        <div className="mt-4 space-y-4">
          {cart.map((item) => (
            <div key={item.variant_id} className="flex items-center space-x-4">
              <div className="relative h-20 w-20 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-vintage-black">{item.name}</p>
                <p className="text-sm text-vintage-grey">Quantity: {item.quantity}</p>
                <p className="text-sm text-vintage-grey">{formatEuroPrice(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-vintage-black">Shipping Details</h3>
        <div className="mt-4 rounded-md bg-sand-50 p-4">
          <p className="text-vintage-black">
            {shippingData.firstName} {shippingData.lastName}
          </p>
          <p className="text-vintage-grey">{shippingData.email}</p>
          <p className="text-vintage-grey">{shippingData.address}</p>
          <p className="text-vintage-grey">
            {shippingData.city}, {shippingData.postalCode}
          </p>
          <p className="text-vintage-grey">{shippingData.country}</p>
        </div>
      </div>

      <div className="border-t border-sand-200 pt-4">
        <div className="flex justify-between">
          <p className="text-base font-medium text-vintage-black">Total</p>
          <p className="text-base font-medium text-vintage-black">
            {formatEuroPrice(total)}
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onBack}
          className="inline-flex justify-center rounded-md border border-sand-300 bg-sand-50 px-4 py-2 text-sm font-medium text-vintage-black shadow-sm hover:bg-sand-100 focus:outline-none focus:ring-2 focus:ring-vintage-black focus:ring-offset-2"
        >
          Back to Shipping
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onNext}
          className="inline-flex justify-center rounded-md border border-transparent bg-vintage-black px-4 py-2 text-sm font-medium text-sand-50 shadow-sm hover:bg-vintage-black/90 focus:outline-none focus:ring-2 focus:ring-vintage-black focus:ring-offset-2"
        >
          Continue to Payment
        </motion.button>
      </div>
    </motion.div>
  );
}
