import { useState } from "react";
import { motion } from "framer-motion";

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
}

export function ShippingForm({ onSubmit }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-vintage-black">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-sand-300 shadow-sm focus:border-vintage-black focus:ring-vintage-black sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-vintage-black">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-sand-300 shadow-sm focus:border-vintage-black focus:ring-vintage-black sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-vintage-black">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-sand-300 shadow-sm focus:border-vintage-black focus:ring-vintage-black sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-vintage-black">
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-sand-300 shadow-sm focus:border-vintage-black focus:ring-vintage-black sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-vintage-black">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-sand-300 shadow-sm focus:border-vintage-black focus:ring-vintage-black sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-vintage-black">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-sand-300 shadow-sm focus:border-vintage-black focus:ring-vintage-black sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-vintage-black">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-sand-300 shadow-sm focus:border-vintage-black focus:ring-vintage-black sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-vintage-black px-4 py-2 text-sm font-medium text-sand-50 shadow-sm hover:bg-vintage-black/90 focus:outline-none focus:ring-2 focus:ring-vintage-black focus:ring-offset-2"
        >
          Continue to Review
        </motion.button>
      </div>
    </motion.form>
  );
}
